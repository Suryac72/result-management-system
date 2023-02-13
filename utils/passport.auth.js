const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const { DataTypes } = require("sequelize")
const sequelize = require('../utils/database');
const User1 = require('../models/teacher')(sequelize, DataTypes);
const User2 = require('../models/student')(sequelize,DataTypes);
passport.use(
    'teacher-local',new LocalStrategy({
        usernameField: "email",
        passwordField: "password",
    }, async (email, password, done) => {
        try {
           const user1 = await User1.findOne({where: {email:email}});
           console.log(user1);
           if (!user1) {
             return done(null, false, { message: "Username/email not registered" });
             }
             const isMatch = await user1.isValidPassword(password);
             return isMatch
          ? done(null,user1)
          : done(null, false, { message: 'Incorrect password' });
        } catch (error) {
            done(error);
        }
    })
);

passport.use(
    'student-local',new LocalStrategy({
        usernameField: "email",
        passwordField: "password",
    }, async (email, password, done) => {
        try {
           const user2 = await User2.findOne({where: {email:email}});
           console.log(user2);
           if (!user2) {
             return done(null, false, { message: "Username/email not registered" });
             }
             const isMatch = await user2.isValidPassword(password);
             return isMatch
          ? done(null,user2)
          : done(null, false, { message: 'Incorrect password' });
        } catch (error) {
            done(error);
        }
    })
);

passport.serializeUser(function(user1, done) {
    done(null, user1.id);
});

passport.deserializeUser(function(id, done) {
    User1.findByPk(id).then(function(user1) { done(null, user1); });
});


passport.serializeUser(function(user2, done) {
    done(null, user2.id);
});

passport.deserializeUser(function(id, done) {
    User2.findByPk(id).then(function(user2) { done(null, user2); });
});