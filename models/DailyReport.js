const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DailyReport = sequelize.define('DailyReport', {
    domain: { type: DataTypes.STRING, allowNull: false },
    workDescription: { type: DataTypes.TEXT, allowNull: false },
    toolsUsed: { type: DataTypes.STRING },
    issuesFaced: { type: DataTypes.TEXT },
    reportDate: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW }
}, {
    timestamps: true
});

module.exports = DailyReport;