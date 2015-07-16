var security = new Security();
var path = require('path')
var request = require('superagent');
var logger = require('./log');
var prefix = require('superagent-prefix')('/static');
var config = require('../config/config');
var async = require('async');
var funcHepler = require('../middlewares/funcHelper');

function Security(){
	/* 修改密码 */
	this.postChangePwd = function(req, res){
		var data = req.body;

		if(!data.old_password){
			res.json({
				status:0,
				info:'请输入旧密码！'
			});
		}
		if(!data.password){
			res.json({
				status:0,
				info:'请输入新密码！'
			})
		}
		if(!data.rep_password){
			res.json({
				status:0,
				info:'请再次输入新密码！'
			})
		}
		if(data.old_password.length < 6 || data.old_password.length > 16){
			res.json({
				status:0,
				info:'旧密码长度不正确！'
			})
		}
		if(data.password.length < 6 || data.password.length > 16){
			res.json({
				status:0,
				info:'新密码密码长度不正确！'
			})
		}
		if(data.password !== data.rep_password){
			res.json({
				status:0,
				info:'两次密码输入不一致！'
			})
		}
		if(data.old_password === data.password){
			res.json({
				status:0,
				info:'新密码不能和旧密码相同！'
			})
		}
		request
			.get(config.API_USER + 'Member/ChangePass/login_id/'+req.user.login_id+'/old_password/'+data.old_password+'/password/'+data.password)
			.end(function(err, data){
				if(JSON.parse(data.res.text).flag == 2 || !data.res.text){
					switch(JSON.parse(data.res.text).erron){
						case 4108:
							res.json({
								status:0,
								info:'新密码不能和旧密码相同！'
							})
							break;
						default:
							res.json({
								status:0,
								info:'原始密码不正确！'
							})
							break;
					}
				}else {
					res.json({
						status:1,
						info:'修改成功',
						url:'security'
					});
				}
			});
	};
	this.getPayPwd = function(req, res){
		request
			.get(config.API_USER + 'Member/GetPayPwd/member_id/'+req.user.member_id)
			.end(function(err, data){
				var payPwd_status = JSON.parse(data.res.text).flag;
				res.render(funcHepler.agent(req.headers['user-agent'])+'/views/my/security_paypwd.html',{
					title:payPwd_status == 1 ? '修改支付密码' : '设置支付密码',
					ua:funcHepler.agent(req.headers['user-agent']),
					public:config.PUBLIC,
					userInfo:req.user,
					isSet: payPwd_status == 1 ? false : true
				});
			})
	};
	/*设置支付密码之前，验证邮箱或者手机*/
	this.checkSecurityStatus = function(req, res){
		if(req.user.mobile || req.user.validate_email == 1){
			res.json({
				status:1,
				info:'验证通过',
				url:'/my/payPwd'
			})
		}else{
			res.json({
				status:0,
				info:'请验证邮箱或绑定手机'
			})
		}
	};
	/*设置支付密码*/
	this.setPayPwd = function(req, res){
		var password = req.query.password,
				rep_password = req.query.rep_password,
				member_id = req.user.member_id;
		console.log(req)
		if(!password){
			res.json({
				status:0,
				info:'请输入支付密码'
			});
			return;
		}
		if(password != rep_password){
			res.json({
				status:0,
				info:'两次密码输入不一致'
			});
			return;
		}
		request
			.get(config.API_USER + 'Member/SetPayPwd/member_id/'+member_id+'/password/'+password)
			.end(function(err, data){
				if(err) logger.error(err);
				if(JSON.parse(data.res.text).flag == 2 || !data.ok){
					var _info = '';
					switch(JSON.parse(data.res.text).erron){
						case 9007:
						    _info = '账户信息为空';
						    break;
						case 9008:
						    _info = '无效的会员';
						    break;
						case 9009:
						    _info = '新密码不可为空';
						    break;
						case 9010:
						    _info = '新密码长度错误,最长为36个字符';
						    break;
						case 9099:
						    _info = '设置支付密码失败';
						    break;
						case 1000:
						    _info = '网络异常,请稍后再试';
						    break;
						case 1001:
						    _info = '支付密码已经创建过';
						    break;
						default:
						    _info = '支付密码设置失败';
					}
					res.json({
						status:0,
						info:_info
					});
				}else{
					res.json({
						status:1,
						info:'设置成功'
					})
				}
			});
	};
	/*修改支付密码*/
	this.chaPayPwd = function(req, res){
		var password = req.body.password,
				rep_password = req.body.rep_password,
				old_password = req.body.old_password,
				member_id = req.user.member_id,
				_info = '';
		if (!password) _info = '请输入支付密码';
		if (!rep_password) _info = '请再次输入密码';
		if (!old_password) _info = '请输入旧密码';
		if (password !== rep_password) _info = '两次密码输入不一致';
		if (_info){
			res.json({
				status:0,
				info:_info
			});
			return;
		}

		request
			.get(config.API_USER + 'Member/ChangePayPwd/member_id/'+member_id+'/old_password/'+old_password+'/password/'+password)
			.end(function(err, data){
				if(JSON.parse(data.res.text).flag == 2 || !data.ok){
					console.log(JSON.parse(data.res.text))
					switch(JSON.parse(data.res.text).erron){
						case 9007:
						    _info = '账户信息为空';
						    break;
						case 9008:
						    _info = '无效的会员';
						    break;
						case 9009:
						    _info = '新密码不可为空';
						    break;
						case 9010:
						    _info = '新密码长度错误,最长为36个字符';
						    break;
						case 9011:
						    _info = '原始密码不能为空';
						    break;
						case 9099:
						    _info = '设置支付密码失败';
						    break;
						case 1000:
						    _info = '网络异常,请稍后再试';
						    break;
						case 1001:
						    _info = '支付密码已经创建过';
						    break;
						case 1002:
						    _info = '原始支付密码错误';
						    break;
						default:
						    _info = '支付密码修改失败';
					}
					if(_info){
						res.json({
							status:0,
							info:_info
						});
						return;
					}
				}else{
					res.json({
						status:1,
						info:'修改成功',
						url:'/my/security'
					});
				}
			});
	};
	/*发送短信验证码*/
	this.sendSMS = function (req, res) {
		var mobile = req.body.mobile,
			type = req.body.type;
		request
			.get(config.API_YAOJIE + 'member/sendSMS/mobile/'+mobile+'/type/'+type)
			.end(function (err, data) {
				if(!data.ok || JSON.parse(data.res.text).errcode != 0){
					res.json({
						status:0,
						info:'发送失败'
					})
				}else{
					res.json({
						status:1,
						info:'发送成功'
					})
				}
			})
	};
	/*绑定或修改手机号*/
	this.bindMobile = function (req, res) {
		var mobile = req.body.mobile,
			rep_mobile = req.body.rep_mobile,
			verify = req.body.verify,
			info = '';
		if(req.user.mobile){
			if(checkData()){
				res.json({
					status:0,
					info:checkData()
				});
			}else{
				changeMobile();
			}
		}else{
			if(checkDataBind()){
				res.json({
					status:0,
					info:checkDataBind()
				});
			}else{
				changeMobile();
			}
		}
		function checkData(){
			if(!mobile) return '请输入新手机号';
			if(!rep_mobile) return '请再次输入手机号';
			if(!verify) return '请输入验证码';
			if(mobile != rep_mobile) return '两次输入的手机号不一致';
			if(mobile == req.user.mobile) return '新手机号不可与旧手机号相同';
			if(!mobile.match(/1[34578]{1}\d{9}$/)) return '请输入正确的手机号';
		}
			function checkDataBind(){
				if(!mobile) return '请输入手机号';
				if(!verify) return '请输入验证码';
				if(!mobile.match(/1[34578]{1}\d{9}$/)) return '请输入正确的手机号';
			}
			function changeMobile(){
				async.waterfall([
					function(callback){
						request
							.get(config.API_YAOJIE + 'member/getVerifyApi/mobile/'+mobile+'/type/2')
							.end(function(err, data){
								if(data.ok && JSON.parse(data.res.text).errcode == 0){
									if(verify == JSON.parse(data.res.text).data){
										callback(null);
									}else{
										callback({flag:1,mes:'请输入正确的验证码'});
									}
								}
							});
					},
					function(callback){
						request.get(config.API_USER + 'member/get/member_id/'+req.user.member_id).end(function(err, data){
							if(data.ok){
								callback(null, JSON.parse(data.res.text).member_info.login_id);
							}else{
								callback({flag:1,mes:'异常,稍后重试'});
							}
						})
					},
					function (login_id, callback) {
						request.get(config.API_USER + 'member/ChangeMobile/login_id/'+login_id+'/mobile/'+mobile).end(function(err,data){
							if(data.ok && JSON.parse(data.res.text).flag == 1){
								callback(null);
							}else if(JSON.parse(data.res.text).flag == 2){
								callback({flag:1,mes:req.user.mobile?'修改绑定手机失败，此手机号已存在':'手机号绑定失败，此手机号已存在'});
							}else{
								callback({flag:1,mes:'异常,稍后重试'});
							}
						});
					}
				], function (err, result) {
					if(err){
						res.json({status:0,info:err.mes});
					}else{
						res.json({status:1,info:req.user.mobile?'手机号修改成功':'手机号绑定成功',url:'/my/security'});
					}
				});
			}
	};
	/*更改绑定邮箱*/
	this.getChangeEmail = function (req, res) {
		request
			.get(config.API_YAOJIE + 'member/sendActiveEmail/email/'+req.user.email+'/member_id/'+req.user.member_id+'/isValidate/1')
			.end(function (err, data) {
				if(data.ok && JSON.parse(data.res.text).errcode == 0){
					res.render(funcHepler.agent(req.headers['user-agent']) + '/views/my/email.html', {
						title:'更改绑定邮箱',
						ua: funcHepler.agent(req.headers['user-agent']),
						public: config.PUBLIC,
						type:'change'
					})
				}else{
					res.render(funcHelper.agent(req.headers['user-agent']) + '/views/error.html', {
						message: '网络异常，请稍后重试',
						error: {},
						goto:{href:'/',name:'回到首页'},
						public: config.PUBLIC
					});
				}
			});
	};
	/*绑定邮箱 页面*/
	this.getBindEmail = function (req, res) {
		res.render(funcHepler.agent(req.headers['user-agent']) + '/views/my/email.html', {
			title:'绑定邮箱',
			ua: funcHepler.agent(req.headers['user-agent']),
			public: config.PUBLIC,
			type:'bind'
		});
	};
	/*绑定邮箱*/
	this.bindEmail = function (req, res) {
		var  email = req.body.email;
		var tasks = [];
		tasks.push(function (callback) {
			if(!email) return callback(true, {info: '请输入邮箱'});
			if(!funcHepler.isEmail(email)) return callback(true, {info:'请输入正确的邮箱'});
			callback(null,{info:''});
		});
		tasks.push(function (callback) {
			request
				.get(config.API_USER + 'member/bindEmail/email/'+email+'/member_id/'+req.user.member_id)
				.end(function (err, data) {
					if(data.ok && JSON.parse(data.res.text).flag){
						if(JSON.parse(data.res.text).flag == 1) return callback(null,{info:'邮箱绑定成功', url:'/my/security'});
						else return callback(true, {info:'此邮箱已经绑定过'});
					}else{
						return callback(true, {info:'邮箱绑定失败'});
					}
				});
		});
		async.series(tasks, function (err, result) {
			if(err){
				logger.error('邮箱绑定出错');
				res.json({status:0,info:result[0].info || result[1].info});
			}else{
				res.json({status:1, info:result[1].info,url:result[1].url});
			}
		})
	}
	/*验证邮箱*/
	this.verifyEmail = function (req, res) {
		var verify = req.params.verify;
		request
			.get(config.API_YAOJIE + 'member/validateEmailApi/verify/'+verify+'/isValidate/1')
			.end(function (err, data) {
				if(data.ok && JSON.parse(data.res.text).errcode == 0){
					res.render(funcHepler.agent(req.headers['user-agent']) + '/views/my/email.html',{
						title:'填写新的邮箱',
						public:config.PUBLIC,
						ua:funcHepler.agent(req.headers['user-agent']),
						type:'verify'
					});
				}
			});
	};
	/*验证绑定*/
	this.validateChangeEmail = function (req, res) {
		var email = req.body.email,
				rep_email = req.body.rep_email;
		var tasks = [];
		tasks.push(function (callback) {
			if(!email) return callback(true, {info:'请输入新邮箱'});
			if(!rep_email) return callback(true, {info:'请再次输入新邮箱'});
			if(!funcHepler.isEmail(email)) return callback(true, {info:'请检查新邮箱格式'});
			if(email != rep_email) return callback(true, {info:'两次输入的新邮箱不一致'});
			callback(null, {info:''});
		});
		tasks.push(function (callback) {
			request
				.get(config.API_USER + 'member/bindEmail/member_id/'+req.user.member_id+'/email/'+email)
				.end(function (err, data) {
					if(data.ok && JSON.parse(data.res.text).flag){
							if(JSON.parse(data.res.text).flag == 1){
								callback(null,{info:'邮箱绑定成功',url:'/my/security'});
							}else{
								callback(true,{info:'此邮箱已经绑定过'});
							}
					}else{
						callback(true, '邮箱绑定失败');
					}
				});
		});
		async.series(tasks, function (err, result) {
			if(err){
				res.json({status:0,info:result[0].info||result[1].info});
			}else{
				res.json({status:1,info:result[1].info,url:result[1].url});
			}
		})
	};
	/*发送激活邮件*/
	this.sendEmail = function (req, res) {
		var _url = decodeURIComponent('member/sendActiveEmail/member_id/'+req.user.email+'/email/'+req.user.email+'/isValidate/'+req.params.isValidate);
		request
			.get(config.API_YAOJIE + _url)
			.end(function (err, data) {
				console.log('s',	data.res);
				if(data.ok && JSON.parse(data.res.text).errcode == 0){
					res.json({status:1, info:'验证邮件已发送到您的邮箱'});
				}else{
					res.json({status:0, info:'发送邮件失败'});
				}
			});
	};
}

module.exports = security;