var user = new User();
var path = require('path')
var request = require('superagent');
var logger = require('./log');
var prefix = require('superagent-prefix')('/static');
var config = require('../config/config');
var async = require('async');
var ua = require('../middlewares/useragent');



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
					callback(err, data);
				});
		});
		/*订单列表*/
		tasks.push(function(callback){
			request
				.get(config.API_CART + 'Order/lists/member_id/'+member_id+'/status/'+status)
				.end(function(err, data){
					callback(err, data);
				})
		});
		/*积分数*/
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'Points/getPointsTotal/member_id/'+member_id)
				.end(function(err, data){
					callback(err, data);
				});
		});
		/*春播卡余额*/
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'Giftcard/get/member_id/'+member_id)
				.end(function(err, data){
					callback(err,data);
				});
		});
		/*可用余额*/
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'Balance/get/member_id/'+member_id)
				.end(function(err, data){
					callback(err, data);
				});
		});
		/*春播券*/
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'Coupons/lists/member_id/'+member_id)
				.end(function(err, data){
					callback(err, data);
				})
		});

		async.parallel(tasks, function(err, result){
			if(err){
				logger.error('服务器异常');
				res.status(500);
				res.render(ua.agent(req.headers['user-agent'])+'/views/error.html',{
					title:'服务器异常',
					public: config.PUBLIC
				});
			}
			res.render(ua.agent(req.headers['user-agent'])+'/views/my/index.html',{
				orderCount:JSON.parse(result[0].res.text).list,
				orderList:JSON.parse(result[1].res.text).list,
				points:JSON.parse(result[2].res.text).points,
				giftCardBalance:JSON.parse(result[3].res.text).balance,
				balance:JSON.parse(result[4].res.text).balance,
				coupons:JSON.parse(result[4].res.text).count,
				title: '我的春播-春播',
				isIndex: true,
				status: status,
				userInfo:req.user,
				avatar_url:req.user.avatar_url.replace('.jpg', '_80_80.jpg'),
				public: config.PUBLIC
			});
		});
	};

	/*登录请求 */
	this.login = function(req, res){
		var username = req.body.username,
				password = req.body.password,
				_url = 'member/login/username/'+username+'/password/'+password;
		request
			.get(config.API_USER + _url)
			.end(function(err, data){
				var resData = JSON.parse(data.res.text);
				if(resData.flag == 1){
					req.session.user = {member_id : resData.member_info.member_id};
					res.cookie(data.res.headers['set-cookie']);
					res.cookie('is_reg_info', '1');
					res.redirect('/');
				}else{
					// 账号有误
				}
			});
	};
	/*退出*/
	this.logout = function(req, res){
		req.session.user = null;
		res.redirect('/');
	};
	
	this.loginView = function(req, res){
		res.render(ua.agent(req.headers['user-agent'])+'/views/public/login.html',{
			title:'登陆页面',
			public:config.PUBLIC
		})
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
					if(JSON.parse(data.res.text).flag == 1){
						count = JSON.parse(data.res.text).count;
						callback(err, JSON.parse(data.res.text).list)
					}else{
						callback(err, []);
					}
				});
		});
		async.parallel(tasks, function (err, result) {
			if(err){
				logger.error('user.js: line: 147, error: djdf');
			}
			res.render(ua.agent(req.headers['user-agent'])+'/views/my/fav.html', {
				title: '我的心愿单',
				data: result[0],
				userInfo: req.user,
				public:config.PUBLIC,
				type:type,
				page:page,
				pages: count ? Math.ceil(count/pageSize) : 0,
				ua: ua.agent(req.headers['user-agent'])
			});
		});
	};

	/* 我的积分，获取积分明细和积分个数 */
	this.getPoints = function(req, res){
		var tasks = [],
				type = req.query.type || 3,
				page = req.query.page || 1;
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'Points/gets/member_id/'+req.user.member_id+'/type/'+type+'/page/'+page)
				.end(function(err, data){
					if(data.res.body.flag !== 1) logger.warn(data.res.body);
					callback(err, data);
				});
		});
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'Points/getPointsTotal/member_id/'+req.user.member_id)
				.end(function(err, data){
					callback(err, data);
				});
		});

		async.parallel(tasks,function(err, result){
			if(err){
				logger.error('服务器异常');
				res.status(500);
				res.render(ua.agent(req.headers['user-agent'])+'/views/error.html',{
					title:'服务器异常',
					public: config.PUBLIC
				});
			}
			res.render(ua.agent(req.headers['user-agent'])+'/views/my/points.html',{
				title: '我的积分',
				public: config.PUBLIC,
				userInfo: req.user,
				data:result[0].res.body,
				pointsTotal:result[1].res.body.pointsTotal,
				page: page,
				pages:result[0].res.body.count ? Math.ceil(result[0].res.body.count/10):0,
				type:type,
				ua:ua.agent(req.headers['user-agent'])
			});
		});
	};

	/* 个人信息 */
	this.getMyInfo = function(req, res){
		res.render(ua.agent(req.headers['user-agent'])+'/views/my/myInfor.html',{
			title:'个人信息',
			public: config.PUBLIC,
			userInfo:req.user,
			avatar_url:req.user.avatar_url.replace('.jpg','_120_120.jpg'),
			ua : ua.agent(req.headers['user-agent'])
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
					callback(err, data);
				})
		});
		async.parallel(tasks, function(err, result){
			if(err){
				logger.error('服务器异常');
				res.status(500);
				res.render('../projects/error.html',{
					title:'服务器异常',
					public: config.PUBLIC
				});
			}
			res.render(ua.agent(req.headers['user-agent'])+'/views/my/coupons.html',{
				title: '我的春播券',
				public: config.PUBLIC,
				userInfo:req.user,
				couponsObj: result[0].res.body,
				count: result[0].res.body.count,
				is_enable:is_enable,
				page:page,
				pages: JSON.parse(result[0].res.text).count ? Math.ceil(JSON.parse(result[0].res.text).count/10):0,
				ua:ua.agent(req.headers['user-agent'])
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
					callback(err, data);
				});
		});
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'giftcard/get/member_id/'+req.user.member_id)
				.end(function(err, data){
					callback(err, data);
				});
		});
		async.parallel(tasks, function(err, result){
			res.render(ua.agent(req.headers['user-agent'])+'/views/my/giftcards.html',{
				title: '我的春播卡',
				public: config.PUBLIC,
				userInfo:req.user,
				pageSize: config.PAGE_SIZE,
				giftCardObj: JSON.parse(result[0].res.text),
				giftCardBalance: JSON.parse(result[1].res.text).balance,
				ua:ua.agent(req.headers['user-agent']),
				page:page,
				pages: JSON.parse(result[0].text).count ? Math.ceil(JSON.parse(result[0].text).count /10):0
			});	
		})

	};
	/* 账户安全 */
	this.getSecurity = function(req, res){
		var security = 1;
		if(req.user.validate_email == 1 && req.user.mobile !='' && req.user.payPwd_status == 1){
			security = 3;
		}else if(req.user.validate_email == 1 || req.user.mobile !=''){
			security = 2;
		}
		res.render(ua.agent(req.headers['user-agent'])+'/views/my/security.html',{
			title: '账户安全',
			userInfo:req.user,
			public: config.PUBLIC,
			security: security
		});
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
					callback(err, data);
				});
		});
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'Balance/get/member_id/'+member_id)
				.end(function(err, data){
					callback(err, data);
				});
		});

		async.parallel(tasks,function(err, result){
			if(err){
				logger.error('服务器异常');
				res.status(500);
				res.render(ua.agent(req.headers['user-agent'])+'/views/error.html',{
					title:'服务器异常',
					public: config.PUBLIC
				});
			}
			res.render(ua.agent(req.headers['user-agent'])+'/views/my/balance.html',{
				title: '我的余额',
				public: config.PUBLIC,
				balanceObj: result[0].res.body,
				userInfo:req.user,
				balance: result[1].res.balance,
				ua:ua.agent(req.headers['user-agent']),
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
					callback(err, data);
				});
		});
		// 获取用户上一个状态
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'Invite/getPrevStatusApi/member_id/'+member_id)
				.end(function(err, data){
					callback(err, data);
				});
		});
		// 获取邀请列表
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'InviteLog/lists/member_id/'+member_id+'/status/1')
				.end(function(err, data){
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
			var inviteLogedCount = 0,
					inviteLogingCount = 0;

			res.render(ua.agent(req.headers['user-agent'])+'/views/my/invitation.html',{
				title: '分享基金',
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
