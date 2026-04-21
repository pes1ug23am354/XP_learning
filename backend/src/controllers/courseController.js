const { success } = require('../utils/apiResponse');
const courseModel = require('../models/courseModel');

const getCourses = async (req, res, next) => {
  try {
    const courses = await courseModel.listCourses();
    return success(res, courses, 'Courses fetched');
  } catch (error) {
    return next(error);
  }
};

const createCourse = async (req, res, next) => {
  try {
    const { title, description, difficulty } = req.body;
    const created = await courseModel.createCourse({
      title,
      description,
      difficulty,
      createdBy: req.user.id,
    });
    return success(res, created, 'Course created', 201);
  } catch (error) {
    return next(error);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const updated = await courseModel.updateCourse(Number(req.params.id), req.body);
    return success(res, updated, 'Course updated');
  } catch (error) {
    return next(error);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    await courseModel.deleteCourse(Number(req.params.id));
    return success(res, null, 'Course deleted');
  } catch (error) {
    return next(error);
  }
};

module.exports = { getCourses, createCourse, updateCourse, deleteCourse };
