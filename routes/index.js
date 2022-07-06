const { ImageTag } = require('cloudinary-core');
const express = require('express')
const router = express.Router()
const Plant = require('../models/plant')
const cloudinary = require('../utils/cloudinary')
const User = require('../models/user')
const passport = require('passport');
const bcrypt = require('bcrypt')


router.get('/', async (req, res) => {
    let plants;
    let plantsImageTags;
    try {
        plants = await Plant.aggregate([
            {$sample: {size: 10}}
        ], function (err, docs) {
            return docs
        })
        plantsImageTags = await Promise.all(plants.map(async plant => {
            const imageTag = await createImageTag(plant.CloudinaryId);
            return imageTag;
        }))
    } catch {
        console.log("oops! error")
        plants = []
    }
    res.render('index', { plants: plants, plantsImageTags: plantsImageTags })
});

router.get("/sign-up", (req, res) => res.render("sign-up-form"));
router.get("/log-in", (req, res) => res.render("log-in-form"));

router.post("/sign-up", (req, res, next) => {
    bcrypt.hash("somePassword", 10, (err, hashedPassword) => {
        if (err) {
            console.log(err)
            res.redirect("/sign-up")
        } else {
            const user = new User({
                username: req.body.username,
                password: hashedPassword
              }).save(err => {
                if (err) { 
                  return next(err);
                }
                res.redirect("/");
              });          
        }
      });
  });

router.post(
    "/log-in",
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/"
    })
  );

router.get("/log-out", (req, res) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  });
  
  
async function createImageTag (publicId) {
    // Create an image tag with transformations applied to the src URL
    let imageTag = cloudinary.image(publicId, {
        transformation: [
          { width: 200, height: 200, crop: 'thumb' }, // check this out for more options: https://cloudinary.com/documentation/node_quickstart
        ],
      });
      return imageTag
  };

module.exports = router;