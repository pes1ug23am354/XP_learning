package com.rewardplatform.model;

public class Progress {
    private int userId;
    private int courseId;
    private int completedTasks;
    private int totalTasks;
    private double completionPercent;

    public Progress(int userId, int courseId, int totalTasks) {
        this.userId = userId;
        this.courseId = courseId;
        this.totalTasks = totalTasks;
        this.completedTasks = 0;
        this.completionPercent = 0.0;
    }

    public int getUserId() {
        return userId;
    }

    public int getCourseId() {
        return courseId;
    }

    public int getCompletedTasks() {
        return completedTasks;
    }

    public int getTotalTasks() {
        return totalTasks;
    }

    public double getCompletionPercent() {
        return completionPercent;
    }

    public void updateProgress(boolean taskPassed) {
        if (taskPassed) {
            completedTasks += 1;
        }

        if (totalTasks == 0) {
            completionPercent = 0.0;
        } else {
            completionPercent = ((double) completedTasks / totalTasks) * 100.0;
        }
    }

    @Override
    public String toString() {
        return "Progress{userId=" + userId + ", courseId=" + courseId + ", completedTasks=" + completedTasks +
                ", totalTasks=" + totalTasks + ", completionPercent=" + String.format("%.2f", completionPercent) + "}";
    }
}
