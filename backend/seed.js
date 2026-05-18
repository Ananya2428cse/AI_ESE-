const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Employee = require('./models/Employee');

dotenv.config();

const seedData = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        // 1. Clear existing data
        console.log('Clearing existing users and employees...');
        await User.deleteMany({});
        await Employee.deleteMany({});

        // 2. Seed Admin User
        console.log('Seeding Admin user...');
        await User.create({
            name: 'Admin user',
            email: 'admin@gmail.com',
            password: 'admin123',
            role: 'Admin'
        });
        console.log('Admin user seeded: admin@gmail.com / admin123');

        // 3. Seed Employees representing the specified Test Cases:
        // Test Case 1: High performance employee (Promotion Suggestion)
        // Test Case 2: Low score employee (Improvement feedback)
        // Test Case 3: Employee with missing skills (Skill enhancement recommendation)
        // Test Case 4: General employee for ranking / search
        console.log('Seeding Employees...');
        await Employee.create([
            {
                name: 'Aman Verma',
                email: 'aman@gmail.com',
                department: 'Development',
                skills: ['React', 'Node.js', 'MongoDB', 'Express'],
                performanceScore: 95,
                experience: 5,
                aiRecommendation: '### Promotion Recommendation\nBased on Aman\'s high performance score of 95/100 and 5 years of experience, he is highly ready for a promotion to Senior Full Stack Developer.\n\n### Employee Ranking\nRanking: 9.5/10. Exceptional output, comprehensive skillset (React, Node.js, MongoDB), and steady career progression.\n\n### Training Suggestions\nFocus on advanced System Design, Cloud Architecture (AWS/GCP), and Leadership/Mentorship skills.\n\n### AI Feedback\nAman is a highly valuable team member. His productivity is stellar and his technical execution is exemplary.'
            },
            {
                name: 'Rohan Sharma',
                email: 'rohan@gmail.com',
                department: 'Marketing',
                skills: ['SEO', 'Google Ads'],
                performanceScore: 45,
                experience: 2,
                aiRecommendation: '### Promotion Recommendation\nNot recommended for promotion at this time. Rohan should focus on stabilizing performance metrics in his current role.\n\n### Employee Ranking\nRanking: 4.5/10. Underperforming in core marketing campaigns. Requires structured intervention.\n\n### Training Suggestions\nEnroll in advanced marketing analytics courses, campaign design workshops, and performance measurement bootcamps.\n\n### AI Feedback\nRohan shows promise but is currently struggling to hit productivity targets. Needs regular feedback and a performance improvement plan.'
            },
            {
                name: 'Priya Patel',
                email: 'priya@gmail.com',
                department: 'Development',
                skills: ['HTML', 'CSS'], // Missing key full-stack skills like React, Node.js, MongoDB
                performanceScore: 70,
                experience: 1,
                aiRecommendation: '### Promotion Recommendation\nPriya is a junior employee and requires more experience and skill acquisition before promotion consideration.\n\n### Employee Ranking\nRanking: 7/10. Good core fundamentals but limited by modern full-stack developer capabilities.\n\n### Training Suggestions\nUrgent training needed in modern JS frameworks (React), backend technologies (Node.js/Express), and Database systems (MongoDB).\n\n### AI Feedback\nPriya is enthusiastic and completes basic web layout tasks effectively. However, her impact is constrained by her current narrow skillset.'
            },
            {
                name: 'Karan Malhotra',
                email: 'karan@gmail.com',
                department: 'Design',
                skills: ['Figma', 'UI/UX', 'Illustrator'],
                performanceScore: 82,
                experience: 3
            }
        ]);
        console.log('Employees seeded successfully.');

        mongoose.connection.close();
        console.log('Seed completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
};

seedData();
