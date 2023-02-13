const router = require('express').Router()
const sequelize = require('../utils/database');
const { DataTypes } = require("sequelize")
const Teacher = require('../models/teacher')(sequelize, DataTypes);
const passport = require('passport')
const { check, validationResult } = require('express-validator');
const connectEnsureLogin = require('connect-ensure-login');
const { roles } = require('../utils/constants');

router.get('/login', async (req, res, next) => {
    res.render('teacher-login');
});

router.get('/logout', connectEnsureLogin.ensureLoggedIn({ redirectTo: '/' }), function (req, res, next) {
    req.logout(function () {
        res.redirect('/');
    });
});

router.get('/signup',async (req, res, next) => {
    res.render('teacher-register');
});


router.post('/login', passport.authenticate('teacher-local', {
    //successRedirect :"/teacher/dashboard",
    successReturnToOrRedirect: '/dashboard',
    failureRedirect: "/teacher/login",
    failureFlash: true,
},

));



router.post('/signup',connectEnsureLogin.ensureLoggedOut({redirectTo:'/'}), [
    check('email', 'Email length should be 10 to 30 characters')
        .isEmail().isLength({ min: 10, max: 30 }),
    check('name', 'Name length should be 10 to 20 characters')
        .isLength({ min: 10, max: 20 }),
    check('password', 'Password length should be 8 to 10 characters')
        .isLength({ min: 8, max: 10 }),
    check('password2').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }
        return true;
    }),
],
    async (req, res, next) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                errors.array().forEach(error => {
                    req.flash('error', error.msg)
                })
                res.render('teacher-register', {
                    email: req.body.email,
                    name: req.body.name,
                    messages: req.flash(),
                })
                return;
            }
            const doesExist = await Teacher.findOne({ where: { email: req.body.email } });
            if (doesExist) {
                req.flash('warning', 'Username/email already exists');
                res.redirect('/teacher/signup');
                return;
            }
            const user = new Teacher(req.body);
            console.log(user);
            sequelize.sync()
                .then((result) => {
                    Teacher.create({
                        name: req.body.name, email: req.body.email,
                        password: req.body.password
                    });
                    req.flash('success', `${user.email} registered successfully`)
                    res.redirect('/teacher/login');
                })
                .catch((error) => {
                    console.log(error);
                    res.redirect('/teacher/login');
                })
        }
        catch (error) {
            console.log(error);
            res.redirect('/teacher/error');
        }

    })




module.exports = router;

