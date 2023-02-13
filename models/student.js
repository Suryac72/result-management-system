const sequelize = require("../utils/database");
const { roles } = require("../utils/constants");
const { Sequelize, DataTypes } = require('sequelize');
const useBcrypt = require('sequelize-bcrypt');
const bcrypt = require('bcrypt');
module.exports = function (sequelize, Sequelize) {


    const Student = sequelize.define("student", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        role: {
            type: Sequelize.ENUM(roles.teacher, roles.student),
            defaultValue: roles.student,
        }
    },
        {
            hooks: {
                beforeCreate: async (user) => {
                    if(user.email === process.env.ADMIN_EMAIL){
                        user.role = roles.admin;
                    }
                    if (user.password) {
                        const salt = await bcrypt.genSaltSync(10, 'a');
                        user.password = bcrypt.hashSync(user.password, salt);
                    }
                },
                beforeUpdate: async (user) => {
                    if (user.password) {
                        const salt = await bcrypt.genSaltSync(10, 'a');
                        user.password = bcrypt.hashSync(user.password, salt);
                    }
                }
            },
            instanceMethods: {
                validPassword: (password) => {
                    return bcrypt.compareSync(password, this.password);
                }
            }
        });
    Student.prototype.isValidPassword = async function (password) {
        try {
            return await bcrypt.compare(password, this.password);
        } catch (error) {
            throw createHttpError.InternalServerError(error.message);
        }
    };
    return Student;
}
