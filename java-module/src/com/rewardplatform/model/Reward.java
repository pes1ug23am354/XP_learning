package com.rewardplatform.model;

public class Reward {
    private int id;
    private String title;
    private int pointsCost;

    public Reward(int id, String title, int pointsCost) {
        this.id = id;
        this.title = title;
        this.pointsCost = pointsCost;
    }

    public int getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public int getPointsCost() {
        return pointsCost;
    }

    @Override
    public String toString() {
        return "Reward{id=" + id + ", title='" + title + "', pointsCost=" + pointsCost + "}";
    }
}
