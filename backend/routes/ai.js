const express = require('express');
const router = express.Router();
const axios = require('axios');
const Employee = require('../models/Employee');
const { protect } = require('../middleware/auth');

/**
 * Helper: Build AI prompt from employee data
 */
const buildPrompt = (employees) => {
    if (employees.length === 1) {
        const e = employees[0];
        return `
You are an expert HR AI analyst. Analyze the following employee data and provide:
1. Promotion Recommendation (is this employee ready for promotion?)
2. Employee Ranking (rate performance on a scale of 1-10 with justification)
3. Training Suggestions (specific courses/skills to develop)
4. AI Feedback (overall professional feedback)

Employee Details:
- Name: ${e.name}
- Department: ${e.department}
- Skills: ${e.skills.join(', ')}
- Performance Score: ${e.performanceScore}/100
- Years of Experience: ${e.experience}

Provide structured, concise feedback in 4 clear sections with headings. Be specific and actionable.
        `.trim();
    } else {
        const empList = employees.map((e, i) =>
            `${i + 1}. ${e.name} | Dept: ${e.department} | Score: ${e.performanceScore}/100 | Experience: ${e.experience} yrs | Skills: ${e.skills.join(', ')}`
        ).join('\n');
        return `
You are an expert HR AI analyst. Analyze the following employees and provide:
1. Ranked Recommendations (rank all employees from best to lowest performer with brief reason)
2. Top Performer Promotion Suggestion
3. Training Suggestions for underperformers
4. Team-level AI Feedback

Employees:
${empList}

Provide a structured analysis with clear headings.
        `.trim();
    }
};

// ============================================================
// @route   POST /api/ai/recommend
// @desc    Get AI recommendations for one or multiple employees
// @access  Private
// Body: { employeeId: "id" } OR { employeeIds: ["id1","id2"] }
// ============================================================
router.post('/recommend', protect, async (req, res) => {
    try {
        const { employeeId, employeeIds } = req.body;

        let employees = [];

        if (employeeIds && Array.isArray(employeeIds) && employeeIds.length > 0) {
            // Multiple employees ranking
            employees = await Employee.find({ _id: { $in: employeeIds } });
        } else if (employeeId) {
            // Single employee
            const emp = await Employee.findById(employeeId);
            if (!emp) return res.status(404).json({ message: 'Employee not found' });
            employees = [emp];
        } else {
            return res.status(400).json({ message: 'Provide employeeId or employeeIds' });
        }

        if (employees.length === 0) {
            return res.status(404).json({ message: 'No employees found' });
        }

        const prompt = buildPrompt(employees);

        // Call OpenRouter API
        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'openai/gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 800
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'HTTP-Referer': 'http://localhost:5000',
                    'X-Title': 'AI Employee Performance System',
                    'Content-Type': 'application/json'
                }
            }
        );

        const recommendation = response.data.choices[0].message.content;

        // Save AI recommendation back to employee record(s)
        if (employees.length === 1) {
            employees[0].aiRecommendation = recommendation;
            await employees[0].save();
        }

        res.json({
            recommendation,
            employeesAnalyzed: employees.map(e => ({ id: e._id, name: e.name, performanceScore: e.performanceScore }))
        });
    } catch (error) {
        console.error('AI API Error:', error.response ? error.response.data : error.message);
        res.status(500).json({
            message: 'Error generating AI recommendation',
            error: error.response ? error.response.data : error.message
        });
    }
});

// ============================================================
// @route   POST /api/ai/recommend/:id   (kept for backward compat)
// @desc    Get AI recommendation for a single employee by ID
// @access  Private
// ============================================================
router.post('/recommend/:id', protect, async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        const prompt = buildPrompt([employee]);

        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'openai/gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 800
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'HTTP-Referer': 'http://localhost:5000',
                    'X-Title': 'AI Employee Performance System',
                    'Content-Type': 'application/json'
                }
            }
        );

        const recommendation = response.data.choices[0].message.content;
        employee.aiRecommendation = recommendation;
        await employee.save();

        res.json({ recommendation });
    } catch (error) {
        console.error('AI API Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Error generating recommendation', error: error.message });
    }
});

module.exports = router;
