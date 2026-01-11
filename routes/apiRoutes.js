const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const appCtrl = require('../controllers/appController');
const adminCtrl = require('../controllers/adminController');
const internCtrl = require('../controllers/internController');
const authCtrl = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

// ==================== PUBLIC ROUTES ====================

// Application submission
router.post('/apply', upload.single('loi'), appCtrl.submitApplication);

// Login (for both admin and intern)
router.post('/login', authCtrl.login);

// Enrollment form (public but secured by ID in link)
router.get('/enroll/:id', internCtrl.getEnrollmentForm);
router.post('/enroll/:id', upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'sign', maxCount: 1 },
    { name: 'nda', maxCount: 1 }
]), internCtrl.submitEnrollment);

// ==================== ADMIN ROUTES ====================

// Dashboard - Get all tabs
router.get('/admin/dashboard/fresh', auth('Admin'), adminCtrl.getFreshApplications);
router.get('/admin/dashboard/pending', auth('Admin'), adminCtrl.getPendingApplications);
router.get('/admin/dashboard/ongoing', auth('Admin'), adminCtrl.getOngoingInterns);
router.get('/admin/dashboard/rejected', auth('Admin'), adminCtrl.getRejectedApplications);
router.get('/admin/dashboard/completed', auth('Admin'), adminCtrl.getCompletedInterns);

// Admin actions
router.post('/admin/decision', auth('Admin'), adminCtrl.decideOnFresh);
router.post('/admin/onboard', auth('Admin'), adminCtrl.finalizeOnboarding);

// Get detailed intern information (for hyperlink click)
router.get('/admin/intern/:id', auth('Admin'), adminCtrl.getInternDetails);

// ==================== INTERN ROUTES ====================

// Intern profile and reports
router.get('/intern/profile', auth('Intern'), internCtrl.getMyProfile);
router.get('/intern/reports', auth('Intern'), internCtrl.getMyReports);
router.post('/intern/report', auth('Intern'), internCtrl.submitDailyReport);

// ==================== AUTH ROUTES ====================

router.post('/logout', authCtrl.logout);

module.exports = router;
