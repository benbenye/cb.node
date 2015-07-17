var user = new User();
var path = require('path')
var request = require('superagent');
var logger = require('./log');
var prefix = require('superagent-prefix')('/static');
var config = require('../config/config');
var async = require('async');
var funcHepler = require('../middlewares/funcHelper');

function User(){
	/*我的春播首页*/
	this.getIndex = function(req, res){
		var tasks = [],
			member_id = req.user.member_id,
			status = req.query.status || 0;
		/*订单总数*/
		tasks.push(function(callback){
			request
				.get(config.API_CART + 'Order/OrderCount/member_id/'+ member_id)
				.end(function(err, data){
					if(err || !data.ok){
						return callback(err || 'data.ok', '获取订单总数失败');
					}
					callback(err, data);
				});
		});
		/*订单列表*/
		tasks.push(function(callback){
			request
				.get(config.API_CART + 'Order/lists/member_id/'+member_id+'/status/'+status)
				.end(function(err, data){
					if(err || !data.ok){
						return callback(err || 'data.ok', '获取订单列表失败');
					}
					callback(err, data);
				})
		});
		/*积分数*/
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'Points/getPointsTotal/member_id/'+member_id)
				.end(function(err, data){
					if(err || !data.ok){
						return callback(err || 'data.ok', '获取积分数失败');
					}
					callback(err, data);
				});
		});
		/*春播卡余额*/
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'Giftcard/get/member_id/'+member_id)
				.end(function(err, data){
					if(err || !data.ok){
						return callback(err || 'data.ok', '获取春播卡余额失败');
					}
					callback(err,data);
				});
		});
		/*可用余额*/
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'Balance/get/member_id/'+member_id)
				.end(function(err, data){
					if(err || !data.ok){
						return callback(err || 'data.ok', '获取可用余额失败');
					}
					callback(err, data);
				});
		});
		/*春播券*/
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'Coupons/lists/member_id/'+member_id)
				.end(function(err, data){
					if(err || !data.ok){
						return callback(err || 'data.ok', '获取春播券失败');
					}
					callback(err, data);
				})
		});

		async.parallel(tasks, function(err, result){
			if(err){
				logger.error('获取我的春播首页信息-服务器异常');
				logger.error(err);
				res.status(500);
				res.render(funcHepler.agent(req.headers['user-agent'])+'/views/error.html',{
					title:'服务器异常',
					public: config.PUBLIC,
					ua:funcHepler.agent(req.headers['user-agent'])
				});
				return;
			}
			res.render(funcHepler.agent(req.headers['user-agent']) + '/views/my/index.html', {
				orderCount: JSON.parse(result[0].res.text).list,
				orderList: JSON.parse(result[1].res.text).list ? JSON.parse(result[1].res.text).list.slice(0, 3) : null,
				points: JSON.parse(result[2].res.text).points,
				giftCardBalance: JSON.parse(result[3].res.text).balance,
				balance: JSON.parse(result[4].res.text).balance,
				coupons: JSON.parse(result[4].res.text).count,
				title: '我的春播-春播',
				isIndex: true,
				status: status,
				userInfo: req.user,
				avatar_url: req.user.avatar_url.replace('.jpg', '_80_80.jpg'),
				public: config.PUBLIC,
				ua: funcHepler.agent(req.headers['user-agent'])
			});
		});
	};
	/*浏览记录*/
	this.getHistory = function (req, res) {
		var history = unescape(req.cookies.look_history) || '9111,9137';
		console.log(req.cookies.look_history);

		request
			.get(config.API_CATALOG + 'product/getByIds/product_id/' + '9111,9137')
			.end(function (err, data) {
				if(err || !data.ok || JSON.parse(data.res.text).flag == 2){
					logger.error('浏览记录-服务异常');
					logger.error(err);
					res.status(500);
					res.render(funcHepler.agent(req.headers['user-agent'])+'/views/error.html',{
						title:'服务器异常',
						public: config.PUBLIC,
						ua:funcHepler.agent(req.headers['user-agent'])
					});
					return;
				}
				var resData = JSON.parse(data.res.text);
				if(resData.flag == 1){
					var str = '<a href="javascript:;" class="left_btn left_btn_disable" onclick="aLeft(this);"></a>'+
					'<a href="javascript:;" class="right_btn" onclick="aRight(this)"></a>'+
					'<div class="lunbo">'+
					'<ul class="clearfix">';

					resData.product_info.forEach(function (o) {
						str += '<li> <a href="/product/'+
						o.product_id+'.html" class="img" target="_blank"><img src="http://i2.chunboimg.com/'+
						resData.img_list[o.product_id]['url'].replace('.jpg','_120_120.jpg')+'"></a><p class="name">'+
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
	/* 我的心愿单 */
	this.getFav = function (req, res) {
		var tasks = [],
			type = req.query.type || 1,
			page = req.query.page || 1,
			pageSize = (type == 1) ? 8 : 6,
			count = 0;
		tasks.push(function (callback) {
			request
				.get(config.API_USER + 'Favorite/gets/member_id/'+req.user.member_id+'/type/'+type+'/page_size/'+pageSize+'/page/'+page)
				.end(function(err, data){
					if(err || !data.ok){
						return callback(err || 'data.ok', '获取心愿单失败');
					}
					if(data.ok && JSON.parse(data.res.text).flag == 1){
						count = JSON.parse(data.res.text).count;
						callback(err, JSON.parse(data.res.text).list)
					}else{
						callback(err,[]);
					}
				});
		});
		async.parallel(tasks, function (err, result) {
			if(err){
				logger.error('我的心愿单-服务异常');
				logger.error(err);
				res.status(500);
				res.render(funcHepler.agent(req.headers['user-agent'])+'/views/error.html',{
					title:'服务器异常',
					public: config.PUBLIC,
					ua:funcHepler.agent(req.headers['user-agent'])
				});
				return;
			}
			res.render(funcHepler.agent(req.headers['user-agent']) + '/views/my/fav.html', {
				title: '我的心愿单-交易管理-春播',
				data: result[0],
				userInfo: req.user,
				public: config.PUBLIC,
				type: type,
				page: page,
				pages: count ? Math.ceil(count / pageSize) : 0,
				ua: funcHepler.agent(req.headers['user-agent'])
			});
		});
	};
	/* 我的积分，获取积分明细和积分个数 */
	this.getPoints = function(req, res, next){
		var tasks = [],
				type = req.query.type || 3,
				page = req.query.page || 1;
		/*获取积分列表*/
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'Points/gets/member_id/'+req.user.member_id+'/type/'+type+'/page/'+page)
				.end(function(err, data){
					if(err || !data.ok){
						return callback(err || 'data.ok', '获取积分列表失败');
					}
					callback(err, data);
				});
		});
		/*获取积分总数*/
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'Points/getPointsTotal/member_id/'+req.user.member_id)
				.end(function(err, data){
					if(err || !data.ok){
						return callback(err || 'data.ok', '获取积分总数失败');
					}
					callback(err, data);
				});
		});

		async.parallel(tasks,function(err, result){
			if(err){
				logger.error('我的积分-服务器异常');
				logger.error(err);
				res.status(500);
				res.render(funcHepler.agent(req.headers['user-agent'])+'/views/error.html',{
					title:'服务器异常',
					public: config.PUBLIC,
					ua:funcHepler.agent(req.headers['user-agent'])
				});
				return;
				//return next(err);
			}
			res.render(funcHepler.agent(req.headers['user-agent']) + '/views/my/points.html', {
					title: '我的积分-账户中心-春播',
					public: config.PUBLIC,
					userInfo: req.user,
					data: result[0].res.body,
					pointsTotal: result[1].res.body.pointsTotal,
					page: page,
					pages: result[0].res.body.count ? Math.ceil(result[0].res.body.count / 10) : 0,
					type: type,
					ua: funcHepler.agent(req.headers['user-agent'])
				});
		});
	};
	/* 个人信息 */
	this.getMyInfo = function(req, res){
		res.render(funcHepler.agent(req.headers['user-agent'])+'/views/my/myInfor.html',{
			title:'个人信息-账户中心-春播',
			public: config.PUBLIC,
			userInfo:req.user,
			avatar_url:req.user.avatar_url.replace('.jpg','_120_120.jpg'),
			ua : funcHepler.agent(req.headers['user-agent'])
		});
	};
	/* 我的春播券 */
	this.getCoupons = function(req, res){
		var tasks = [],
				is_enable = req.query.is_enable || 5,
				page = req.query.page || 1;
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'Coupons/lists/member_id/'+req.user.member_id+'/is_enable/'+is_enable+'/page/'+page)
				.end(function(err, data){
					if(err || !data.ok){
						return callback(err || 'data.ok', '获取春播券列表失败');
					}
					callback(err, data);
				})
		});
		async.parallel(tasks, function(err, result){
			if(err){
				logger.error('我的春播券-服务器异常');
				logger.error(err);
				res.status(500);
				res.render(funcHepler.agent(req.headers['user-agent']) + '/views/error.html',{
					title:'服务器异常',
					public: config.PUBLIC,
					ua:funcHepler.agent(req.headers['user-agent'])
				});
				return;
			}
			res.render(funcHepler.agent(req.headers['user-agent'])+'/views/my/coupons.html',{
				title: '我的春播券-账户中心-春播',
				public: config.PUBLIC,
				userInfo:req.user,
				couponsObj: result[0].res.body,
				count: result[0].res.body.count,
				is_enable:is_enable,
				page:page,
				pages: JSON.parse(result[0].res.text).count ? Math.ceil(JSON.parse(result[0].res.text).count/10):0,
				ua:funcHepler.agent(req.headers['user-agent'])
			});
		})

	};
	/* 我的春播卡 */
	this.getGiftcards = function(req, res){
		var tasks = [],
				page = req.query.page || 1;
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'giftcard/lists/member_id/'+req.user.member_id+'/page/'+page)
				.end(function(err, data){
					if(err || !data.ok){
						return callback(err || 'data.ok', '获取春播卡列表失败');
					}
					callback(err, data);
				});
		});
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'giftcard/get/member_id/'+req.user.member_id)
				.end(function(err, data){
					if(err || !data.ok){
						return callback(err || 'data.ok', '获取春播卡失败');
					}
					callback(err, data);
				});
		});
		async.parallel(tasks, function(err, result){
			if(err){
				logger.error('我的春播卡-服务异常');
				logger.error(err);
				res.status(500);
				res.render(funcHepler.agent(req.headers['user-agent']) + '/views/error.html',{
					title:'服务异常',
					public:config.PUBLIC,
					ua:funcHepler.agent(req.headers['user-agent'])
				});
				return;
			}
			res.render(funcHepler.agent(req.headers['user-agent'])+'/views/my/giftcards.html',{
				title: '我的春播卡-账户中心-春播',
				public: config.PUBLIC,
				userInfo:req.user,
				pageSize: config.PAGE_SIZE,
				giftCardObj: JSON.parse(result[0].res.text),
				giftCardBalance: JSON.parse(result[1].res.text).balance,
				ua:funcHepler.agent(req.headers['user-agent']),
				page:page,
				pages: JSON.parse(result[0].text).count ? Math.ceil(JSON.parse(result[0].text).count /10):0
			});	
		})

	};
	/* 账户安全 */
	this.getSecurity = function(req, res){
		var security = 1;
		
		request
			.get(config.API_USER + 'Member/GetPayPwd/member_id/'+req.user.member_id)
			.end(function(err, data){
				if(err || !data.ok){
					logger.error('账户安全-服务异常');
					logger.error(err);
					res.status(500);
					res.render(funcHepler.agent(req.headers['user-agent']) + '/views/error.html',{
						title:'服务异常',
						public:config.PUBLIC,
						ua:funcHepler.agent(req.header['user-agent'])
					});
					return;
				}
				var payPwd_status = JSON.parse(data.res.text).flag;
				if(req.user.validate_email == 1 && req.user.mobile !='' && payPwd_status == 1){
					security = 3;
				}else if(req.user.validate_email == 1 || req.user.mobile !=''){
					security = 2;
				}
				res.render(funcHepler.agent(req.headers['user-agent'])+'/views/my/security.html',{
					title: '账户安全-账户中心-春播',
					userInfo:req.user,
					public: config.PUBLIC,
					security: security,
					isSetPayPwd : payPwd_status != 1,
					isBindMobile : req.user.mobile ? false : true,/*是否绑定手机号，已经有手机号的就是false，没有的是绑定true*/
					mobile: req.user.mobile ? req.user.mobile.replace(req.user.mobile.slice(3,7),'****') : '',
					email: req.user.email ? req.user.email.replace(req.user.email.slice(2,10),'*****') : ''
				});
			})

	};
	/* 我的余额 */
	this.getBalance = function(req, res){
		var tasks = [],
				member_id = req.user.member_id,
				type = req.query.type || 3,
				page_index = req.query.page || 1;
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'Balance/lists/member_id/'+member_id+'/page_index/'+page_index+'/type/'+type)
				.end(function(err, data){
					if(err || !data.ok){
						return callback(err || 'data.ok', '获取余额列表失败');
					}
					callback(err, data);
				});
		});
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'Balance/get/member_id/'+member_id)
				.end(function(err, data){
					if(err || !data.ok){
						return callback(err || 'data.ok', '获取余额总数失败');
					}
					callback(err, data);
				});
		});

		async.parallel(tasks,function(err, result){
			if(err){
				logger.error('我的余额-服务器异常');
				logger.error(err);
				res.status(500);
				res.render(funcHepler.agent(req.headers['user-agent'])+'/views/error.html',{
					title:'服务器异常',
					public: config.PUBLIC,
					ua: funcHepler.agent(req.headers['user-agent'])
				});
			return;
			}
			res.render(funcHepler.agent(req.headers['user-agent'])+'/views/my/balance.html',{
				title: '我的余额-账户中心-春播',
				public: config.PUBLIC,
				balanceObj: result[0].res.body,
				userInfo:req.user,
				balance: result[1].res.balance,
				ua:funcHepler.agent(req.headers['user-agent']),
				page:page_index,
				type:type,
				pages: JSON.parse(result[0].res.text).count ? Math.ceil(JSON.parse(result[0].res.text).count/10):0
			});
		});
	};
	/* 分享基金 */
	this.getInvitation = function(req, res){
		var tasks = [],
				member_id = req.user.member_id;
		// 获取用户级别
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'Invite/getApi/member_id/'+member_id)
				.end(function(err, data){
					if(err || !data.ok){
						return callback(err || 'data.ok', '获取用户级别失败');
					}
					callback(err, data);
				});
		});
		// 获取用户上一个状态
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'Invite/getPrevStatusApi/member_id/'+member_id)
				.end(function(err, data){
					if(err || !data.ok){
						return callback(err || 'data.ok', '获取用户上一个状态失败');
					}
					callback(err, data);
				});
		});
		// 获取邀请列表
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'InviteLog/lists/member_id/'+member_id+'/status/1')
				.end(function(err, data){
					if(err || !data.ok){
						return callback(err || 'data.ok', '获取邀请列表1失败');
					}
					data = JSON.parse(data.res.text);
					data.amountSum = 0;
					data.counponsSum = 0;
					if(data.count){
						data.list.map(function(a){
							if(a.type == 1){data.counponsSum += parseInt(a.log_amount);}
							else if(a.type == 2){data.amountSum += parseInt(a.log_amount);}
						});
					}
					callback(err, data);
				});
		});
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'InviteLog/lists/member_id/'+member_id+'/status/2')
				.end(function(err, data){
					if(err || !data.ok){
						return callback(err || 'data.ok', '获取邀请列表2失败');
					}
					data = JSON.parse(data.res.text);
					data.amountSum = 0;
					data.counponsSum = 0;
					if(data.count){
						data.list.map(function(a){
							if(a.type == 1){data.counponsSum += parseInt(a.log_amount);}
							else if(a.type == 2){data.amountSum += parseInt(a.log_amount);}
						});
					}
					callback(err, data);
				});
		});
		async.parallel(tasks, function(err, result){
			if(err){
				logger.error('分享基金-服务异常');
				logger.error(err);
				res.status(500);
				res.render(funcHepler.agent(req.headers['user-agent'])+'/views/error.html',{
					title:'服务器异常',
					public: config.PUBLIC,
					ua: funcHepler.agent(req.headers['user-agent'])
				});
				return;
			}
			res.render(funcHepler.agent(req.headers['user-agent'])+'/views/my/invitation.html',{
				title: '分享基金-账户中心-春播',
				userInfo:req.user,
				public: config.PUBLIC,
				inviteStatus: JSON.parse(result[0].res.text).status,
				preStatus: JSON.parse(result[1].res.text),
				inviteLoged: result[2],
				inviteLoging: result[3]
			});
		});

	};
}

module.exports = user;
