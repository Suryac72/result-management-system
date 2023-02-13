const router = require('express').Router()
const sequelize = require('../utils/database');
const { DataTypes } = require("sequelize")
const Student = require('../models/student')(sequelize, DataTypes);
const passport = require('passport')
const { check, validationResult } = require('express-validator');
const connectEnsureLogin = require('connect-ensure-login');
const { roles } = require('../utils/constants');
const Result = require('../models/result');
router.get('/login', async (req, res, next) => {
  res.render('student-login');
});

router.get('/logout', function(req, res, next) {
  req.logout(function() {
    res.redirect('/');    
  });
});

router.get('/signup', async (req, res, next) => {
  res.render('student-register');
});


router.post('/login', passport.authenticate('student-local',{
  //successRedirect :"/user/profile",
  successReturnToOrRedirect: '/student/dashboard',
  failureRedirect: "/student/login",
  failureFlash: true,
},

));

router.post('/signup',  [
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
                res.render('student-register', {
                    email: req.body.email,
                    name: req.body.name,
                    messages: req.flash(),
                })
                return;
            }
            const doesExist = await Student.findOne({ where: { email: req.body.email } });
            if (doesExist) {
                req.flash('warning', 'Username/email already exists');
                res.redirect('/student/signup');
                return;
            }
            const user = new Student(req.body);
            console.log(user);
            sequelize.sync()
                .then((result) => {
                    Student.create({ name: req.body.name, email: req.body.email,
                         password: req.body.password});
                    req.flash('success',`${user.email} registered successfully`)
                    res.redirect('/student/login');
                })
                .catch((error) => {
                    console.log(error);
                    //res.redirect('/auth/error');
                })
        }
        catch (error) {
            console.log(error);
            //res.redirect('/auth/error');
        }

    })

router.post('/dashboard',async(req,res,next) =>{
     try{
        const result = await Result.findOne({where:{studentRollNo:req.body.rollno,studentRollNo:req.body.rollno}});
          
        if(result){
            req.flash('success', 'Result View');
            res.render('result',{result});
            return;
        }
     }catch(err){
        req.flash('error','No Result found');
        res.redirect('/student/dashboard');
        console.log(err);
     }
})
    

module.exports = router;

