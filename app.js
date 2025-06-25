if(process.env.NODE_ENV !== "production"){
    require('dotenv').config()
}


const express = require('express')
const app = express()
app.set('query parser', 'extended');
const path = require('path')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const ExpressError = require('./utils/ExpressError')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const helmet = require('helmet')

const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users')
const MongoStore = require('connect-mongo')
//const mongoSanitize = require('express-mongo-sanitize')
const sanitizeV5 = require('./utils/mongoSanitizeV5.js');

const mongoose = require('mongoose');
const MongoDBStore = require('connect-mongo');
const dbUrl = 'mongodb://127.0.0.1:27017/yelp-camp'

mongoose.connect(dbUrl)
  .then(()=>{
    console.log("mongo connected...")
  })
  .catch((e)=>{
    console.log("mongo error..")
    console.log(e)
  })

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(sanitizeV5({ replaceWith: '_' }));

const store = MongoStore.create({
    mongoUrl : dbUrl, 
    touchAfter : 24 * 60 * 60,
    crypto : {
        secret : 'secret should not be in open but in a env variable'
    }
})

store.on('error', function(e){
    console.log("Session STORE ERROR", e)
})
const sessionConfig = {
    store,
    name : 'session',
    secret : 'secret should not be in open but in a env variable',
    resave : false,
    saveUninitialized : false ,
    cookie : {
        httpOnly : true,
        // secure: true,
        expires : Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge  : 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash())
app.use(helmet())

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/"
];
const connectSrcUrls = [
    "https://api.maptiler.com/"
];

const fontSrcUrls = []

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc : [],
            connectSrc : ["'self'", ...connectSrcUrls],
            scriptSrc : ["'unsafe-inline'","'self'", ...scriptSrcUrls],
            styleSrc : ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc : ["'self'", "blob:"],
            objectSrc : [],
            imgSrc : [
                "'self'", 
                "blob:",
                "data:",
                `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,
                "https://api.maptiler.com/"
            ]
        },
      }),
  );

app.use(passport.initialize())
app.use(passport.session()) //app.use(session should be before
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


app.use((req, res, next)=>{
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    // console.log(req.query)
    next()
})

app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)
app.use('/', userRoutes)
 
app.get('/', (req, res)=>{
    res.render('home')
})

app.all(/(.*)/, (req, res, next)=>{
    next(new ExpressError('Page not found', 404))
})

app.use((err, req, res, next) => {
    const {statusCode = 500 } = err
    if(!err.message) err.message = "Something went wrong..." //default message updating in err object itself instead of descructuring and creating a new variable, since we are passing the err object below thats why updating in obj
    res.status(statusCode).render('error', {err})
})


app.listen(3000, ()=>{
    console.log("listening on port 3000...")
})