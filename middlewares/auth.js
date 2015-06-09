var auth = new Auth();
var path = require('path');
var config = require('../config');
var request = require('superagent');
var prefix = require('superagent-prefix')('/static');
var ua = require('./useragent');

function Auth(){
	this.checkLogin = function(req, res, next) {
		if (!req.session || !req.session.user) {
			res.render(ua.agent(req.headers['user-agent']) + '/views/error.html', {
				message: '你还没有登陆',
				error: {},
				goto:{href:'/login',name:'点击登录'},
				public: config.PUBLIC
			});
		}else{
			next();
		}
	};
}

module.exports = auth;