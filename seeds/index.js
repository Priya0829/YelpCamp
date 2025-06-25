const mongoose = require('mongoose')
const Campground = require('../models/campground')
const cities = require('./cities') //our file 
const {places, descriptors} = require('./seedHelpers')

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
  .then(()=>{
    console.log("mongo connected...")
  })
  .catch((e)=>{
    console.log("mongo error..")
    console.log(e)
  })

const randomElementFromArray = array => array[Math.floor(Math.random() * array.length)]

//empty the db
const seedDb = async () => {
    await Campground.deleteMany({})
    for(let i = 0;i<200;i++){
        const random1000 = Math.floor(Math.random() * 1000)//cux we have 1000 cities in our file
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            //  YOUR USER ID
            author : '685982a31d47f2b17ac31c93',
            title : `${randomElementFromArray(descriptors)} ${randomElementFromArray(places)}`,
            location : `${cities[random1000].city}, ${cities[random1000].state}`,
            images : [
              {
                url: 'https://res.cloudinary.com/duky4cmld/image/upload/v1750767730/YelpCamp/earellbvq7wzpcditeqa.jpg',
                filename: 'YelpCamp/earellbvq7wzpcditeqa'
              },
              {
                url: 'https://res.cloudinary.com/duky4cmld/image/upload/v1750767734/YelpCamp/t8sjoyf1abhpaaquetyx.jpg',
                filename: 'YelpCamp/t8sjoyf1abhpaaquetyx'
              }
            ],
            
            // `https://picsum.photos/600?random=${Math.random()}`,
            description : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
            price,
            geometry : { "type" : "Point", "coordinates" : [cities[random1000].longitude, cities[random1000].latitude]}
        })
        await camp.save();
    }
    
}

seedDb().then(()=>{
    mongoose.connection.close() //close mongodb collection
})