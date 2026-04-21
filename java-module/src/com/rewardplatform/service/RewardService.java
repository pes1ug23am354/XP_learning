package com.rewardplatform.service;

import com.rewardplatform.model.Task;

public class RewardService {
    private int pointsPerPass;
    private int perfectScoreBonus;

    public RewardService(int pointsPerPass, int perfectScoreBonus) {
        this.pointsPerPass = pointsPerPass;
        this.perfectScoreBonus = perfectScoreBonus;
    }

    public int calculateReward(Task task, int score) {
        if (score < task.getPassingScore()) {
            return 0;
        }

        int points = Math.min(pointsPerPass, task.getMaxPoints());
        if (score == 100) {
            points += perfectScoreBonus;
        }
        return points;
    }
}
