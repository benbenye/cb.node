var express = require('express');
var user = require('../controllers/user');
var auth = require('../middlewares/auth');
var req = require('../middlewares/request');
var request = require('superagent');
var path = require('path');
var prefix = require('superagent-prefix')('/static');
var router = express.Router();

/* 我的春播首页 */
router.get('/my/index', auth.checkLogin, user.getIndex);

/* 个人信息 */
router.get('/my/info', auth.checkLogin, user.getMyInfo);

/*我的订单信息*/
router.get('/my/order', auth.checkLogin, user.getOrderInfo);

/* 我的积分 */
router.get('/my/points', auth.checkLogin, user.getPoints);

/* 我的积分 积分明细|收入积分|支出积分|积分分页 */
router.get('/my/points/page', auth.checkLogin, user.pagePoints);

/* 我的春播券 */
router.get('/my/coupons', auth.checkLogin, user.getCoupons);

/* 我的春播卡 */
router.get('/my/giftcards', auth.checkLogin, user.getGiftcards);

/* 账户安全 */
router.get('/my/security', auth.checkLogin, user.getSecurity);

/* 我的余额 */
router.get('/my/balance', auth.checkLogin, user.getBalance);

/* 分享基金 */
router.get('/my/invitation', auth.checkLogin, user.getInvitation);

module.exports = router;
