const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');
const router = require('express').Router()
const Result = require('../models/result');
router.get('/',async (req,res,next) =>{
    res.render('index');
})

router.get('/dashboard',async(req,res,next) =>{
    const results = await Result.findAll();
    const user = req.user;
    res.render('teacher-dashboard',{results,user});
})


router.get('/student/dashboard',async(req,res,next) =>{
    res.render('student-dashboard');
})



module.exports = router;