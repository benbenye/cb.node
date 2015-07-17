var userAjax = new UserAjax();
var path = require('path')
var request = require('superagent');
var logger = require('./log');
var prefix = require('superagent-prefix')('/static');
var config = require('../config/config');
var async = require('async');
var funcHepler = require('../middlewares/funcHelper');

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
		request
			.get(config.API_USER+'Member/Edit/member_id/'+req.user.member_id+'/'+_param)
			.end(function(err, data){
				if(err) logger.error(data.res.text);
				console.log(data.res.text)
				res.json(JSON.parse(data.res.text))
			})
	};

	/* 分享基金 */
	// this.

	/*绑定春播卡*/
	this.postBindGiftcard = function(req, res){
		var card_code = req.body.card_code,
				card_pwd = req.body.card_pwd,
				source = 1;
		request
			.get(config.API_USER + 'giftCard/actve/member_id/'+req.user.member_id+'/card_code/'+card_code+'/card_pwd/'+card_pwd)
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

	/*本周热销*/
	this.hot = function(req, res, next){
		console.log('sss');
		request
			.get(config.API_YAOJIE+'member/index_hot/member_id/'+req.user.member_id)
			.end(function(err, data){
				if(err || !data.ok || JSON.parse(data.res.text).flag == 2){
					logger.error(err || JSON.parse(data.res.text).error_msg || 'data.ok');
					return next();
				}
				if(data.ok && JSON.parse(data.res.text).flag == 1){
					var resData = JSON.parse(data.res.text);
					var str = '<a href="javascript:;" class="left_btn left_btn_disable" onclick="aLeft(this);"></a>'+
						'<a href="javascript:;" class="right_btn" onclick="aRight(this)"></a>'+
						'<div class="lunbo">'+
						'<ul class="clearfix">';
					resData.data.forEach(function (o) {
						str += '<li> <a href="/product/'+
						o.product_id+'.html" class="img" target="_blank"><img src="'+
						o.image_url+'"></a><p class="name">'+
						o.subname+'</p><h4><a href="/product/'+
						o.product_id+'.html" target="_blank">'+
						o.shortname+'</a></h4><p class="price"><strong>￥ '+
						o.chunbo_price+'</strong></p><p class="num">'+
						o.specifications+'</p></li>'
					});
					str += '</ul></div>';
					res.send(str);
				}
			});
	};

	/*购买记录*/
	this.already = function (req, res, next) {
		request.get(config.API_YAOJIE + 'member/index_already/member_id/' + req.user.member_id).end(function (err, data) {
			if(err || !data.ok ||  JSON.parse(data.res.text).flag == 2){
				logger.error(err || JSON.parse(data.res.text).error_msg || 'data.ok')
				return next();
			}
			if (data.ok &&  JSON.parse(data.res.text).flag == 1) {
				var resData = JSON.parse(data.res.text);

				var str = '<a href="javascript:;" class="left_btn left_btn_disable" onclick="aLeft(this);"></a>' +
					'<a href="javascript:;" class="right_btn" onclick="aRight(this)"></a>' +
					'<div class="lunbo">' +
					'<ul class="clearfix">';
				var data = Object.keys(resData.data);
				data.forEach(function (o) {
					str += '<li> <a href="/product/' +
					resData.data[o].product_id + '.html" class="img" target="_blank"><img src="' +
					resData.data[o].url + '"></a><p class="name">' +
					resData.data[o].subname + '</p><h4><a href="/product/' +
					resData.data[o].product_id + '.html" target="_blank">' +
					resData.data[o].shortname + '</a></h4><p class="price"><strong>￥ ' +
					resData.data[o].chunbo_price + '</strong></p><p class="num">' +
					resData.data[o].specifications + '</p></li>'
				});
				str += '</ul></div>';
				res.send(str);
			}
		});
	}
};
module.exports = userAjax;