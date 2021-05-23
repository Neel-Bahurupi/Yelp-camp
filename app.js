const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require("./utils/ExpressError");
const morgan = require('morgan');   //http request logger
const methodOverride = require('method-override');  //used for patch, put and delete methods
const User = require('./models/user');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews');
const userRoutes = require('./routes/users')

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true
});

const db = mongoose.connection;
db.on("error",console.error.bind(console,"console error:"));
db.once("open",()=>{
    console.log("Database connected");
})

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

// middleware
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(morgan('tiny'));
app.use(express.static(path.join(__dirname,'public')));
app.use(flash());

// passport middlewares
app.use(session({secret:"notagoodsecret",saveUninitialized:false,resave:false}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const sessionConfig = {
    
    secret:'thisshouldbeabettersecret',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires:Date.now() + 1000*60*60*24*7
    }
}
app.use(session(sessionConfig));
app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.get('/fakeuser',async(req, res) => {
    const user = new User({
        email:'neel@1234',
        username:'neel'
    })
    const newUser = await User.register(user,'1234');
    res.send(newUser);
})

app.use("/campgrounds",campgrounds);
app.use("/campgrounds/:id/review",reviews);
app.use("/",userRoutes)


app.get('/',(req,res)=>{
    res.send('home');
})

app.all("*",(req,res,next)=>{
    next(new ExpressError("Page not found",404))
})
app.use((err,req,res,next)=>{
    const {statusCode = 500 , message = "Error aaya"} = err;
    res.status(statusCode).render("error",{statusCode , message});
})

app.listen(3001,()=>{
    console.log("listening to port 3001");
});