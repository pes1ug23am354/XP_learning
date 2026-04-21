const { body } = require('express-validator');
const { ok, fail } = require('../utils/response');
const { pool } = require('../services/sqlHelpers');

const createTicketValidators = [
  body('title').isLength({ min: 4 }),
  body('category').isIn(['bug', 'content', 'account', 'other']),
  body('priority').isIn(['low', 'medium', 'high']),
  body('message').isLength({ min: 5 }),
];

const adminTicketUpdateValidators = [
  body('reply').optional().isLength({ min: 2 }),
  body('status').optional().isIn(['open', 'resolved']),
];

const normalizeTicket = (row) => ({
  ...row,
  _id: row.id,
  messages: [
    {
      id: `${row.id}-user`,
      sender_role: 'learner',
      sender_name: row.user_full_name || row.full_name || 'Learner',
      message: row.user_message,
      created_at: row.created_at,
    },
    ...(row.admin_reply
      ? [
          {
            id: `${row.id}-admin`,
            sender_role: 'admin',
            sender_name: row.admin_name || 'Admin',
            message: row.admin_reply,
            created_at: row.replied_at || row.updated_at,
          },
        ]
      : []),
  ],
});

const createTicket = async (req, res) => {
  const user = (await pool.query('SELECT full_name FROM users WHERE id=$1', [req.user.id])).rows[0];
  if (!user) return fail(res, 'User not found', 404);

  const { title, category, priority, message } = req.body;

  const created = (
    await pool.query(
      `INSERT INTO tickets (user_id, title, category, priority, status, user_message)
       VALUES ($1,$2,$3,$4,'open',$5)
       RETURNING *`,
      [req.user.id, title, category, priority, message]
    )
  ).rows[0];

  return ok(
    res,
    normalizeTicket({ ...created, user_full_name: user.full_name }),
    'Ticket created',
    201
  );
};

const myTickets = async (req, res) => {
  const rows = (
    await pool.query(
      `SELECT t.*, u.full_name AS user_full_name
       FROM tickets t
       JOIN users u ON u.id=t.user_id
       WHERE t.user_id=$1
       ORDER BY t.updated_at DESC`,
      [req.user.id]
    )
  ).rows;

  return ok(res, rows.map(normalizeTicket));
};

const adminListTickets = async (req, res) => {
  const rows = (
    await pool.query(
      `SELECT t.*, u.full_name AS user_full_name, u.email,
              a.full_name AS admin_name
       FROM tickets t
       JOIN users u ON u.id=t.user_id
       LEFT JOIN users a ON a.id=t.admin_replied_by
       ORDER BY t.updated_at DESC`
    )
  ).rows;

  const tickets = rows.map((row) => ({
    ...normalizeTicket(row),
    user: { fullName: row.user_full_name, email: row.email },
  }));

  return ok(res, tickets);
};

const adminUpdateTicket = async (req, res) => {
  const ticketId = Number(req.params.ticketId);
  if (!Number.isInteger(ticketId)) return fail(res, 'Invalid ticket id', 400);

  const ticket = (await pool.query('SELECT * FROM tickets WHERE id=$1', [ticketId])).rows[0];
  if (!ticket) return fail(res, 'Ticket not found', 404);

  if (ticket.status === 'resolved') {
    return fail(res, 'Resolved tickets cannot be modified', 400);
  }

  const admin = (await pool.query('SELECT full_name FROM users WHERE id=$1', [req.user.id])).rows[0];
  if (!admin) return fail(res, 'Admin user not found', 404);

  const nextStatus = req.body.status || (req.body.reply ? 'open' : ticket.status);
  const resolvedAt = nextStatus === 'resolved' ? 'NOW()' : 'NULL';

  const updated = (
    await pool.query(
      `UPDATE tickets
       SET admin_reply=COALESCE($2, admin_reply),
           admin_replied_by=CASE WHEN $2 IS NOT NULL THEN $3 ELSE admin_replied_by END,
           replied_at=CASE WHEN $2 IS NOT NULL THEN NOW() ELSE replied_at END,
           status=$4,
           resolved_at=${resolvedAt},
           updated_at=NOW()
       WHERE id=$1
       RETURNING *`,
      [ticketId, req.body.reply || null, req.user.id, nextStatus]
    )
  ).rows[0];

  return ok(
    res,
    normalizeTicket({ ...updated, user_full_name: null, admin_name: admin.full_name }),
    'Ticket updated'
  );
};

module.exports = {
  createTicketValidators,
  adminTicketUpdateValidators,
  createTicket,
  myTickets,
  adminListTickets,
  adminUpdateTicket,
};
