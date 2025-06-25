const express = require('express')
const router = express.Router({ mergeParams : true}) //campground is was not passed from app.js, this router has seperate params
const catchAsync = require('../utils/catchAsync')
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware')
const reviews = require('../controllers/reviews')


router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router