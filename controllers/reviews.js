const Campground = require('../models/campground')
const Review = require('../models/review')

module.exports.createReview = async(req, res)=>{
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    review.author = req.user._id
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    req.flash('success', 'Created new review!')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteReview = async(req, res)=>{
    const {id, reviewId} = req.params
    //deleting the refernce in the campground
    await Campground.findByIdAndUpdate(id, { $pull : { reviews : reviewId}}) //we are pulling/deleting from reviews array that has the given reviewId
    //deleting the entire review
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Successfully deleted review!')
    res.redirect(`/campgrounds/${id}`)
}