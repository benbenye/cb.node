var express = require('express');
var user = require('../controllers/user');
var userAjax = require('../controllers/userAjax');
var cart = require('../controllers/cart');
var review = require('../controllers/review');
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
router.post('/Member/info', auth.checkLogin, userAjax.editMemberInfo);/*保存用户信息*/

/*我的订单*/
router.get('/my/order', auth.checkLogin, cart.getOrderInfo);/*订单列表*/
router.post('/review/getreviewpidoid', auth.checkLogin, review.getReviewPidOid)/*获取评价信息*/
router.get('/my/orderdetail/:orderId', auth.checkLogin, cart.getOrderDetail);/*订单详情*/
router.post('/orderinfo/delorder/:order_id', auth.checkLogin, cart.delOrder);/*取消订单*/

/* 我的心愿单 */
router.get('/my/fav', auth.checkLogin, user.getFav);/*获取心愿单*/
router.post('/my/delfav', auth.checkLogin, userAjax.postDelFav);/*删除心愿单*/
router.post('/my/addfav', auth.checkLogin, userAjax.postAddFav);/*添加心愿单*/

/* 已购商品 */
router.get('/my/purchased', auth.checkLogin, cart.getPurchased);

/* 我的积分 */
router.get('/my/points', auth.checkLogin, user.getPoints);

/* 我的春播券 */
router.get('/my/coupons', auth.checkLogin, user.getCoupons);
router.post('/my/bindCoupons', auth.checkLogin, userAjax.postBindCoupons);/*绑定春播券*/

/* 我的春播卡 */
router.get('/my/giftcards', auth.checkLogin, user.getGiftcards);
router.post('/my/bindGiftcard', auth.checkLogin, userAjax.postBindGiftcard);/*绑定春播卡*/

/* 账户安全 */
router.get('/my/security', auth.checkLogin, user.getSecurity);

/* 我的余额 */
router.get('/my/balance', auth.checkLogin, user.getBalance);

/* 分享基金 */
router.get('/my/invitation', auth.checkLogin, user.getInvitation);

/* 修改密码 */
router.post('/my/changePaw', auth.checkLogin, userAjax.postChangePaw);

module.exports = router;
