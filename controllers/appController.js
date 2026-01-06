const { Intern } = require('../models');
const { validateMagicNumber } = require('../utils/fileValidator');

exports.submitApplication = async (req, res) => {
    try {
        // 1. Check Magic Number
        if (!validateMagicNumber(req.file.path, ['pdf'])) {
            return res.status(400).json({ error: "Security Alert: Invalid PDF format." });
        }

        // 2. Create Record
        await Intern.create({
            fullName: req.body.fullName,
            enrollmentNo: req.body.enrollmentNo,
            personalEmail: req.body.email,
            mobileNo: req.body.mobile,
            loiFile: req.file.path,
            status: 'Fresh',
            role: 'Intern_applied'
        });

        res.status(201).json({ message: "Application submitted successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.listApplications = async (req, res) => {
    try {
        const interns = await Intern.findAll({
            where: { status: 'Fresh' },
            order: [['createdAt', 'DESC']]
        });

        res.json(interns);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};