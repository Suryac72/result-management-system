const { DataTypes } = require("sequelize")
const sequelize = require('../utils/database');
const Student = require('../models/student')(sequelize, DataTypes);
const router = require('express').Router()

router.post('/dashboard',async(req,res,next) =>{
    let user = await Student.findOne({where : {email : req.body.email}});
    let results = null;
    console.log("user is " + user);
    if(user.role === 'TEACHER'){
        results = await Student.findAll();
        res.render('teacher-dashboard',{user,results});
    }
   
})


router.get('/dashboard', async (req, res, next) => {
    res.render('teacher-dashboard');
})

module.exports = router