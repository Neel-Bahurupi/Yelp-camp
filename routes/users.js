const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync')


router.get('/register',(req, res) => {
    res.render('users/register');
})
router.post('/register',catchAsync(async(req, res) => {
    try{
        const {email,username,password} = req.body;
        const newUser = new User({
            username: username,
            email: email
        });
        const registeredUser = await User.register(newUser,password);
        req.login(registeredUser,err=>{
            if(err){next(err);}
            req.flash('success',"welcome to yelpcamp");
            res.redirect('/campgrounds')
        })  
    }catch(e){
        req.flash('error',e.message);
        res.redirect('/register')
    }
}))

router.get('/login',(req, res)=>{
    res.render('users/login')
})
router.post('/login',passport.authenticate('local',{session:true,failureFlash:true , failureRedirect:"/login"}),(req, res)=>{
    const redirectUrl = req.session.returnTo || '/campgrounds';
    req.flash('success','Welcome back to Yelpcamp');
    res.redirect(redirectUrl);
})

router.get('/logout',(req, res)=>{
    req.logout();
    req.flash('success','Goodbye');
    res.redirect('/campgrounds')
})


module.exports = router;
