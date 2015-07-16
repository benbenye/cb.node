var express = require('express');
var user = require('../controllers/user');
var userAjax = require('../controllers/userAjax');
var cart = require('../controllers/cart');
var review = require('../controllers/review');
var security = require('../controllers/security');
var auth = require('../middlewares/auth');
var err = require('../middlewares/err');
var req = require('../middlewares/request');
var request = require('superagent');
var path = require('path');
var prefix = require('superagent-prefix')('/static');
var router = express.Router();

/* 我的春播首页 */
router.get('/my/index', auth.checkLogin, user.getIndex);
router.get('/my/history', auth.checkLogin, user.getHistory);/*浏览历史*/
router.get('/my/hot', auth.checkLogin, userAjax.hot);/*本周热销*/
router.get('/my/already', auth.checkLogin, userAjax.already);/*购买记录*/
/* 个人信息 */
router.get('/my/info', auth.checkLogin, user.getMyInfo);
router.post('/Member/info', auth.checkLogin, userAjax.editMemberInfo);/*保存用户信息*/

/*我的订单*/
router.get('/my/order', auth.checkLogin, cart.getOrderInfo);/*订单列表*/
router.post('/review/getreviewpidoid', auth.checkLogin, review.getReviewPidOid);/*获取评价信息*/
router.get('/my/orderdetail/:orderId', auth.checkLogin, cart.getOrderDetail);/*订单详情*/
router.post('/orderinfo/delorder/:order_id', auth.checkLogin, cart.delOrder);/*取消订单*/
router.get('/my/getLogitics/:order_id', auth.checkLogin, cart.getLogitics);/*获取订单物流信息*/
router.get('/my/getInspection/skuId/:skuId/skuLot/:skuLot', auth.checkLogin, cart.getInspection);/*追踪监测情况*/

/* 我的心愿单 */
router.get('/my/fav', auth.checkLogin, user.getFav);/*获取心愿单*/
router.post('/my/delfav', auth.checkLogin, userAjax.postDelFav);/*删除心愿单*/
router.post('/my/addfav', auth.checkLogin, userAjax.postAddFav);/*添加心愿单*/

/* 已购商品 */
router.get('/my/purchased', auth.checkLogin, cart.getPurchased);

/* 我的积分 */
router.get('/my/points', auth.checkLogin, user.getPoints, err.handle);

/* 我的春播券 */
router.get('/my/coupons', auth.checkLogin, user.getCoupons);
router.post('/my/bindCoupons', auth.checkLogin, userAjax.postBindCoupons);/*绑定春播券*/

/* 我的春播卡 */
router.get('/my/giftcards', auth.checkLogin, user.getGiftcards);
router.post('/my/bindGiftcard', auth.checkLogin, userAjax.postBindGiftcard);/*绑定春播卡*/

/* 账户安全 */
router.get('/my/security', auth.checkLogin, user.getSecurity);
router.get('/my/securityPayPwd', auth.checkLogin, security.checkSecurityStatus);/*验证绑定邮箱手机*/
router.get('/my/payPwd', auth.checkLogin, security.getPayPwd);/*显示设置/修改支付密码*/
router.get('/my/setPayPwd', auth.checkLogin, security.setPayPwd);/*设置支付密码*/
router.post('/my/chaPayPwd', auth.checkLogin, security.chaPayPwd);/*修改支付密码*/
router.post('/my/sendSMS', auth.checkLogin, security.sendSMS);/*发送短信验证码*/
router.post('/my/BindMobile', auth.checkLogin, security.bindMobile);/*绑定、更改手机号*/
router.post('/my/changePwd', auth.checkLogin, security.postChangePwd);/* 修改密码 */
router.post('/my/bindEmail', auth.checkLogin, security.bindEmail);/*绑定邮箱*/
router.get('/my/bindEmail/change', auth.checkLogin, security.getChangeEmail);/*更改绑定邮箱*/
router.get('/my/bindEmail/bind', auth.checkLogin, security.getBindEmail);/*绑定邮箱*/
router.get('/my/bindEmail/verify/:verify', auth.checkLogin, security.verifyEmail);/*验证邮箱*/
router.post('/my/bindEmail/ValidateChangeEmail', auth.checkLogin, security.validateChangeEmail);/*验证绑定邮箱*/
router.get('/my/sendEmail/:isValidate', auth.checkLogin, security.sendEmail);/*发送邮件*/

/* 我的余额 */
router.get('/my/balance', auth.checkLogin, user.getBalance);

/* 分享基金 */
router.get('/my/invitation', auth.checkLogin, user.getInvitation);

module.exports = router;
