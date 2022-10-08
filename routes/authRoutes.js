const { Router } = require('express');
const authController = require('../controllers/authController');
const {requireAuth , checkUser , adminAuth } = require('../middleware/authMiddleware');
const { formParser } = require('../middleware/parseMiddleware');

const router = Router();
   
router.get('/signup', checkUser,authController.signup_get);
router.post('/signup',authController.signup_post);
router.get('/login',authController.login_get);
router.post('/login', authController.login_post);
router.get('/logout', authController.logout_get);
router.get('/profile', checkUser, requireAuth,authController.profile_get);
router.get('/practise', checkUser, requireAuth, authController.practise_get);
router.get('/experience', checkUser, requireAuth,authController.experience_get);
router.get('/practise/:id', checkUser, requireAuth, authController.practise_topic_get);
router.get('/confirmation/:details', authController.confirmation_get);
router.get('/verifyOTP/:id', authController.verifyOTP_get);
router.post('/verifyOTP', authController.verifyOTP_post);  
router.post('/verifyOTP_login', authController.verifyOTP_login_post);   
router.get('/verifyOTP_login/:id', authController.verifyOTP_login_get);
router.get('/admin', requireAuth, checkUser, adminAuth, authController.admin_get);
router.get('/addquestion',checkUser,adminAuth,authController.question_get);
router.post('/addquestion',checkUser,adminAuth, authController.question_post);
router.get('/addexperience',checkUser,adminAuth,authController.addexperience_get);
router.post('/addexperience',checkUser,adminAuth,authController.addexperience_post);
router.get('/manage_company', requireAuth, checkUser, adminAuth, authController.manage_company_get);
router.get('/company/:id', requireAuth, checkUser, adminAuth, authController.company_get);
router.get('/edit_coverImage/:id', requireAuth, checkUser, adminAuth, authController.edit_coverImage_get);
router.post('/edit_coverImage', requireAuth, checkUser, adminAuth, authController.edit_coverImage_post);
router.get('/edit_tagline/:id', requireAuth, checkUser, adminAuth, authController.edit_tagline_get);
router.post('/edit_tagline', requireAuth, checkUser, adminAuth, authController.edit_tagline_post);
router.get('/get_hired', requireAuth, checkUser, authController.get_hired_get);
router.get('/apply_offer/:id', requireAuth, checkUser, authController.apply_offer_get);
router.post('/apply_offer', requireAuth, checkUser, authController.apply_offer_post);
router.get('/application_confirmation', requireAuth, checkUser, authController.application_confirmation_get);

module.exports = router;