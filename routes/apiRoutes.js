const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware'); // Multer config
const appCtrl = require('../controllers/appController');
const adminCtrl = require('../controllers/adminController');
const internCtrl = require('../controllers/internController');
const auth = require('../middleware/authMiddleware');

// --- Public ---
router.post('/apply', upload.single('loi'), appCtrl.submitApplication);
router.get('/applications', appCtrl.listApplications);

// --- Admin ---
router.post('/admin/decision', auth('Admin'), adminCtrl.decideOnFresh);
router.post('/admin/onboard', auth('Admin'), adminCtrl.finalizeOnboarding);
router.get('/admin/dashboard/ongoing', auth('Admin'), adminCtrl.getOngoingInterns);

// --- Intern ---
// Note: 'enroll' is public but secured by the ID in the link/params
router.post('/intern/enroll/:id', upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'sign', maxCount: 1 },
    { name: 'nda', maxCount: 1 }
]), internCtrl.submitEnrollment);

router.post('/intern/report', auth('Intern'), internCtrl.submitDailyReport);

module.exports = router;