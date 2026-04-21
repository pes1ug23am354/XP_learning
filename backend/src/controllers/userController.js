const { success, failure } = require('../utils/apiResponse');
const userModel = require('../models/userModel');
const progressModel = require('../models/progressModel');

const getUsers = async (req, res, next) => {
  try {
    const users = await userModel.listUsers();
    return success(res, users, 'Users fetched');
  } catch (error) {
    return next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { role, isActive } = req.body;
    const updated = await userModel.updateUserRole(Number(req.params.id), role, isActive);

    if (!updated) {
      return failure(res, 'User not found', 404);
    }

    return success(res, updated, 'User updated');
  } catch (error) {
    return next(error);
  }
};

const myProgress = async (req, res, next) => {
  try {
    const progress = await progressModel.getUserProgress(req.user.id);
    return success(res, progress, 'Progress fetched');
  } catch (error) {
    return next(error);
  }
};

module.exports = { getUsers, updateUser, myProgress };
