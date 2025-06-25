const Campground = require('../models/campground')
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;
const {cloudinary} = require("../cloudinary")

const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

module.exports.index = async (req, res)=>{
    const { q } = req.query;
    let safeQuery = ''
if(q) safeQuery = escapeRegex(q);

let campgrounds = await Campground.find({
    $or: [
        // { title: new RegExp(safeQuery, 'i') },
        // { description: new RegExp(safeQuery, 'i') },
        { location: new RegExp(safeQuery, 'i') }
      ]
})


  if (q) {
    // Example: simple name-based search
    campgrounds = await Campground.find({
        $or: [
          { title: new RegExp(q, 'i') },
          { description: new RegExp(q, 'i') },
          { location: new RegExp(q, 'i') }
        ]
      });
  } else {
    campgrounds = await Campground.find({});
  }

  res.render('campgrounds/index', { campgrounds, query: q });
    // const campgrounds = await Campground.find({})
    // res.render('campgrounds/index', {campgrounds})
}

module.exports.renderNewForm = (req, res)=>{
    res.render('campgrounds/new')
}

module.exports.createCampground = async(req, res) =>{
        //if(!req.body.campground) throw new ExpressError('Invalid Campground', 404)
        const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
        const campground = new Campground(req.body.campground);
        campground.geometry = geoData.features[0].geometry;
        campground.images = req.files.map(f => ({
            url : f.path,
            filename : f.filename
        }))
        campground.author = req.user._id
        await campground.save()
        console.log(campground)
        req.flash('success', 'Successfully made a new campground!')
        res.redirect(`/campgrounds/${campground._id}`)
    }

module.exports.showCampground = async (req, res)=>{
        const {id} = req.params
        const camp = await Campground.findById(id).populate({
            path : 'reviews',
            populate : {
                path : 'author' //author of review
            }
        }).populate('author') //author of campground
        // console.log(camp.author)
        if(!camp){
            req.flash('error', 'Cannot find campground!')
            return res.redirect('/campgrounds')
        }
        res.render('campgrounds/show', {camp})
    }

module.exports.renderEditForm = async (req, res)=>{
        const {id} = req.params
        const campground = await Campground.findById(id)
        if(!campground){
            req.flash('error', 'Cannot find campground!')
             return res.redirect('/campgrounds')
        }
        res.render('campgrounds/edit', {campground})
    }

module.exports.updateCampground = async(req, res)=>{
            const {id} = req.params
            // console.log(req.body)
            // deleteImages: [ 'YelpCamp/earellbvq7wzpcditeqa', 'YelpCamp/t8sjoyf1abhpaaquetyx' ]
            const camp = await Campground.findByIdAndUpdate(id, {...req.body.campground}, {runValidators : true})
            const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
            camp.geometry = geoData.features[0].geometry;
            const imgs = req.files.map(f => ({
                url : f.path,
                filename : f.filename
            }))
            camp.images.push(...imgs)
            await camp.save()
            if(req.body.deleteImages){
                for(let filename of req.body.deleteImages) {
                    await cloudinary.uploader.destroy(filename)
                }
                await camp.updateOne({$pull : { images : {filename : {$in: req.body.deleteImages}}}}) //deleting from mongo
                // console.log(camp)
            }
            if(!camp){
                req.flash('error', 'Cannot find campground!')
                return res.redirect('/campgrounds')
            }
            req.flash('success', 'Successfully updated campground!')
            res.redirect(`/campgrounds/${id}`)
        }

module.exports.deleteCampground =  async(req, res)=>{
    const {id} = req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted campground!')
    res.redirect(`/campgrounds`)
}
    