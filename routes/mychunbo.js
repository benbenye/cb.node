var express = require('express');
var user = require('../controllers/user');
var auth = require('../middlewares/auth');
var req = require('../middlewares/request');
var request = require('superagent');
var path = require('path');
var prefix = require('superagent-prefix')('/static');
var router = express.Router();

/* 我的积分 首页 */
router.get('/points', auth.checkLogin, user.getPoints);

/* 我的积分 积分明细|收入积分|支出积分|积分分页 */
router.get('/points/page', req.checkAjax, auth.checkLogin, user.pagePoints);

/* 我的春播券 */
router.get('/coupons', auth.checkLogin, user.getCoupons);

module.exports = router;
