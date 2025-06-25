const mongoose = require('mongoose')
const { campgroundSchema } = require('../schemas')
const Schema = mongoose.Schema //just shoetening this phrase
const Review = require('./review')
const { string, required } = require('joi')
const { coordinates } = require('@maptiler/client')

//https://res.cloudinary.com/duky4cmld/image/upload/w_400/v1750770529/YelpCamp/taqcrndsyact4b4iajcz.jpg

const ImageSchema = new Schema({
    url : String,
    filename : String
})

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_300')
})

const opts = { toJSON : {virtuals : true}}

const CampgroundSchema = new Schema({
    title : String,
    images : [ImageSchema],
    geometry : { //THIS WAY WE DECLARE A GEOJSON
        type : {
            type : String,
            enum : ["Point"],
            required : true
        },
        coordinates : {
            type : [Number],
            required : true
        }
    },
    price : Number,
    description : String,
    location : String,
    author : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    }, 
    reviews: [
        {
            type : Schema.Types.ObjectId,
            ref : 'Review'
        }
    ]
}, opts)

CampgroundSchema.virtual('properties.popUpMarkup').get(function(){
    return `<strong><a href = "/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>`
})

CampgroundSchema.post('findOneAndDelete', async function (doc){
    if(doc){
        await Review.deleteMany({
            _id : {
                $in : doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema)