var user = new User();
var path = require('path')
var request = require('superagent');
var logger = require('./log');
var prefix = require('superagent-prefix')('/static');
var config = require('../config');
var async = require('async');
var ua = require('../middlewares/useragent');



function User(){
/*登录请求
* @param username
* @param password
* 【API】 member/login/username/2343/password/sds
* */
	this.login = function(req, res){
		var username = req.body.username,
				password = req.body.password,
				_url = 'member/login/username/'+username+'/password/'+password;
		request
			.get(config.API_USER + _url)
			.end(function(err, data){
				var resData = JSON.parse(data.res.text);
				if(resData.flag == 1){
					req.session.user = resData;
					res.cookie(data.res.headers['set-cookie']);
					res.cookie('is_reg_info', '1', {expires: new Date(Date.now() + 900000)});
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

	/*我的春播首页*/
	this.getIndex = function(req, res){
		var tasks = [],
				member_id = req.session.user.member_info.member_id;
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
				.get(config.API_CART + 'Order/lists/member_id/'+member_id)
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
				userInfo:req.session.user.member_info,
				avatar_url:req.session.user.member_info.avatar_url.replace('.jpg', '_80_80.jpg'),
				public: config.PUBLIC
			});
		});
	};

	/*订单信息*/
	this.getOrderInfo = function(req, res){
		var tasks = [];
		tasks.push(function(callback){
			request
				.get(config.API_CART + 'Order/OrderCount/member_id/'+ req.session.user.member_info.member_id)
				.end(function(err, data){
					callback(err, data);
				});
		});
		tasks.push(function(callback){
			request
				.get(config.API_CART + 'order/lists/member_id/'+req.session.user.member_info.member_id)
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
			res.render(ua.agent(req.headers['user-agent'])+'/views/my/orderInfo.html',{
				title:'我的订单',
				public:config.PUBLIC,
				userInfo:req.session.user.member_info,
				orderCount: JSON.parse(result[0].res.text).list,
				orderList: JSON.parse(result[1].res.text).list
			})
		});
	};

	/* 我的积分，获取积分明细和积分个数
	* 【API格式】获取积分列表  Points/gets/member_id/59
	* 【API格式】获取积分个数  Points/getPointsTotal/member_id/59
	*/
	this.getPoints = function(req, res){
		var tasks = [];
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'Points/gets/member_id/'+req.session.user.member_info.member_id)
				.end(function(err, data){
					if(data.res.body.flag !== 1) logger.warn(data.res.body);
					callback(err, data);
				});
		});
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'Points/getPointsTotal/member_id/'+req.session.user.member_info.member_id)
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
				data:result[0].res.body,
				pointsTotal:result[1].res.body.pointsTotal,
				pages:Math.ceil(result[0].res.body.count/10),
				title: '我的积分',
				userInfo:req.session.user,
				pageSize: config.PAGE_SIZE,
				public: config.PUBLIC,
				ua:ua.agent(req.headers['user-agent'])
			});
		});
	};

	/* 个人信息 */
	this.getMyInfo = function(req, res){
		res.render(ua.agent(req.headers['user-agent'])+'/views/my/myInfor.html',{
			title:'个人信息',
			public: config.PUBLIC,
			userInfo:req.session.user.member_info,
			avatar_url:req.session.user.member_info.avatar_url.replace('.jpg','_120_120.jpg')
		});
	};

	/* 我的积分，分页
	* method get(ajax)
	* @query[member_id]   用户ID
	* @query[type]        积分类型 默认3(明细) 收入1 支出2
	* @query[page]        页码  默认1
	* @query[page_size]   每页数量   默认10
	* 【API格式】获取分页积分列表  Points/gets/member_id/59/type/3/page/1/page_size/10
	*/
	this.pagePoints = function(req, res){
		var query = req.query;
		var _url = 'member_id/' + query.member_id + '/type/' + query.type + '/page/' + query.page + '/page_size/'+config.PAGE_SIZE;
		request
			.get(config.API_USER + 'Points/gets/'+_url)
			.end(function(err, data){
				if(data.res.body){
					res.send({
						pointsList:data.res.body.points_list
					});
				}
			
			});
	};

	/* 我的春播券
	*
	*/
	this.getCoupons = function(req, res){
		var tasks = [];
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'Coupons/lists/member_id/'+req.session.user.member_info.member_id)
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
				userInfo:req.session.user,
				couponsLists: result[0].res.body.list,
				count: result[0].res.body.count,
				pageSize: config.PAGE_SIZE,
				public: config.PUBLIC
			});
		})

	};
	/* 我的春播卡
	*
	*/
	this.getGiftcards = function(req, res){
		res.render(ua.agent(req.headers['user-agent'])+'/views/my/giftcards.html',{
			title: '我的春播卡',
			userInfo:req.session.user,
			pageSize: config.PAGE_SIZE,
			public: config.PUBLIC
		});
	};
	/* 账户安全
	*
	*/
	this.getSecurity = function(req, res){
		res.render(ua.agent(req.headers['user-agent'])+'/views/my/security.html',{
			title: '账户安全',
			userInfo:req.session.user,
			public: config.PUBLIC
		});
	};
	/* 我的余额
	* 
	* 【API】余额列表 Balance/lists/member_id/59
	* 【API】可用余额 Balance/get/member_id/59
	*/
	this.getBalance = function(req, res){
		var tasks = [];
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'Balance/lists/member_id/'+req.session.user.member_info.member_id)
				.end(function(err, data){
					callback(err, data);
				});
		});
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'Balance/get/member_id/'+req.session.user.member_info.member_id)
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
				balanceList: result[0].res.body.list,
				userInfo:req.session.user,
				balance: result[1].res.balance,
				public: config.PUBLIC
			});
		});
	};
	/* 分享基金
	*
	*/
	this.getInvitation = function(req, res){
		res.render(ua.agent(req.headers['user-agent'])+'/views/my/invitation.html',{
			title: '分享基金',
			userInfo:req.session.user,
			public: config.PUBLIC
		});
	};
}

module.exports = user;
