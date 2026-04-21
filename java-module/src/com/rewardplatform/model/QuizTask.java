package com.rewardplatform.model;

public class QuizTask extends Task {
    private String correctAnswer;

    public QuizTask(int id, String title, int maxPoints, int passingScore, String correctAnswer) {
        super(id, title, maxPoints, passingScore);
        this.correctAnswer = correctAnswer;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    @Override
    public int evaluateTask(String answer) {
        if (correctAnswer.equalsIgnoreCase(answer)) {
            return 100;
        }
        return 0;
    }
}
