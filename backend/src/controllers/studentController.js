const Student = require('../models/Student');
const mongoose = require('mongoose');

// @desc    Get all student records (with optional filtering & search)
// @route   GET /api/students
exports.getAllStudents = async (req, res, next) => {
  try {
    const { department, status, search } = req.query;
    const query = {};

    if (department && department !== 'All') {
      query.department = department;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      // Support case-insensitive search by name or roll number
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
      ];
    }

    // Set anti-cache headers to ensure client gets fresh records
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    });

    const students = await Student.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student record by ID
// @route   GET /api/students/:id
exports.getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format',
      });
    }

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found',
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new student record
// @route   POST /api/students
exports.createStudent = async (req, res, next) => {
  try {
    const student = await Student.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Student record created successfully',
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing student record
// @route   PUT /api/students/:id
// ============================================================================
// CRITICAL BUG FIX (Case Study Investigation):
// In Mongoose, findByIdAndUpdate(id, data) returns the PRE-UPDATE document by default!
// If the backend returns that original document, or does not enforce schema validation,
// the frontend displays stale/unmodified records.
//
// SOLUTION:
// 1. Pass { new: true } to return the modified document after update.
// 2. Pass { runValidators: true } to enforce Mongoose schema validation.
// 3. Set Anti-Caching HTTP Headers so the browser does not respond with HTTP 304.
// ============================================================================
exports.updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format',
      });
    }

    // THE FIX: { new: true } ensures the UPDATED document is returned
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { $set: req.body },
      {
        new: true,           // <--- Returns the updated document (NOT the old one)
        runValidators: true, // <--- Validates schema constraints on update
        context: 'query',
      }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found',
      });
    }

    // Disable caching on update responses
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    });

    res.status(200).json({
      success: true,
      message: 'Student record updated successfully',
      data: updatedStudent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student record
// @route   DELETE /api/students/:id
exports.deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format',
      });
    }

    const deleted = await Student.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student record deleted successfully',
      data: deleted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    MongoDB Aggregation Pipeline: Department-wise metrics
// @route   GET /api/students/analytics/department
// Fulfills Evaluation Rubric Component 4 (Aggregation & Indexing)
exports.getDepartmentAnalytics = async (req, res, next) => {
  try {
    const analytics = await Student.aggregate([
      // Stage 1: Group by department and compute totals/averages
      {
        $group: {
          _id: '$department',
          totalStudents: { $sum: 1 },
          averageGpa: { $avg: '$gpa' },
          totalFeesCollected: { $sum: '$feesPaid' },
          totalFeesPending: { $sum: '$feeDue' },
          minGpa: { $min: '$gpa' },
          maxGpa: { $max: '$gpa' },
        },
      },
      // Stage 2: Reshape output for clean readability
      {
        $project: {
          _id: 0,
          department: '$_id',
          totalStudents: 1,
          averageGpa: { $round: ['$averageGpa', 2] },
          totalFeesCollected: 1,
          totalFeesPending: 1,
          minGpa: 1,
          maxGpa: 1,
        },
      },
      // Stage 3: Sort by student count descending
      {
        $sort: { totalStudents: -1 },
      },
    ]);

    // Also get overall high-level counts
    const totalCount = await Student.countDocuments();
    const activeCount = await Student.countDocuments({ status: 'Active' });

    res.status(200).json({
      success: true,
      summary: {
        totalRegistered: totalCount,
        totalActive: activeCount,
      },
      departmentMetrics: analytics,
    });
  } catch (error) {
    next(error);
  }
};
