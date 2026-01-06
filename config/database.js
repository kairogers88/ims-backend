const { Sequelize } = require('sequelize');
require('dotenv').config();

const getEnv = (key, fallback = '') => {
    const value = process.env[key];
    return typeof value === 'string' && value.length > 0 ? value : fallback;
};

const sequelize = new Sequelize(
    getEnv('DB_NAME', 'ims_db'), 
    getEnv('DB_USER', 'postgres'), 
    getEnv('DB_PASS', 'postgresql'),
    {
        host: getEnv('DB_HOST', 'localhost'),
        dialect: 'postgres',
        logging: false // Set to console.log to see raw SQL
    }
);

module.exports = sequelize;