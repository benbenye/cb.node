var express = require('express');
var user = require('../controllers/user');
var auth = require('../middlewares/auth');
var request = require('superagent');
var path = require('path');
var prefix = require('superagent-prefix')('/static');
var config = require('../config');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	var userInfo = req.flag ? {flag:true,nickname:'yejing'} : {flag:false};
  res.render('index.html', {
  	title: 'Express',
  	public: config.PUBLIC,
  	userInfo: userInfo
  });
});

router.get('/download', function(req, res){
	res.render('app/download.html',{
		title:'App下载页面',
		public: config.PUBLIC
	})
});
/*用户登录操作*/
router.post('/login/post', user.login);
/*用户登录页面*/
router.get('/login', auth.checkLogin, function(req, res){
	console.log(req.flag);
	res.render('public/login.html',{
		title:'登陆页面',
		public:config.PUBLIC
	})
});

module.exports = router;
