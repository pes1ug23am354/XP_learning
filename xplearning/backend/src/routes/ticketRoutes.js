const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const controller = require('../controllers/ticketController');

const router = express.Router();

router.post('/', requireAuth, controller.createTicketValidators, validate, controller.createTicket);
router.get('/me', requireAuth, controller.myTickets);

router.get('/admin/all', requireAuth, requireAdmin, controller.adminListTickets);
router.patch('/admin/:ticketId', requireAuth, requireAdmin, controller.adminTicketUpdateValidators, validate, controller.adminUpdateTicket);

module.exports = router;
