const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const {isLoggedIn} = require('../middleware');
const {isAuthor} = require('../middleware');



router.get('/',async (req,res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
})

// New campground
router.get('/new',isLoggedIn,(req,res)=>{
    res.render('campgrounds/new');
})
router.post('/new',isLoggedIn,async (req,res)=>{
    req.flash('success','Successfully created a campground');
    const newcamp =new Campground(req.body)
    newcamp.author = req.user._id;
    await newcamp.save()
    res.redirect(`/campgrounds/${newcamp._id}`)
    
})

// Details of a campground
router.get('/:id',catchAsync(async (req,res,next)=>{
    const camp = await Campground.findById(req.params.id).populate(
        {path:'reviews',
            populate:{
                path:'author'
            }
        }).populate('author');
    console.log(camp);
    if(!camp){
        req.flash('error','Cannot find a campground');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show',{camp});
}))

// Edit/Update a campground
router.get('/:id/edit',isLoggedIn,async (req,res)=>{
    const camp = await Campground.findById(req.params.id);
    res.render('campgrounds/edit',{camp});
})
router.put('/:id/edit',isLoggedIn,isAuthor,catchAsync( async (req,res,next)=>{
    const camp = await Campground.findByIdAndUpdate(req.params.id , req.body ,{useFindAndModify:false});
    req.flash('success','Edit successful')
    res.redirect(`/campgrounds/${camp._id}`)
}))

// Delete Campground 
router.delete('/:id/delete',isLoggedIn,isAuthor,async (req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndRemove(id,{useFindAndModify:false});
    req.flash('success','Successfully deleted a campground')
    res.redirect('/campgrounds');
})



module.exports = router;