const jwt = require('jsonwebtoken');
const { Intern, Admin } = require('../models');
const { verifyPassword } = require('../utils/passwordService');
require('dotenv').config();

/**
 * Login for both Admin and Intern
 * Admin: username + password
 * Intern: applicationNo (username) + password
 */
exports.login = async (req, res) => {
    try {
        const { username, password, userType } = req.body;

        console.log('Login attempt:', { username, userType, hasPassword: !!password });

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        if (!userType || !['admin', 'intern'].includes(userType)) {
            return res.status(400).json({ error: 'Invalid user type. Must be "admin" or "intern"' });
        }

        let user;
        let role;

        if (userType === 'admin') {
            user = await Admin.findOne({ where: { username } });
            console.log('Admin lookup:', user ? `Found admin ID ${user.id}` : 'Admin not found');
            role = 'Admin';
        } else {
            // Intern login with applicationNo as username
            user = await Intern.findOne({ where: { applicationNo: username } });
            
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Check if intern is approved and active
            if (user.status !== 'Active' || user.role !== 'Intern_approved&ongoing') {
                return res.status(403).json({ 
                    error: 'Your account is not active. Please contact administrator.' 
                });
            }

            role = user.role;
        }

        if (!user) {
            console.log('User not found');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        console.log('Verifying password...');
        const isValidPassword = await verifyPassword(password, user.password);
        console.log('Password verification result:', isValidPassword);
        
        if (!isValidPassword) {
            console.log('Password verification failed');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('Login successful for:', username);

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                username: userType === 'admin' ? user.username : user.applicationNo,
                role: role,
                userType: userType
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Return user info (without password)
        const userInfo = userType === 'admin' 
            ? {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: 'Admin'
            }
            : {
                id: user.id,
                applicationNo: user.applicationNo,
                fullName: user.fullName,
                email: user.personalEmail,
                role: user.role,
                status: user.status
            };

        res.json({
            message: 'Login successful',
            token,
            user: userInfo
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Logout (client-side token removal, but can add token blacklist here)
 */
exports.logout = async (req, res) => {
    // In a stateless JWT system, logout is handled client-side by removing the token
    // For enhanced security, you could implement a token blacklist here
    res.json({ message: 'Logged out successfully' });
};
