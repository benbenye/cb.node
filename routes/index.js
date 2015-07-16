var express = require('express');
var user = require('../controllers/user');
var auth = require('../middlewares/auth');
var request = require('superagent');
var path = require('path');
var prefix = require('superagent-prefix')('/static');
var config = require('../config/config');
var index = express.Router();
var ua = require('../middlewares/funcHelper');

/* GET home page. */
index.get('/', function(req, res) {
	var userInfo = req.session.user ? req.session.user.member_info : {flag:false};
	res.render(ua.agent(req.headers['user-agent'])+'/views/index.html', {
	title: '春播-安心健康的网购首选',
	public: config.PUBLIC,
	userInfo: userInfo
	});
});

module.exports = index;
