const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./reviews');

const CampgroundSchema = new Schema({
    title:String,
    price:Number,
    description:String,
    location:String,
    image:String,
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    reviews : [
        {
            type:Schema.Types.ObjectId,
            ref:'Review'
        }
    ]
})

//middleware for cascade on delete

CampgroundSchema.post('findOneAndRemove',async (doc)=>{
    if(doc){
        await Review.remove({
            _id:{
                $in:doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground',CampgroundSchema);