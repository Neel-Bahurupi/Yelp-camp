const express = require('express');
const router = express.Router({mergeParams:true});
const catchAsync = require('../utils/catchAsync');
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const Review = require('../models/reviews');
const {isLoggedIn,isReviewAuthor} = require('../middleware');


//Add review
router.post('/new' ,isLoggedIn, catchAsync( async (req,res,next)=>{
    const camp = await Campground.findById(req.params.id);
    const review = new Review({
        body : req.body.review_body,
        rating : req.body.review_rating
    });
    review.author = req.user._id;
    camp.reviews.push(review);
    await review.save();
    await camp.save();
    
    req.flash('success','Created a review')
    res.redirect(`/campgrounds/${camp._id}`)
}))
//Delete review
router.delete('/:reviewId',isLoggedIn,isReviewAuthor,catchAsync( async (req,res,next)=>{
    const {id,reviewId} = req.params;
    await Campground.findByIdAndUpdate(id,{$pull : {review:reviewId}});
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('success','Successfully delete review')
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router;