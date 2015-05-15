var express = require('express');
var user = require('../controllers/user');
var auth = require('../middlewares/auth');
var request = require('superagent');
var path = require('path');
var prefix = require('superagent-prefix')('/static');
var router = express.Router();

/* 我的积分 首页 */
router.get('/points', auth.checkLogin, user.getPoints);

/* 我的积分 积分明细|收入积分|支出积分|积分分页 */
router.get('/points/:id/:type([123])/:page/:pageSize', auth.checkLogin, user.handlePoints);

module.exports = router;
