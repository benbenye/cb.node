var auth = new Auth();
var path = require('path');
var config = require('../config/config');
var request = require('superagent');
var prefix = require('superagent-prefix')('/static');
var funcHelper = require('./funcHelper');
var logger = require('../controllers/log');

function Auth(){
	this.checkLogin = function(req, res, next) {
		if (!req.session || !req.session.user) {
			//res.render(funcHelper.agent(req.headers['user-agent']) + '/views/error.html', {
			//	message: '你还没有登陆',
			//	error: {},
			//	goto:{href:'/login',name:'点击登录'},
			//	public: config.PUBLIC
			//});
			res.redirect('/login?next='+req.originalUrl);
		}else{
			request
				.get(config.API_USER + 'Member/get/member_id/'+req.session.user.member_id)
				.end(function(err, data){
					if(err) return logger.error(err);
					req.user = JSON.parse(data.res.text).member_info;
					next();
				});
		}
	};

	this.checkLogout = function(req, res, next){
		if(req.session.user){
			/*已经登陆过*/
			res.redirect('/');
		}else{
			req.user = null;
			next();
		}
	}
}

module.exports = auth;