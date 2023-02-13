const express = require("express");
const morgan = require("morgan");
require('dotenv').config()
const {
    DataTypes
} = require("sequelize")
const sequelize = require("./utils/database");
const Student = require("./models/student")(sequelize, DataTypes);
const Teacher = require("./models/teacher")(sequelize, DataTypes);
const Result = require('./models/result');
const createHttpErrors = require("http-errors");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const connectFlash = require('connect-flash');
const passport = require('passport');
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const connectEnsureLogin = require('connect-ensure-login');
const {
    roles
} = require("./utils/constants");







//Initializing App
const app = express();

//Initializing cookies, session, template-engine etc
app.use(cookieParser());
app.use(morgan('dev'));
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(express.static("assets"));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));




//Init Session :: using express-session package
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true
    },
    store: new SequelizeStore({
        db: sequelize
    }),

}));


//For Passport JS Authentication
app.use(passport.initialize())
app.use(passport.session())
require('./utils/passport.auth')

app.use((req, res, next) => {
    console.log(req.user);
    res.locals.user = req.user;
    next();
})

//Connect Flash for Display Flash Messages
app.use(connectFlash());
app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
})


//Routes
app.use('/', require('./routes/index.route'));
app.use('/result',require('./routes/result.route'));
app.use('/user',require('./routes/user.route'));
app.use('/student',require('./routes/student.route'));
app.use('/teacher',require('./routes/teacher.route'));




//Handle Errors
app.use((req, res, next) => {
    next(createHttpErrors.NotFound());
});


//Error Handler and render 404 view when error hits on server
app.use((error, req, res, next) => {
    error.status = error.status || 500
    console.log(error);
    res.render('error', {
        error
    });
})


//Setting the port
const PORT = process.env.PORT || 3000;



/**
 * SYNC with DATABASE
 * Sync relationship with Entities
 */

Teacher.hasMany(Student);
Teacher.hasMany(Result);

sequelize
    //.sync({force:true})
    .sync()
    .then((result) => {
        console.log(result);
    })
    .catch((err) => {
        console.log(err);
    }).then(() => {
        console.log("connected...");
        //Listening for connections on the defined PORT
        app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
    })
    .catch((err) => console.log(err.message));

function ensureStudent(req, res, next) {
    if (req.user.role === roles.student) {
        next()
    } else {
        req.flash('warning', 'you are not Authorized to access this page');
        res.redirect('/')
    }
}

function ensureTeacher(req, res, next) {
    if (req.user.role === roles.teacher) {
        next();
    } else {
        req.flash('warning', 'you are not Authorized to access this page');
        res.redirect('/')
    }
}
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        next()
    }else{
        res.redirect('/auth/login');
    }
}


/**
 * Ensuring admin can't able to change role of itself
 */