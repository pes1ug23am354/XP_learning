package com.rewardplatform.model;

public class CodingTask extends Task {
    private String requiredKeyword;

    public CodingTask(int id, String title, int maxPoints, int passingScore, String requiredKeyword) {
        super(id, title, maxPoints, passingScore);
        this.requiredKeyword = requiredKeyword;
    }

    @Override
    public int evaluateTask(String answer) {
        if (answer != null && answer.toLowerCase().contains(requiredKeyword.toLowerCase())) {
            return 85;
        }
        return 40;
    }
}
