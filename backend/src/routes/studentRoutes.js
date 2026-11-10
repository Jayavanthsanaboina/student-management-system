const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getDepartmentAnalytics,
} = require('../controllers/studentController');

// Aggregation route (Rubric component 4)
router.get('/analytics/department', getDepartmentAnalytics);

// CRUD routes (Rubric component 3)
router.route('/')
  .get(getAllStudents)
  .post(createStudent);

router.route('/:id')
  .get(getStudentById)
  .put(updateStudent)
  .delete(deleteStudent);

module.exports = router;
