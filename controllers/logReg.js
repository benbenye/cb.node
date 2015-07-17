var logReg = new LogReg();
var path = require('path')
var request = require('superagent');
var logger = require('./log');
var prefix = require('superagent-prefix')('/static');
var config = require('../config/config');
var async = require('async');
var funcHepler = require('../middlewares/funcHelper');
function LogReg(){
	/*登录请求 */
	this.login = function(req, res, next){
		var username = req.body.username,
			password = req.body.password,
			form_token = req.body.form_token,
			keep_login = req.body.keep_login,
			_url = 'member/login/username/'+username+'/password/'+password,
			_next = req.query.next || '/';
		request.get(config.API_YAOJIE+'member/getToken/id/'+form_token).end(function (err, data) {
			if(err || !data.ok){
				return next();
			}else if(JSON.parse(data.res.text).flag == 2){
				return res.send({status:0,info:'页面错误,请刷新后再试'});
			}
				request
					.get(config.API_USER + _url)
					.end(function(err, data){
						var resData = JSON.parse(data.res.text);
						if(!data.ok){
							res.send({status:0,info:'网络异常,请稍后再试'});
						}else if(resData.flag == 1){
							req.session.user = {member_id : resData.member_info.member_id};
							res.cookie(data.res.headers['set-cookie']);
							res.cookie('is_reg_info', '1');
							res.send({
								status:1,
								url:_next
							});
						}else if(resData.flag == 2){
							switch (resData.erron){
								case 4017:
									res.send({status:0,info:'请输入用户名和密码'});
									break;
								default :
									res.send({status:0,info:'用户名或密码不正确'});
									break;
							}
						}
					});
		});
	};
	/*退出*/
	this.logout = function(req, res){
		req.session.user = null;
		res.redirect('/');
	};
	/*登录页面*/
	this.loginView = function(req, res, next){
		request.get(config.API_YAOJIE + 'member/FormToken').end(function (err, data) {
			if(err || !data.ok || JSON.parse(data.res.text).flag == 2){
				return next();
			}
			res.render(funcHepler.agent(req.headers['user-agent'])+'/views/public/login.html',{
				title:'登录春播',
				public:config.PUBLIC,
				ua:funcHepler.agent(req.headers['user-agent']),
				form_token:JSON.parse(data.res.text).data.id,
				login_url: req.originalUrl
			});
		});
	};
	/*手机号注册 gethtml*/
	this.getRegister = function(req, res, next){
		request.get(config.API_YAOJIE + 'member/FormToken').end(function (err, data) {
			if(err || !data.ok){
				return next();
			}else if(JSON.parse(data.res.text).flag == 2){
				return res.send({status:0,info:'页面错误,请刷新后再试'});
			}
				res.render(funcHepler.agent(req.headers['user-agent'])+'/views/public/register.html',{
					title:'注册春播',
					ua:funcHepler.agent(req.headers['user-agent']),
					public:config.PUBLIC,
					form_token: JSON.parse(data.res.text).data.id
				});
		});
	};
	/*手机号注册 post*/
	this.registerMobile = function (req, res) {
		var username = req.body.username,
				password = req.body.password,
				verify = req.body.verify,
				reg_platforms = 0,
				wx_token = null;
		var tasks = [];
		tasks.push(function (callback) {
			if(!username){callback(true, "请输入手机号"); return;}
			if(!password){callback(true, "请输入密码"); return;}
			if(!verify){callback(true, "请输入验证码"); return;}
			if(!username.match(/1[34578]{1}\d{9}$/)){callback(true, "请输入正确的手机号"); return;}
			if(password.length > 16 || password.length < 6){callback(true, "密码长度错误"); return;}
			callback(null, '');
		});
		tasks.push(function (callback) {
			request
				.get(config.API_YAOJIE + 'member/getVerifyApi/mobile/'+username)
				.end(function (err, data) {
					if(err || !data.ok || JSON.parse(data.res.text).flag == 2) {
						logger.error(err);
						callback(err, '异常操作，请稍后重试');
					}
						var getVerify = JSON.parse(data.res.text).data;
						if (verify.toLowerCase() != 'y123') {
							if (getVerify != verify.toLowerCase()) {
								return callback(true, "验证码错误");
							}
						}else {
							if (getVerify != 'y123') {
								return callback(true, "验证码错误");
							}
						}
						callback(null, '');
				});
		});
		tasks.push(function (callback) {

			if(funcHepler.isWeixin(req.headers['user-agent'])){
				reg_platforms = 4;
			}else if(funcHepler.agent(req.headers['user-agent']) == 'm'){
				reg_platforms = 2;
			}else{
				reg_platforms = 1;
			}
			var _url = config.API_USER + 'Member/RegMobile/username/'+username+'/password/'+password;
			if(reg_platforms) _url += ('/reg_platforms/'+reg_platforms);
			if(wx_token) _url += ('/wx_token/'+wx_token);
			request
				.get(_url)
				.end(function (err, data) {
					if(err) {callback(err, '网络错误，请稍后重试');}
					else{
						if(JSON.parse(data.res.text).flag == 2 || !data.res.text){
							switch (JSON.parse(data.res.text).erron){
								case 4017:
									callback(true,'请输入用户名或密码');
									break;
								case 4021:
									callback(true, '请输入正确的手机号');
									break;
								case 4201:
									callback(true, '用户名已经存在');
									break;
								default :
									callback(true, '注册失败');
									break;
							}
						}else{
							callback(null, "注册成功");
						}
					}
				});
		});
		async.series(tasks, function (err, result) {
			if(err) res.json({status:0, info:result[0] || result[1] || result[2]});
			else res.json({status:1,url:'/'});
		});
	};
	/*检查手机号是否注册过*/
	this.checkMobile = function (req, res) {
		var mobile = req.body.mobile;
		if(!mobile){
			res.send({status:0,info:'请输入手机号'});
		}else{
			request.get(config.API_USER + 'Member/VerifyMobileBind/mobile/'+mobile).end(function (err, data) {
				if(err){}
				else if(JSON.parse(data.res.text).flag == 2){
					res.send({status:0,info:'手机号已被注册过'});
				}else{
					res.send({status:1,info:'成功'});
				}
			})
		}
	};
	
}

module.exports = logReg;