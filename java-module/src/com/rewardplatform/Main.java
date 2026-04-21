package com.rewardplatform;

import com.rewardplatform.model.CodingTask;
import com.rewardplatform.model.Course;
import com.rewardplatform.model.Progress;
import com.rewardplatform.model.QuizTask;
import com.rewardplatform.model.Reward;
import com.rewardplatform.model.Task;
import com.rewardplatform.model.User;
import com.rewardplatform.service.RewardService;

public class Main {
    public static void main(String[] args) {
        User learner = new User(1, "Priya Student", "priya@rewardlearn.com", "user");
        Course course = new Course(101, "OOAD with Full-Stack", "Learn OOAD and full-stack patterns");

        // Polymorphism: Task reference points to different concrete task types.
        Task quizTask = new QuizTask(1, "Encapsulation Quiz", 20, 60, "Encapsulation");
        Task codingTask = new CodingTask(2, "JWT Practice", 25, 60, "token");

        course.addTask(quizTask);
        course.addTask(codingTask);

        Progress progress = new Progress(learner.getId(), course.getId(), course.getTasks().size());
        RewardService rewardService = new RewardService(10, 10);

        int quizScore = quizTask.evaluateTask("Encapsulation");
        boolean quizPassed = quizScore >= quizTask.getPassingScore();
        int quizPoints = rewardService.calculateReward(quizTask, quizScore);
        learner.addPoints(quizPoints);
        progress.updateProgress(quizPassed);

        int codingScore = codingTask.evaluateTask("This answer includes token and claims validation");
        boolean codingPassed = codingScore >= codingTask.getPassingScore();
        int codingPoints = rewardService.calculateReward(codingTask, codingScore);
        learner.addPoints(codingPoints);
        progress.updateProgress(codingPassed);

        Reward reward = new Reward(1, "Coffee Voucher", 30);
        boolean redeemed = learner.redeemPoints(reward.getPointsCost());

        System.out.println("=== Reward Learning Java Module Demo ===");
        System.out.println(learner);
        System.out.println(progress);
        System.out.println("Quiz score: " + quizScore + ", coding score: " + codingScore);
        System.out.println("Attempted reward redemption: " + reward + ", success=" + redeemed);
    }
}
