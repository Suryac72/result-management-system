const router = require('express').Router()
const { check, validationResult } = require('express-validator');
const sequelize = require('../utils/database');
const Result = require('../models/result');
const date = require('date-and-time')

router.get('/', async (req, res, next) => {
    res.render('index');
})

router.get('/add', async (req, res, next) => {
    res.render('add-record');
})
router.post('/add', [
    check('rollno', 'Rollno length should be 10 digits')
        .isLength({ min: 10 }),
    check('name', 'Name length should be 10 to 20 characters')
        .isLength({ min: 10, max: 20 }),
    check('score', 'score should be under 1000')
        .isLength({ min: 3, max: 4 }),
],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                errors.array().forEach(error => {
                    req.flash('error', error.msg)
                })
                res.render('add-record', {
                    rollno: req.body.rollno,
                    name: req.body.name,
                    dob: req.body.dob,
                    score: req.body.score,
                    messages: req.flash(),
                })
                return;
            }
            const doesExist = await Result.findOne({ where: { studentRollNo: req.body.rollno } });
            console.log(doesExist);
            if (doesExist) {
                req.flash('warning', 'Result already exists');
                res.redirect('/result/add');
                return;
            }
            const user = { rollno: req.body.rollno, name: req.body.name, dob: req.body.dob, score: req.body.score };
            console.log(user);
            sequelize.sync().then(() => {
                console.log('Book table created successfully!');

                Result.create({
                    studentRollNo:req.body.rollno,
                    studentName: req.body.name, 
                    dateOfBirth: req.body.dob,
                    score: req.body.score
                }).then(result => {
                    console.log(result);
                    req.flash('success', `${user.name} result added successfully`)
                    res.redirect('/dashboard');
                }).catch((error) => {
                    console.error('Failed to create a new record : ', error);
                });

            }).catch((error) => {
                console.error('Unable to create table : ', error);
            });
        }
        catch (error) {
            console.log(error);
            res.redirect('/result/add');
        }

    })
router.get('/delete/:id', async (req, res, next) => {
        const result = await Result.destroy({where:{studentRollNo:req.params.id}});
        res.redirect('/dashboard');
})
router.get('/update/:id', async (req, res, next) => {
    const result = await Result.findOne({where:{studentRollNo:req.params.id}});
    res.render('update-result',{result});
})


router.get('/update',async(req,res,next) =>{
    res.render('update-result');
})

router.get('/student-result',async(req,res,next) =>{
    res.render('result');
})

router.post('/update',async(req,res,next) =>{
    const result = await Result.update(
        {
         studentName:req.body.name,
         dateOfBirth:req.body.dob,
         score:req.body.score
        },{where:{studentRollNo:req.body.rollno}});
    res.redirect('/dashboard');
})

module.exports = router;