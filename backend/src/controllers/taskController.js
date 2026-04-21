const { success, failure } = require('../utils/apiResponse');
const taskModel = require('../models/taskModel');
const rewardModel = require('../models/rewardModel');
const userModel = require('../models/userModel');
const progressModel = require('../models/progressModel');

const evaluateTask = (task, submittedAnswers) => {
  const selected = submittedAnswers.selectedOption;
  const correct = task.answer_key.correctOption;
  const isCorrect = selected === correct;
  const score = isCorrect ? 100 : 0;
  const passed = score >= task.passing_score;

  return { score, passed, isCorrect };
};

const calculateReward = ({ passed, score, rule, maxPoints, currentStreak }) => {
  if (!passed) {
    return 0;
  }

  let points = Math.min(rule.points_per_pass, maxPoints);

  if (score === 100) {
    points += rule.bonus_for_perfect_score;
  }

  if (currentStreak + 1 >= rule.streak_bonus_threshold) {
    points += rule.streak_bonus_points;
  }

  return Math.min(points, maxPoints + rule.bonus_for_perfect_score + rule.streak_bonus_points);
};

const listTasks = async (req, res, next) => {
  try {
    const tasks = await taskModel.listTasksByCourse(Number(req.params.courseId));
    return success(res, tasks, 'Tasks fetched');
  } catch (error) {
    return next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const task = await taskModel.createTask({
      ...req.body,
      createdBy: req.user.id,
    });

    return success(res, task, 'Task created', 201);
  } catch (error) {
    return next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await taskModel.updateTask(Number(req.params.id), req.body);
    return success(res, task, 'Task updated');
  } catch (error) {
    return next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    await taskModel.deleteTask(Number(req.params.id));
    return success(res, null, 'Task deleted');
  } catch (error) {
    return next(error);
  }
};

const attemptTask = async (req, res, next) => {
  try {
    const taskId = Number(req.params.id);
    const { submittedAnswers } = req.body;

    const task = await taskModel.getTaskById(taskId);
    if (!task) {
      return failure(res, 'Task not found', 404);
    }

    const rule = await rewardModel.getActiveRule();
    const streak = await taskModel.getUserPassStreak(req.user.id);
    const evaluation = evaluateTask(task, submittedAnswers);

    const pointsAwarded = calculateReward({
      passed: evaluation.passed,
      score: evaluation.score,
      rule,
      maxPoints: task.max_points,
      currentStreak: streak,
    });

    const attempt = await taskModel.createAttempt({
      userId: req.user.id,
      taskId,
      submittedAnswers,
      score: evaluation.score,
      passed: evaluation.passed,
      pointsAwarded,
    });

    if (pointsAwarded > 0) {
      await userModel.addPoints(req.user.id, pointsAwarded);
    }

    const progress = await progressModel.recalculateProgress(req.user.id, task.course_id);
    const updatedUser = await userModel.findById(req.user.id);

    return success(res, {
      attempt,
      evaluation,
      pointsAwarded,
      pointsBalance: updatedUser.points_balance,
      progress,
    }, 'Task evaluated successfully');
  } catch (error) {
    return next(error);
  }
};

const myAttempts = async (req, res, next) => {
  try {
    const attempts = await taskModel.getLatestAttemptsByUser(req.user.id, 15);
    return success(res, attempts, 'Recent attempts fetched');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  attemptTask,
  myAttempts,
};
