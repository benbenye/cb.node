/**
 * Created by bby on 15/6/4.
 */
var express = require('express');
var user = require('../controllers/user');
var auth = require('../middlewares/auth');
var request = require('superagent');
var path = require('path');
var prefix = require('superagent-prefix')('/static');
var config = require('../config/config');
var router = express.Router();
var ua = require('../middlewares/useragent');

/*用户登录页面*/
router.get('/login', user.loginView);

/*用户登录操作*/
router.post('/login', user.login);

/*退出*/
router.get('/logout', user.logout);

module.exports = router;
