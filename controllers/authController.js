// General Backend Dependencies Start ---------------------------------------------
const fs = require('fs');

const User = require("../models/User");
const Company = require("../models/Company");
const Question = require('../models/question');
const Topic = require('../models/topic');
const Experience = require("../models/experience");

const jwt = require('jsonwebtoken');
// import jwt from "jsonwebtoken";

const bcrypt = require('bcrypt');

const axios = require("axios");

const multiparty = require('multiparty');

const IMAGE_UPLOAD_DIR = "./images";

const UserOTPVerification = require("../models/UserOTPVerification");

const nodemailer = require("nodemailer");
const emailValidator = require('deep-email-validator');
const { isEmail } = require('validator');

// General Backend Dependencies End---------------------------------------------

// Firebase packages start ---------------------------------------------------
var firebase = require("firebase/app");

var  { getStorage, ref, uploadBytes, uploadString, getDownloadURL } = require("firebase/storage");

const {  getFirestore, collection, addDoc, getDocs, getDoc, doc, deleteDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyBbJ2TVOhxxecf5cvbg1vYm_3NYfjbWz68",
  authDomain: "codebox-63803.firebaseapp.com",
  projectId: "codebox-63803",
  storageBucket: "codebox-63803.appspot.com",
  messagingSenderId: "903557415991",
  appId: "1:903557415991:web:838531915bea186d0fabb2"
};
const app = firebase.initializeApp(firebaseConfig);

const storage = getStorage(app);
const storageRef = ref(storage);
const { Blob } = require("buffer");
// Firebase App (the core Firebase SDK) is always required and


const { url } = require('inspector');
const { Collection } = require('mongoose');

// Fireebase Packages end --------------------------------------------------

function randomString(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
charactersLength));
 }
 return result;
}

async function isEmailValid(email) {
  return emailValidator.validate(email)
}

let transporter = nodemailer.createTransport({
  service: 'hotmail',
  // host: "",
  // port: 465,
  // secure: true,
  auth: { 
    user: '',
    pass: '', 
  },
  // tls: {
  //   rejectUnauthorized : false
  // }
});


const upload_image_on_firestore_storage = async (image_path) => {
  const ImageRef = ref(storage, image_path);

 var image_storage_path;
 var snapshot = await uploadBytes(ImageRef, data);
 return snapshot.metadata.fullPath;
}

const handleErrors_Pic = (err) => {
  let errors = {image: ''};
  if(err.message == 'JPG,PNG,JPEG,SVG file only allowed'){
    errors.image = 'JPG,PNG,JPEG,SVG file only allowed';
  }
  console.log(errors);
  return errors;
}
 
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: '', password: '' };

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
  if (err.message.includes('user validation failed')) {
    // console.log(err);
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
}

const handleErrorsOTP = (err) => {
  console.log(err.message, err.code);
  let errors = { otp : '' , fatal: false};

  // // incorrect email
  if (err.message === 'Invalid OTP entered') {
    errors.otp = 'Incorrect OTP';
  }else{
    errors.fatal = true;
  }

  return errors;
}

const handleImageError = async (x) => {
  if(!x.includes('/png') && !x.includes('/jpg') && !x.includes('/jpeg') && !x.includes('/svg')){
    throw Error('JPG,PNG,JPEG,SVG file only allowed');
  }
}

const upload_company_image_to_firebase_storage = async (companyImagesRef, data) =>{
  const snapshot = await uploadBytes(companyImagesRef, data);
  console.log("ji");
  console.log(snapshot);
  return snapshot.metadata.fullPath;
}

// create json web token
const maxAge = 3 * 24 * 60 * 60;

const createToken = (id) => {
  return jwt.sign({ id },  'secret', {
    expiresIn: maxAge,
  });
};

const sendOTPVerificationEmail = async (email, _id)=> {
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const mailOptions = {
      from: "",
      to: "",
      subject: "Verify your email",
      html: `<p>Enter <b>${otp}</b> on website to verify your email address.`
    };

    // hash the otp
    const saltRounds = 10;
    const hashedOTP = await bcrypt.hash(otp, saltRounds);

    const newOTPVerification = new UserOTPVerification({
      userId: _id,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000
    });
    const res = await newOTPVerification.save();
    await transporter.sendMail(mailOptions, function(error, info){
      if(error){
        console.log("$$$$$$$$$$$$$$$$");
        console.log(error);
      }else{
        console.log("emailsent");
      }
    });
    console.log("000000000000000000000000000000");
    console.log(otp);
    console.log(hashedOTP);
    console.log("000000000000000000000000000000");
    return otp;

  } catch (error){
      return error;
  }
}

// controller actions
module.exports.signup_get = (req, res) => {
  res.render('signup');
}  

module.exports.login_get = (req, res) => {
  res.render('login');
}

module.exports.signup_post = async (req, res) => {
  var { name, email, password, coverImage} = req.body;
  console.log(email);
  try {
    console.log(coverImage.split(',')[0]);
    await handleImageError(coverImage.split(',')[0]);
    coverImage = coverImage.split(',')[1]
    // console.log(coverImage);
    coverImagePath = 'images/' + 'coverImage' + `${name}.png`;
    console.log(coverImagePath);
    fs.writeFileSync('./' + coverImagePath,coverImage,'base64');
    var coverImage_Ref = ref(storage, coverImagePath);
    var coverImage_data = new Buffer.from(fs.readFileSync(coverImagePath));
    await upload_company_image_to_firebase_storage(coverImage_Ref, coverImage_data);
    var coverImageUrl = await getDownloadURL(coverImage_Ref); 

    const user = await User.create({ email, password, verified:false, name, image: coverImageUrl});
    const temp_otp = await sendOTPVerificationEmail(email, user._id);
    res.status(200).json({id: user._id});
    console.log(temp_otp);
  }
  catch(err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });  
  }
  
}

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);  
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } 
  catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  } 

}

module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', {maxAge: 1});
    res.redirect('/');
} 

module.exports.profile_get = (req, res) => {
  res.render('user_profile');
}

module.exports.practise_get = (req, res) => {
  Topic.find({},(err,data)=> {
    if(err){
      console.log(err);
    }else{
      res.render('practise',{ topic : data});
    }
  })
}

module.exports.practise_topic_get = (req, res) => {
  var id = req.params.id;
  console.log(id);
  Question.find({topic: id},(err,data)=> {
    if(err){
      console.log(err);
    }else{
      res.render('practise_topic',{questions : data});
    }
  })
}

module.exports.experience_get = (req, res) => {
  Experience.find({},(err,data)=> {
    if(err){
      console.log(err);
    }else{
      res.render('experience',{ experience : data});
    }
  })
  // res.render('experience');
}

module.exports.confirmation_get = async (req, res) => {
      console.log(req.params.details);
      var x = JSON.parse(req.params.details)
      res.locals.details = (x);
      console.log(res.locals.details);
      res.render("confirmation");
}
 
module.exports.verifyOTP_login_post = async (req, res) => {
  try{
    let { userId, OTP } = req.body;
    // userId = id;
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    console.log(OTP);
    console.log(userId);
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")

      var otp = OTP;
      if(!userId || !otp){
        // await User.findByIdAndDelete( userId );
        throw Error("user not registered or otp not there");
      }else{
        const UserOTPVerificationRecords = await UserOTPVerification.find({
          userId,
        });
        if(UserOTPVerificationRecords.length <= 0){
          // await User.findByIdAndDelete(userId);
          throw new Error("Account record doesnot exist. Please login or signup.");
        }else{
          const {expiresAt} = UserOTPVerificationRecords[0];
          // const hashedOTP = UserOTPVerificationRecords[0].otp;

          if(expiresAt < Date.now()){
            await UserOTPVerification.deleteMany({ userId });
            // await User.findByIdAndDelete(userId);
            throw new Error("OTP expired. Please request again.");
          }else{
            const UserOTPVerificationRecords = await UserOTPVerification.find({
                  userId,
             });
            console.log(UserOTPVerificationRecords);
            const hashedOTP = UserOTPVerificationRecords[0].otp;
            const validOTP = await bcrypt.compare(otp, hashedOTP);
            console.log(validOTP);
            if(!validOTP){              
              throw new Error("Invalid OTP entered");
            }else{
              var user = await User.updateOne({ _id: userId }, {verified: true});
              console.log(user);
              await UserOTPVerification.deleteMany({ userId });
              const token = createToken(user._id);
              res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
              res.status(200).json({ user });
            }
          }
        }
      }
  }catch(error){
    const errors = handleErrorsOTP(error);
    res.status(400).json({ errors });
    console.log(error);
  }

}

module.exports.verifyOTP_login_get = (req, res) => {
  const userId = req.params.id;
  console.log(req.params.id);
  res.locals.userId = JSON.stringify(userId);
  res.render('otpform_login');
}

module.exports.verifyOTP_post = async (req, res) => {
  try{
    let { userId, OTP } = req.body;
    // userId = id; 
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    console.log(OTP);
    console.log(userId);
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")

      var otp = OTP;
      if(!userId || !otp){
        await User.findByIdAndDelete( userId );
        throw Error("user not registered or otp not there");
      }else{
        const UserOTPVerificationRecords = await UserOTPVerification.find({
          userId,
        });
        if(UserOTPVerificationRecords.length <= 0){
          await User.findByIdAndDelete(userId);
          throw new Error("Account record doesnot exist. Please login or signup.");
        }else{
          const {expiresAt} = UserOTPVerificationRecords[0];
          const hashedOTP = UserOTPVerificationRecords[0].otp;

          if(expiresAt < Date.now()){
            await UserOTPVerification.deleteMany({ userId });
            await User.findByIdAndDelete(userId);
            throw new Error("OTP expired. Please request again.");
          }else{
            const UserOTPVerificationRecords = await UserOTPVerification.find({
                  userId,
             });
            console.log(UserOTPVerificationRecords);
            const hashedOTP = UserOTPVerificationRecords[0].otp;
            const validOTP = await bcrypt.compare(otp, hashedOTP);
            console.log(validOTP);
            if(!validOTP){              
              throw new Error("Invalid OTP entered");
            }else{
              var user = await User.updateOne({ _id: userId }, {verified: true});
              console.log(user);
              await UserOTPVerification.deleteMany({ userId });
              // POST request se redirects nahi hote keval json return ho sakti hai
              // res.status(200).redirect('/');
              // const token = createToken(user._id);
              // res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
              res.status(200).json({ user });
            }
          }
        }
      }
  }catch(error){
    const errors = handleErrorsOTP(error);
    res.status(400).json({ errors });
    console.log(error);
  }

}

module.exports.verifyOTP_get = (req, res) => {
  const userId = req.params.id;
  console.log(req.params.id);
  res.locals.userId = JSON.stringify(userId);
  res.render('otpform');
} 


module.exports.admin_get = async (req, res) => {
    res.render('admin_screen');
}

module.exports.question_get = (req, res) => {
  res.render('addquestion');
} 

module.exports.question_post = async(req,res) => {
  var x = await Topic.find({ topic : req.body.topic });
  var id = x[0]._id;
  req.body.topic = id;
  console.log(req.body);

  var data = new Question(req.body);
 data.save()
  .then(item => {
    console.log("data is saved");
  })
 .catch(err => {
    console.log(err); 
  })

}

module.exports.addexperience_get = (req,res) =>{
  res.render('addexperience');
} 

module.exports.addexperience_get = (req,res) =>{
    
  res.render('addexperience');
}  

module.exports.addexperience_post = async(req,res) => {
  
//  var phew = req.body.company;
 var {coverImage, name} = req.body;
 
 console.log(coverImage.split(',')[0]);
 await handleImageError(coverImage.split(',')[0]);
 coverImage = coverImage.split(',')[1]
 // console.log(coverImage);
 coverImagePath = 'images/' + 'coverImage' + `${name}.png`;
 console.log(coverImagePath);
 fs.writeFileSync('./' + coverImagePath,coverImage,'base64');
 var coverImage_Ref = ref(storage, coverImagePath);
 var coverImage_data = new Buffer.from(fs.readFileSync(coverImagePath));
 await upload_company_image_to_firebase_storage(coverImage_Ref, coverImage_data);
 var coverImageUrl = await getDownloadURL(coverImage_Ref); 
req.body.image = coverImageUrl;

  

var data = new Experience(req.body);
 data.save()
  .then(item => {
    console.log("data is saved");
  })
 .catch(err => {
    console.log(err);
  })
} 

module.exports.manage_company_get = async(req, res) => {
    var temp = await Company.find({});
    for(let i=0;i<(temp.length);i++){
      console.log(i);
      temp[i].password = undefined;
      console.log(i);
    }
    res.locals.companies = temp;
    console.log(res.locals.companies);
    res.render("manage_company");
}

module.exports.company_get = async(req, res) => {
  console.log("req came");
  var id = req.params.id;
  console.log(id);
  var temp = await Company.findById(id);
  temp.password = undefined;
  console.log(temp);
  res.locals.company = temp;
  res.render('particular_company');
}

module.exports.edit_coverImage_get = async (req, res) => {
  console.log("req c");
  var id = req.params.id;
  console.log(id);
  var temp = await Company.findById(id);
  temp.password = undefined;
  console.log(temp);
  res.locals.company = temp;
  res.render('edit_coverImage');
}

module.exports.edit_coverImage_post = async (req, res) => {
  console.log("::");
  var {id, image} = req.body;
  // console.log(image);
  console.log(id);
  var imageUrl;
  try{
    var temp = await Company.findById(id);
    temp.password = undefined;
    var firestore_id = temp.firestore_id;
    await handleImageError(image.split(',')[0]);
    imagePath = 'images/' + 'image' + `${randomString(5)}.png`;
    console.log(imagePath);
    fs.writeFileSync('./' + imagePath, image.split(',')[1],'base64');
 
    var image_Ref = ref(storage, imagePath);
    var image_data = new Buffer.from(fs.readFileSync(imagePath));
    await upload_company_image_to_firebase_storage(image_Ref, image_data);
    imageUrl = await getDownloadURL(image_Ref); 
    console.log("kika")
    console.log(imageUrl);

    
    var result = await Company.updateOne(
      {_id: id},
      {$set: {coverImage: imageUrl}}
    );

    console.log(result);
    const nftRef = doc(db, 'restaurants', firestore_id);
    await updateDoc(nftRef, {coverImage: imageUrl});
    fs.unlink(imagePath, (err) => {
      if (err) {
          throw err;
      }
      console.log("Image File is deleted.");
  });
    res.status(200).json({accept : 1});
  }catch(error){
    var errors = handleErrors_Pic(error);
    console.log(error);
    res.status(400).json({ errors });  
  }
}

module.exports.edit_tagline_get = async (req, res) => {
  console.log("req c");
  var id = req.params.id;
  console.log(id);
  var temp = await Company.findById(id);
  temp.password = undefined;
  console.log(temp);
  res.locals.company = temp;
  res.render('edit_tagline');
}

module.exports.edit_tagline_post = async (req, res) => {
  console.log("edit_tagline_post");
  var {id, tagline} = req.body;
  console.log(tagline);
  console.log(id);
  try{
    if(tagline.length > 35){
      throw("Maximum tagline length is 35")
    }
    var temp = await Company.findById(id);
    temp.password = undefined;
    var firestore_id = temp.firestore_id;

    var result = await Company.updateOne(
      {_id: id},
      {$set: {tagline: tagline}}
    );

    console.log(result);

    const nftRef = doc(db, 'restaurants', firestore_id);
    await updateDoc(nftRef, {tagline: tagline});

    res.status(200).json({accept : 1});
  }catch(error){
    console.log(error);
    var errors = {tagline : error};
    res.status(400).json({ errors });  
  }
}

