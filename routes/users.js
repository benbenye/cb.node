/**
 * Created by bby on 15/6/4.
 */
var express = require('express');
var user = require('../controllers/user');
var logReg = require('../controllers/logReg');
var auth = require('../middlewares/auth');
var security = require('../controllers/security');
var request = require('superagent');
var path = require('path');
var prefix = require('superagent-prefix')('/static');
var config = require('../config/config');
var router = express.Router();
var ua = require('../middlewares/funcHelper');

/*用户登录页面*/
router.get('/login', auth.checkLogout, logReg.loginView);
router.post('/login', logReg.login);/*用户登录操作*/

/*手机注册*/
router.get('/register', auth.checkLogout, logReg.getRegister);
router.post('/registerMobile', auth.checkLogout, logReg.registerMobile);/*手机号注册*/
router.post('/register/sendSMS', auth.checkLogout, security.sendSMS);/*发送验证码短信*/
router.post('/register/checkMobile', auth.checkLogout, logReg.checkMobile);/*检查手机号是否注册过*/

/*退出*/
router.get('/logout', logReg.logout);

module.exports = router;
