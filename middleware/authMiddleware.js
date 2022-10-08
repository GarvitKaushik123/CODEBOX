const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const admins = require('../admin'); 


const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, 'secret', (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect('/login');
      } else {
        console.log(decodedToken);
        next();
      }
    });
  } else {
    res.redirect('/login');
  }
};


const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, 'secret', async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        next();
      } else {
        let user = await User.findById(decodedToken.id);
        user.password = null;
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};


//admin auth

const adminAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  console.log(token)
  //check json web token exists & is verified
  if (token) {
    jwt.verify(token, 'secret', (err, decodedToken) => {
      if (err) {
        // console.log(err.message);
        res.redirect('/login');
      } else {
        // console.log(res.locals.user); 
        let swag = admins();
      
        var a = 0;
        swag.forEach(element => {
             if(element.email == res.locals.user.email){
               a=1;
             }
        });

        if(a ==1){

          req.body.approved = true;
          console.log(req.body.approved);
          next();
        }
       else{
         res.redirect('/login'); 
       }

        
      }
    });
  } else {
    res.redirect('/login');
    next();
  }
};


module.exports = { requireAuth, checkUser, adminAuth};
