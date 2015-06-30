var auth = new Auth();
var path = require('path');
var config = require('../config/config');
var request = require('superagent');
var prefix = require('superagent-prefix')('/static');
var ua = require('./useragent');
var logger = require('../controllers/log');

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
			request
				.get(config.API_USER + 'Member/get/member_id/'+req.session.user.member_id)
				.end(function(err, data){
					if(err) logger.error(err,data.ok);
					req.user = JSON.parse(data.res.text).member_info;
					next();
				});
		}
	};
}

module.exports = auth;