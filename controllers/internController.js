const { Intern, DailyReport } = require('../models');
const { validateMagicNumber } = require('../utils/fileValidator');

/**
 * Get enrollment form data (for viewing the form)
 */
exports.getEnrollmentForm = async (req, res) => {
    try {
        const { id } = req.params;
        
        const intern = await Intern.findByPk(id, {
            attributes: ['id', 'fullName', 'enrollmentNo', 'personalEmail', 'mobileNo', 'status']
        });

        if (!intern) {
            return res.status(404).json({ error: 'Application not found' });
        }

        if (intern.status !== 'Pending_Enrollment') {
            return res.status(400).json({ 
                error: 'Enrollment is not available for this application' 
            });
        }

        res.json({
            id: intern.id,
            fullName: intern.fullName,
            enrollmentNo: intern.enrollmentNo,
            email: intern.personalEmail
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Submit enrollment form
 */
exports.submitEnrollment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.files || !req.files['photo'] || !req.files['sign'] || !req.files['nda']) {
            return res.status(400).json({ 
                error: 'All files (photo, signature, NDA) are required' 
            });
        }

        const intern = await Intern.findByPk(id);
        if (!intern) {
            return res.status(404).json({ error: 'Application not found' });
        }

        if (intern.status !== 'Pending_Enrollment') {
            return res.status(400).json({ 
                error: 'Enrollment is not available for this application' 
            });
        }

        const photoPath = req.files['photo'][0].path;
        const signPath = req.files['sign'][0].path;
        const ndaPath = req.files['nda'][0].path;

        // Validate Magic Numbers
        const isPhotoValid = validateMagicNumber(photoPath, ['jpg', 'png']);
        const isSignValid = validateMagicNumber(signPath, ['jpg', 'png']);
        const isNdaValid = validateMagicNumber(ndaPath, ['pdf']);

        if (!isPhotoValid || !isSignValid || !isNdaValid) {
            return res.status(400).json({ 
                error: 'Invalid file formats detected via signature verification' 
            });
        }

        // Extract form data
        const {
            fullName,
            enrollmentNo,
            semester,
            program,
            department,
            organization,
            contactNo,
            emailAddress,
            gender,
            bloodGroup,
            presentAddress,
            permanentAddress
        } = req.body;

        // Update intern record
        await intern.update({
            fullName: fullName || intern.fullName,
            enrollmentNo: enrollmentNo || intern.enrollmentNo,
            personalEmail: emailAddress || intern.personalEmail,
            mobileNo: contactNo || intern.mobileNo,
            passportPhoto: photoPath,
            semester,
            program,
            department,
            organization,
            gender,
            bloodGroup,
            presentAddress,
            permanentAddress,
            eSignature: signPath,
            signedNDA: ndaPath,
            status: 'Pending_Approval' // Sends back to Admin
        });

        res.json({ message: 'Enrollment submitted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Submit daily status report
 */
exports.submitDailyReport = async (req, res) => {
    try {
        const internId = req.user.id;
        const { domain, workDescription, toolsUsed, issuesFaced } = req.body;

        if (!domain || !workDescription) {
            return res.status(400).json({ 
                error: 'Domain and work description are required' 
            });
        }

        // Get intern details
        const intern = await Intern.findByPk(internId);
        if (!intern) {
            return res.status(404).json({ error: 'Intern not found' });
        }

        if (intern.status !== 'Active' || intern.role !== 'Intern_approved&ongoing') {
            return res.status(403).json({ 
                error: 'You are not authorized to submit reports' 
            });
        }

        // Check if report already exists for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const existingReport = await DailyReport.findOne({
            where: {
                internId,
                reportDate: today
            }
        });

        if (existingReport) {
            return res.status(400).json({ 
                error: 'Daily report already submitted for today' 
            });
        }

        // Create daily report with hardcoded applicationNo and name
        await DailyReport.create({
            internId,
            domain,
            applicationNo: intern.applicationNo, // Hardcoded
            name: intern.fullName, // Hardcoded
            workDescription, // Work description with time
            toolsUsed, // Tools used with time of usage
            issuesFaced, // Issues faced/remarks
            reportDate: today
        });

        res.json({ message: 'Daily report submitted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get intern's own reports
 */
exports.getMyReports = async (req, res) => {
    try {
        const internId = req.user.id;

        const reports = await DailyReport.findAll({
            where: { internId },
            order: [['reportDate', 'DESC']],
            attributes: [
                'id', 'domain', 'applicationNo', 'name', 
                'workDescription', 'toolsUsed', 'issuesFaced', 
                'reportDate', 'createdAt'
            ]
        });

        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get intern's profile
 */
exports.getMyProfile = async (req, res) => {
    try {
        const internId = req.user.id;

        const intern = await Intern.findByPk(internId, {
            attributes: [
                'id', 'fullName', 'enrollmentNo', 'personalEmail', 'mobileNo',
                'applicationNo', 'semester', 'program', 'department', 'organization',
                'gender', 'bloodGroup', 'presentAddress', 'permanentAddress',
                'dateOfJoining', 'dateOfLeaving', 'status', 'role'
            ]
        });

        if (!intern) {
            return res.status(404).json({ error: 'Intern not found' });
        }

        res.json(intern);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
