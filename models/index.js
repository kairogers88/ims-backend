const sequelize = require('../config/database');
const Intern = require('./Intern');
const DailyReport = require('./DailyReport');

// Relation: One Intern has Many Reports
Intern.hasMany(DailyReport, { foreignKey: 'internId', as: 'reports' });
DailyReport.belongsTo(Intern, { foreignKey: 'internId', as: 'intern' });

const initDB = async () => {
    await sequelize.sync({ alter: true }); // Updates table structure if model changes
    console.log("Database Synced");
};

module.exports = { Intern, DailyReport, initDB };