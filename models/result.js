const Sequelize = require('sequelize');

const sequelize = require("../utils/database");

const Result = sequelize.define('result', {

    studentRollNo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    studentName:{
        type: Sequelize.STRING,
        allowNull: false
    },
    dateOfBirth:{
        type: Sequelize.DATE,
        allowNull: false
    },
    score: { 
        type: Sequelize.INTEGER,
        allowNull: false
    }
});
module.exports = Result;