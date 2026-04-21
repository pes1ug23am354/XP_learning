package com.rewardplatform.model;

public abstract class Task {
    private int id;
    private String title;
    private int maxPoints;
    private int passingScore;

    public Task(int id, String title, int maxPoints, int passingScore) {
        this.id = id;
        this.title = title;
        this.maxPoints = maxPoints;
        this.passingScore = passingScore;
    }

    public int getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public int getMaxPoints() {
        return maxPoints;
    }

    public int getPassingScore() {
        return passingScore;
    }

    public abstract int evaluateTask(String answer);
}
