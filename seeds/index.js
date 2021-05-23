const mongoose = require('mongoose');
const Campground = require("../models/campground");
const cities = require("./cities");
const {places,descriptors} = require("./seedHelpers");

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

const sample = (array)=> array[Math.floor(Math.random()*array.length)];

const seedDB = async ()=>{
    await Campground.deleteMany({});
    for(let i=0;i<50;i++){
        const random1000 = Math.floor(Math.random()*1000);
        const randomPrice = Math.floor(Math.random()*20) + 10;
        const img = "https://source.unsplash.com/featured/?{camping},{camping}" ;
        const camp = new Campground({
            location:`${cities[random1000].city},${cities[random1000].state}`,
            title : `${sample(descriptors)} ${sample(places)}`,
            image:img,
            description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. Blanditiis voluptate consequatur inventore praesentium molestias aspernatur, et voluptatem aliquam fugit consectetur ut cupiditate debitis nostrum dolore ratione doloribus suscipit dolor eveniet.',
            price:randomPrice,
            author:"60a75d7df802bd138c10f0be"
        })
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
    console.log("Connection closed");
})