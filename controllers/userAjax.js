var userAjax = new UserAjax();
var path = require('path')
var request = require('superagent');
var logger = require('./log');
var prefix = require('superagent-prefix')('/static');
var config = require('../config/config');
var async = require('async');
var ua = require('../middlewares/useragent');

function UserAjax(){
	/*保存用户信息*/
	this.editMemberInfo = function(req, res){
		var obj = JSON.parse(Object.keys(req.body)[0]);
		if(obj.year){
			obj.birthday = obj.year+'-'+obj.month+'-'+obj.day+' 00:00:00';
			delete obj.year;
			delete obj.month;
			delete obj.day;
		}
		var _param = obj.truename ? 'truename/'+obj.truename+'/' : '';
		_param += obj.nickname ? 'nickname/'+obj.nickname+'/' : '';
		_param += obj.birthday ? 'birthday/'+obj.birthday+'/' : '';
		_param += obj.gender ? 'gender/'+obj.gender : '';

		/*post 不行  需要用get*/
		_param = encodeURIComponent(_param);
		console.log(config.API_USER+'Member/Edit/member_id/'+req.user.member_id+'/'+_param);
		request
			.get(config.API_USER+'Member/Edit/member_id/'+req.user.member_id+'/'+_param)
			.end(function(err, data){
				if(err) logger.error(data.res.text);
				console.log(data.res.text)
				res.json(JSON.parse(data.res.text))
			})
	};
	/* 修改密码 */
	this.postChangePaw = function(req, res){
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

	/* 分享基金 */
	// this.

	/*绑定春波卡*/
	this.postBindGiftcard = function(req, res){
		var card_code = req.body.card_code,
				card_cwd = req.body.card_pwd,
				source = 1;
		request
			.get(config.API_USER + 'giftCard/actve/member_id/'+req.user.member_id+'/card_code/'+card_code+'/card_pwd/'+code_pwd)
			.end(function(err, data){
				if(JSON.parse(data.res.text).flag == 2){
					switch(JSON.parse(data.res.text).erron){
						case 9007:
							res.json({
								status:0,
								info:'激活信息为空！'
							});
							break;
						case 9008:
							res.json({
								status:0,
								info:'激活来源错误！'
							});
							break;
						case 9009:
							res.json({
								status:0,
								info:'用户ID错误！'
							});
							break;
						case 9010:
							res.json({
								status:0,
								info:'请输入春播卡号！'
							});
							break;
						case 9011:
							res.json({
								status:0,
								info:'请输入春播卡密码！'
							});
							break;
						case 1001:
							res.json({
								status:0,
								info:'此卡号不存在！'
							});
							break;
						case 1002:
							res.json({
								status:0,
								info:'春播卡密码错误！'
							});
							break;
						default:
							res.json({
								status:0,
								info:'春播卡激活失败'
							});
							break;
					}
				}else{
					res.json({
						status:1,
						info:'激活成功！'
					});
				}
			});
	};
	/* 绑定春播券*/
	this.postBindCoupons = function(req, res){
		var coupons_number = req.body.coupons_number;
		request
			.post(config.API_USER + 'Coupons/activation/member_id/'+req.user.member_id+'/coupons_number/'+coupons_number)
			.end(function(err, data){
				if(JSON.parse(data.res.text).flag == 2){
					res.json({
						status:0,
						info:'无效的春播券号！'
					});
				}else{
					res.json({
						status:1,
						info:'绑定成功！'
					});
				}
			});
	};

	/*删除心愿单*/
	this.postDelFav = function (req, res) {
		var favorite_id = req.body.favorite_id;
		request
			.get(config.API_USER + 'Favorite/del/member_id/'+req.user.member_id+'/favorite_id/'+favorite_id)
			.end(function(err, data){
				res.json({
					status: JSON.parse(data.res.text).flag == 1? 1:0
				});
			});
	};

	/*添加心愿单*/
	this.postAddFav = function(req, res){
		var type = req.body.type,
				good_id = (type == 1) ? ('/product_id/'+req.body.product_id) : ('/cookbook_id/'+req.body.cookbook_id);
		request
			.get(config.API_USER + 'Favorite/add/member_id/'+req.user.member_id+'/type/'+type+good_id)
			.end(function(err, data){
				res.json({
					status: JSON.parse(data.res.text).flag == 1? 1:0
				});
			});
	};
};
module.exports = userAjax;