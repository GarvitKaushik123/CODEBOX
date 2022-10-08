const tempCompany = require('../models/tempCompany.js');
const Company = require('../models/Company.js');
const Offer = require('../models/Offer.js');
const Application = require('../models/Application.js');


const jwt = require('jsonwebtoken');

const fs = require('fs');

const atob = require('atob');

var firebase = require("firebase/app");

var  { getStorage, ref, uploadBytes, uploadString, getDownloadURL } = require("firebase/storage");

const {  getFirestore, collection, addDoc, getDocs, getDoc, doc, deleteDoc } = require("firebase/firestore");

const firebaseConfig = {
};
const app = firebase.initializeApp(firebaseConfig);

const storage = getStorage(app);
const storageRef = ref(storage);
const { Blob } = require("buffer");
const nodemailer = require("nodemailer");
const emailValidator = require('deep-email-validator');
const { isEmail } = require('validator');
const { Collection } = require('mongoose');
const { title } = require('process');


let transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: { 
      user: '',
      pass: '', 
    },
  });

const handleImageError = async (x) => {
  if(!x.includes('/png') && !x.includes('/jpg') && !x.includes('/jpeg') && !x.includes('/svg')){
    throw Error('JPG,PNG,JPEG,SVG file only allowed');
  }
}

const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { name: '', email: '', password: '', tagline: '', startPrice: '', coverImage: '', profilePic: '', category: ''};
  
    // // incorrect email
    if (err.message === 'incorrect email') {
      errors.email = 'That email is not registered';
    }
  
    // // incorrect password
    if (err.message === 'incorrect password') {
      errors.password = 'That password is incorrect';
    }
  
    // // duplicate email error
    if (err.code === 11000) {
      errors.email = 'that email is already registered';
      return errors;
    }
  
    // validation errors
    if (err.message.includes('company validation failed')) {
      // console.log(err);
      Object.values(err.errors).forEach(({ properties }) => {
        errors[properties.path] = properties.message;
      });
    }
    
    if (err.message.includes('offer validation failed')) {
      // console.log(err);
      Object.values(err.errors).forEach(({ properties }) => {
        errors[properties.path] = properties.message;
      });
    }

    if(err.message == 'JPG,PNG,JPEG,SVG file only allowed'){
      errors.coverImage = 'JPG,PNG,JPEG,SVG file only allowed';
    }
  
    return errors;
  }

  const handleErrors_hire = (err) => {
    console.log(err.message, err.code);
    let errors = {profile:'', poster:'', job_description: ''};

    if (err.message.includes('offer validation failed')) {
      Object.values(err.errors).forEach(({ properties }) => {
        errors[properties.path] = properties.message;
      });
    }
  
    return errors;
  }


const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, 'secret_company', {
      expiresIn: maxAge,
    });
  };
  

const upload_company_image_to_firebase_storage = async (companyImagesRef, data) =>{
    const snapshot = await uploadBytes(companyImagesRef, data);
    console.log(snapshot);
    return snapshot.metadata.fullPath;
 }

const upload_tempcompany_to_mongodb = async (name, email, password, tagline, startPrice,  coverImage_path_storage, profilePic_path_storage, category) => {
      try{ 
        const tempcompany = await tempCompany.create({name, email, password, tagline, startPrice, coverImage: coverImage_path_storage, profilePic: profilePic_path_storage, likes: 0, posts: 0, category});
        return {name, email};
      }catch(error){
        const errors = handleErrors(error);
        throw errors;
      }
}

 
const sendAcceptEmail = async (email)=> {
    const mailOptions = {
      from: "",
      to: "",
      subject: "Verify your email",
      html: `<p>Your access is granted.</p>`
    };
    await transporter.sendMail(mailOptions, function(error, info){
      if(error){
        console.log("$$$$$$$$$$$$$$$$");
        console.log(error);
      }else{
        console.log("emailsent");
      }
    });
  
}

const sendRejectEmail = async (email)=> {
    const mailOptions = {
      from: "",
      to: "",
      subject: "Verify your email",
      html: `<p>Your access is rejected.</p>`
    };
    await transporter.sendMail(mailOptions, function(error, info){
      if(error){
        console.log("$$$$$$$$$$$$$$$$");
        console.log(error);
      }else{
        console.log("emailsent");
      }
    });
  
}

module.exports.company_get = (req, res) => {
    res.render('company');
}
  
module.exports.signup_company_get = (req, res) => {
    res.render("signup_company");
}
  
module.exports.signup_company_post = async(req, res) => {
    var {name, coverImage, tagline, category, email, password, country, lat, long, reason} = req.body;
    console.log(reason);
  try{
    // need to check in company collection for images
    console.log(coverImage.split(',')[0]);
    await handleImageError(coverImage.split(',')[0]);

    coverImage = coverImage.split(',')[1]
    coverImagePath = 'images/' + 'coverImage' + `${name}.png`;
    console.log(coverImagePath);
    fs.writeFileSync('./' + coverImagePath,coverImage,'base64');

        var coverImage_Ref = ref(storage, coverImagePath);
        var coverImage_data = new Buffer.from(fs.readFileSync(coverImagePath));
        await upload_company_image_to_firebase_storage(coverImage_Ref, coverImage_data);
        var coverImageUrl = await getDownloadURL(coverImage_Ref); 

    var object = {
      name,
      coverImage: coverImageUrl,
      tagline, 
      category, 
      email, 
      password, 
      country,
      lat,
      long,
      reason,
    }
    var tempcompany = await tempCompany.create(object);
    res.status(200).json({details: tempcompany});
  }catch(error){
    var errors = handleErrors(error);
    res.status(400).json({ errors });  
  }
  
}

module.exports.login_company_get = (req, res) => {
  res.render("login_company");
}

module.exports.login_company_post = async (req, res) => {
  console.log("hello herer");
  const { email, password } = req.body;

  try {
    const company = await Company.login(email, password);  
    const token = createToken(company._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ company: company._id });
  } 
  catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  } 

}
 
module.exports.company_home_get = (req, res) => {
  res.render("company_home");
}
  
module.exports.review_company_request_get = async(req, res) => {
      var tempcompany = await tempCompany.find({});
      console.log(tempcompany);
      tempcompany.forEach((e)=>{
        e.password = undefined;
      })

      // console.log(tempcompany);
      res.locals.tempcompany = tempcompany;
      res.render('review_company_request');
}
   
module.exports.accept_company_post = async(req, res) => {
    // get data corresponding to id form temp_company
    try {
    const {id} = req.body;

    var tempcompany = await tempCompany.find({_id: id});
    console.log(tempcompany[0])
    tempcompany = tempcompany[0];
    // Put data on mongodb - company
    var object = {
      name: tempcompany.name,
      email: tempcompany.email,
      password: tempcompany.password,
      coverImage: tempcompany.coverImage,
      tagline: tempcompany.tagline, 
      category: tempcompany.category,  
      country: tempcompany.country,
      lat: tempcompany.lat,
      long: tempcompany.long,
    }
    var tempcompany = await Company.create(object); 

    // delete from mongodb - tempcompany
    const deleteddoc = await tempCompany.deleteOne({_id: id});
    console.log("deleteddoc: ", deleteddoc);
    await sendAcceptEmail(tempcompany.email);
    res.status(200).json({ accept:true });
    }catch(error){
      console.log(error);
    }
}
  
module.exports.reject_company_post = async(req, res) => {
    // delete data from temp_company
    try{
    const {id} = req.body;
    var tempcompany = await tempCompany.find({_id: id});
    const deleteddoc = await tempCompany.deleteOne({_id: id});
    console.log("deleteddoc: ", deleteddoc);

    await sendRejectEmail(tempcompany.email);
    res.status(200).json({ reject:true });
    }catch(error){
      console.log(error);
    }
  
}
  
module.exports.company_request_screen_get = (req, res) => {
      var detail = req.params.details;
      var details = JSON.parse(detail);
      console.log(details);
      res.locals.details = details;
      res.render('company_request_screen');
}

module.exports.logout_company_get = (req, res) => {
  res.cookie('jwt', '', {maxAge: 1});
  res.redirect('/');
}

module.exports.hire_get = (req, res) => {
  console.log("hello");
  res.render('hire');
}

module.exports.hire_post = async (req, res) => {
  console.log("hello deve");
  console.log(res.locals.company);
  company = res.locals.company;
  var {profile, poster, job_description} = req.body;
try{
  // need to check in company collection for images
  poster = poster.split(',')[1]
  posterPath = 'images/' + 'poster' + `${profile}.png`;
  console.log(posterPath);
  fs.writeFileSync('./' + posterPath,poster,'base64');

      var poster_Ref = ref(storage, posterPath);
      var poster_data = new Buffer.from(fs.readFileSync(posterPath));
      await upload_company_image_to_firebase_storage(poster_Ref, poster_data);
      var posterUrl = await getDownloadURL(poster_Ref); 

      var object = {
        profile: profile,
        poster: posterUrl,
        job_description: job_description,
        company_id: company._id
      }
      var offer = await Offer.create(object);
      res.status(200).json({details: offer});
}catch(error){
  var errors = handleErrors_hire(error);
  console.log(errors);
  res.status(400).json({ errors });  
}

}

module.exports.company_hire_screen_get = (req, res) => {
  var detail = req.params.details;
  console.log(detail);
  var details = JSON.parse(detail);
  console.log("####################################");
  console.log(details);
  res.locals.details = details;
  res.render('company_hire_screen');
}

module.exports.review_applicants_get = async(req, res) => {
  console.log(res.locals.company._id);
  var x = await Application.find({ company_id : res.locals.company._id });
  console.log(x);
  res.locals.applicants = x;
  res.render('review_applicants');
}

module.exports.reject_applicant_post = async(req, res) => {
  var {id} = req.body;
  const deleteddoc = await Application.deleteOne({_id: id});
  res.status(200).json({accept:1});
}