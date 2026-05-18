const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const { protect } = require('../middleware/auth');

// ============================================================
// @route   GET /api/employees
// @desc    Get all employees
// @access  Private
// ============================================================
router.get('/', protect, async (req, res) => {
    try {
        const employees = await Employee.find().sort({ createdAt: -1 });
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ============================================================
// @route   GET /api/employees/search?department=Development
// @desc    Search employees by department or name
// @access  Private
// ============================================================
router.get('/search', protect, async (req, res) => {
    try {
        const { department, name, minScore, maxScore } = req.query;
        const filter = {};

        if (department) {
            filter.department = { $regex: department, $options: 'i' };
        }
        if (name) {
            filter.name = { $regex: name, $options: 'i' };
        }
        if (minScore || maxScore) {
            filter.performanceScore = {};
            if (minScore) filter.performanceScore.$gte = Number(minScore);
            if (maxScore) filter.performanceScore.$lte = Number(maxScore);
        }

        const employees = await Employee.find(filter).sort({ performanceScore: -1 });
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ============================================================
// @route   POST /api/employees
// @desc    Add a new employee
// @access  Private
// Sample Body:
// {
//   "name": "Aman Verma",
//   "email": "aman@gmail.com",
//   "department": "Development",
//   "skills": ["React", "Node.js", "MongoDB"],
//   "performanceScore": 85,
//   "experience": 3
// }
// ============================================================
router.post('/', protect, async (req, res) => {
    const { name, email, department, skills, performanceScore, experience } = req.body;

    // Validation
    if (!name || !email || !department || !skills || performanceScore === undefined || experience === undefined) {
        return res.status(400).json({ message: 'All fields are required: name, email, department, skills, performanceScore, experience' });
    }
    if (performanceScore < 0 || performanceScore > 100) {
        return res.status(400).json({ message: 'Performance score must be between 0 and 100' });
    }

    try {
        // Check for duplicate email
        const existing = await Employee.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'An employee with this email already exists' });
        }

        const employee = new Employee({ name, email, department, skills, performanceScore, experience });
        const created = await employee.save();
        res.status(201).json({ message: 'Employee stored successfully', employee: created });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ message: 'Validation error', errors: messages });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ============================================================
// @route   GET /api/employees/:id
// @desc    Get employee by ID
// @access  Private
// ============================================================
router.get('/:id', protect, async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (employee) {
            res.json(employee);
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ============================================================
// @route   PUT /api/employees/:id
// @desc    Update employee (update performance score, etc.)
// @access  Private
// ============================================================
router.put('/:id', protect, async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const { name, email, department, skills, performanceScore, experience, aiRecommendation } = req.body;

        if (name !== undefined) employee.name = name;
        if (email !== undefined) employee.email = email;
        if (department !== undefined) employee.department = department;
        if (skills !== undefined) employee.skills = skills;
        if (performanceScore !== undefined) employee.performanceScore = performanceScore;
        if (experience !== undefined) employee.experience = experience;
        if (aiRecommendation !== undefined) employee.aiRecommendation = aiRecommendation;

        const updated = await employee.save();
        res.json({ message: 'Updated data shown', employee: updated });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ message: 'Validation error', errors: messages });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ============================================================
// @route   DELETE /api/employees/:id
// @desc    Delete employee
// @access  Private
// ============================================================
router.delete('/:id', protect, async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        await employee.deleteOne();
        res.json({ message: 'Employee removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
