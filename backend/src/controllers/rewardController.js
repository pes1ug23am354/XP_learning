const { success, failure } = require('../utils/apiResponse');
const rewardModel = require('../models/rewardModel');
const userModel = require('../models/userModel');

const getRewardConfig = async (req, res, next) => {
  try {
    const rule = await rewardModel.getActiveRule();
    return success(res, rule, 'Active reward rule');
  } catch (error) {
    return next(error);
  }
};

const updateRewardConfig = async (req, res, next) => {
  try {
    const updated = await rewardModel.updateRule({
      ...req.body,
      updatedBy: req.user.id,
    });

    return success(res, updated, 'Reward rule updated', 201);
  } catch (error) {
    return next(error);
  }
};

const getCatalog = async (req, res, next) => {
  try {
    const catalog = await rewardModel.listCatalog();
    return success(res, catalog, 'Rewards catalog fetched');
  } catch (error) {
    return next(error);
  }
};

const redeem = async (req, res, next) => {
  try {
    const rewardId = Number(req.params.rewardId);
    const reward = await rewardModel.getCatalogItemById(rewardId);

    if (!reward || !reward.is_active) {
      return failure(res, 'Reward not found', 404);
    }

    if (reward.stock <= 0) {
      return failure(res, 'Reward out of stock', 400);
    }

    const user = await userModel.findById(req.user.id);
    if (user.points_balance < reward.points_cost) {
      return failure(res, 'Insufficient points', 400);
    }

    const updatedStock = await rewardModel.reduceCatalogStock(rewardId);
    if (!updatedStock) {
      return failure(res, 'Reward out of stock', 400);
    }

    const updatedUser = await userModel.deductPoints(req.user.id, reward.points_cost);
    const redemption = await rewardModel.redeemReward({
      userId: req.user.id,
      rewardId,
      pointsSpent: reward.points_cost,
    });

    return success(res, { redemption, pointsBalance: updatedUser.points_balance }, 'Reward redeemed');
  } catch (error) {
    return next(error);
  }
};

const myRedemptions = async (req, res, next) => {
  try {
    const redemptions = await rewardModel.listUserRedemptions(req.user.id);
    return success(res, redemptions, 'Redemptions fetched');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getRewardConfig,
  updateRewardConfig,
  getCatalog,
  redeem,
  myRedemptions,
};
