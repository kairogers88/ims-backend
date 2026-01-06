const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Authorization middleware factory.
 * @param {string} requiredRole Role required to access the route
 * @returns Express middleware
 */
const auth = (requiredRole) => {
    return (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Authorization token missing.' });
            }

            const token = authHeader.split(' ')[1];
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            req.user = payload;

            if (requiredRole && payload.role !== requiredRole) {
                return res.status(403).json({ error: 'Insufficient privileges.' });
            }

            next();
        } catch (error) {
            return res.status(401).json({ error: 'Invalid or expired token.' });
        }
    };
};

module.exports = auth;

