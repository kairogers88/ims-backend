const { Intern, DailyReport } = require('../models');
const { validateMagicNumber } = require('../utils/fileValidator');

exports.submitEnrollment = async (req, res) => {
    const { id } = req.params;
    
    // req.files contains { photo: [], sign: [], nda: [] }
    const photoPath = req.files['photo'][0].path;
    const signPath = req.files['sign'][0].path;
    const ndaPath = req.files['nda'][0].path;

    // Validate Magic Numbers
    const isPhotoValid = validateMagicNumber(photoPath, ['jpg', 'png']);
    const isSignValid = validateMagicNumber(signPath, ['jpg', 'png']);
    const isNdaValid = validateMagicNumber(ndaPath, ['pdf']);

    if (!isPhotoValid || !isSignValid || !isNdaValid) {
        return res.status(400).json({ error: "Invalid file formats detected via signature verification." });
    }

    // Update DB
    await Intern.update({
        ...req.body, // Text fields
        passportPhoto: photoPath,
        eSignature: signPath,
        signedNDA: ndaPath,
        status: 'Pending_Approval' // Sends back to Admin
    }, { where: { id } });

    res.json({ message: "Enrollment submitted." });
};

exports.submitDailyReport = async (req, res) => {
    // req.user comes from JWT Middleware
    await DailyReport.create({
        internId: req.user.id,
        domain: req.body.domain,
        workDescription: req.body.workDescription,
        toolsUsed: req.body.toolsUsed,
        issuesFaced: req.body.issuesFaced,
        reportDate: new Date()
    });

    res.json({ message: "Report logged." });
};