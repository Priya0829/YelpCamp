const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')

//we are not defining username and pwd here, passportLocalMongoose plugin takes care of it

const userSchema = new Schema({
    email : {
        type : String,
        required : true,
        unique :true
    }
})

userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', userSchema)