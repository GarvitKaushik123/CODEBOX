const { Router } = require('express');
const companyController = require('../controllers/companyController');
const {requireAuth , checkUser , adminAuth } = require('../middleware/authMiddleware');
const { formParser } = require('../middleware/parseMiddleware');
const { requireCompanyAuth , checkCompany } = require("../middleware/companyMiddleware");


const router = Router(); 

router.get('/company', companyController.company_get);
router.get('/signup_company', companyController.signup_company_get);   
router.post('/signup_company', companyController.signup_company_post); 
router.get('/review_company_request', requireAuth, checkUser, adminAuth, companyController.review_company_request_get);
router.post('/accept_company', requireAuth, checkUser, adminAuth, companyController.accept_company_post);
router.post('/reject_company', requireAuth,  checkUser, adminAuth, companyController.reject_company_post); 
router.get('/company_request_screen/:details', companyController.company_request_screen_get);
router.get('/login_company', companyController.login_company_get);
router.post('/login_company', companyController.login_company_post);
router.get('/company_home', requireCompanyAuth, checkCompany, companyController.company_home_get);
router.get('/logout_company', companyController.logout_company_get);
 
module.exports = router;
