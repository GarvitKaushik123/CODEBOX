const jwt = require('jsonwebtoken');
const Company = require('../models/Company');
const User = require('../models/Company'); 

const requireCompanyAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, 'secret_company', (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect('/login_company');
      } else {
        console.log(decodedToken);
        next();
      }
    });
  } else {
    res.redirect('/login_company');
  }
};


const checkCompany = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, 'secret_company', async (err, decodedToken) => {
      if (err) {
        res.locals.company = null;
        next();
      } else {
        let company = await Company.findById(decodedToken.id);
        company.password = undefined;
        res.locals.company = company;
        next();
      }
    });
  } else {
    res.locals.company = null;
    next();
  }
};



// export { requireAuth };
module.exports = { requireCompanyAuth, checkCompany};
