const { Intern, DailyReport } = require('../models');
const sendEmail = require('../utils/emailService');
const crypto = require('crypto');
const { Op } = require('sequelize');

// Tab 1: Fresh Applications
exports.decideOnFresh = async (req, res) => {
    const { id, decision } = req.body; // decision: 'Approved' or 'Rejected'
    const intern = await Intern.findByPk(id);

    if (decision === 'Approved') {
        intern.status = 'Pending_Enrollment';
        await intern.save();
        
        // Send Email
        const link = `https://portal.nfsu.ac.in/enroll/${intern.id}`;
        await sendEmail(intern.personalEmail, "Application Approved", `Complete enrollment here: ${link}`);
    } else {
        intern.status = 'Rejected';
        intern.role = 'Intern_rejected';
        await intern.save();
    }
    res.json({ message: "Status updated" });
};

// Tab 2: Pending (Finalizing Onboarding)
exports.finalizeOnboarding = async (req, res) => {
    const { id, applicationNo, dateOfJoining, dateOfLeaving } = req.body;
    const intern = await Intern.findByPk(id);

    const randomPass = crypto.randomBytes(4).toString('hex'); // Use bcrypt in prod
    
    intern.applicationNo = applicationNo;
    intern.dateOfJoining = dateOfJoining;
    intern.dateOfLeaving = dateOfLeaving;
    intern.password = randomPass; 
    intern.status = 'Active';
    intern.role = 'Intern_approved&ongoing';
    
    await intern.save();

    // Notify Intern
    await sendEmail(intern.personalEmail, "Login Credentials", `User: ${applicationNo} \nPass: ${randomPass}`);
    
    // Notify Dean/CoE Head
    await sendEmail('head.coecs@nfsu.ac.in', "New Intern Onboarded", `Intern ${intern.fullName} joined.`);

    res.json({ message: "Intern Onboarded successfully" });
};

// Tab 3: Ongoing Dashboard (Calculations)
exports.getOngoingInterns = async (req, res) => {
    const interns = await Intern.findAll({
        where: { status: 'Active' },
        include: [{ model: DailyReport, as: 'reports' }] // Eager load reports
    });

    const dashboardData = interns.map(intern => {
        const today = new Date();
        const start = new Date(intern.dateOfJoining);
        
        // Calculate Days Elapsed
        const timeDiff = today - start;
        const daysSinceStart = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        const daysAttended = intern.reports.length;
        
        // Calculate Percentage
        let attendancePct = 0;
        if (daysSinceStart > 0) {
            attendancePct = ((daysAttended / daysSinceStart) * 100).toFixed(1);
        }

        return {
            id: intern.id,
            hyperlinkText: `${intern.applicationNo}-${intern.fullName}`,
            start: intern.dateOfJoining,
            end: intern.dateOfLeaving,
            daysSinceStart,
            daysAttended,
            attendancePct,
            reports: intern.reports // List of daily reports
        };
    });

    res.json(dashboardData);
};