var user = new User();
var path = require('path')
var request = require('superagent');
var logger = require('./log');
var prefix = require('superagent-prefix')('/static');
var config = require('../config');
var async = require('async');



function User(){
	/* 我的积分，获取积分明细和积分个数
	* 【API格式】获取积分列表  Points/gets/member_id/59
	* 【API格式】获取积分个数  Points/getPointsTotal/member_id/59
	*/
	this.getPoints = function(req, res, next){
		var tasks = [];
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'Points/gets/member_id/59')
				.end(function(err, data){
					if(data.flag !== 1) logger.warn(data.res.body);
					callback(err, data);
				});
		});
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'Points/getPointsTotal/member_id/59')
				.end(function(err, data){
					callback(err, data);
				});
		});

		async.parallel(tasks,function(err, result){
			if(err){
				logger.error('服务器异常');
				res.status(500);
				res.render('../views/error.html',{
					title:'服务器异常',
					public: config.PUBLIC
				});
			}
			res.render('../views/mychunbo/points.html',{
				data:result[0].res.body,
				pointsTotal:result[1].res.body.pointsTotal,
				pages:Math.ceil(result[0].res.body.count/10),
				title: '我的积分',
				pageSize: config.PAGE_SIZE,
				public: config.PUBLIC
			});
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
	this.pagePoints = function(req, res, next){
		var query = req.query;
		var _url = 'member_id/' + query.member_id + '/type/' + query.type + '/page/' + query.page + '/page_size/10';
		request
			.get(config.API_USER + 'Points/gets/'+_url)
			.end(function(err, data){
				console.log(data);
				res.send({
					pointsList:data.res.body.points_list
				});
			});
	};

	/* 我的春播券
	*
	*/
	this.getCoupons = function(req, res, next){
		var tasks = [];
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'Coupons/lists/member_id/59')
				.end(function(err, data){
					callback(err, data);
				})
		});
		async.parallel(tasks, function(err, result){
			if(err){
				logger.error('服务器异常');
				res.status(500);
				res.render('../views/error.html',{
					title:'服务器异常',
					public: config.PUBLIC
				});
			}
			res.render('../views/mychunbo/coupons.html',{
				title: '我的春播券',
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
	this.getGiftcards = function(req, res, next){
		res.render('../views/mychunbo/giftcards.html',{
			title: '我的春播卡',
			pageSize: config.PAGE_SIZE,
			public: config.PUBLIC
		});
	};
	/* 账户安全
	*
	*/
	this.getSecurity = function(req, res, next){
		res.render('../views/mychunbo/security.html',{
			title: '账户安全',
			public: config.PUBLIC
		});
	};
	/* 我的余额
	* 
	* 【API】余额列表 Balance/lists/member_id/59
	* 【API】可用余额 Balance/get/member_id/59
	*/
	this.getBalance = function(req, res, next){
		var tasks = [];
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'Balance/lists/member_id/59')
				.end(function(err, data){
					callback(err, data);
				});
		});
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'Balance/get/member_id/59')
				.end(function(err, data){
					callback(err, data);
				});
		});

		async.parallel(tasks,function(err, result){
			if(err){
				logger.error('服务器异常');
				res.status(500);
				res.render('../views/error.html',{
					title:'服务器异常',
					public: config.PUBLIC
				});
			}
			res.render('../views/mychunbo/balance.html',{
				title: '我的余额',
				balanceList: result[0].res.body.list,
				balance: result[1].res.balance,
				public: config.PUBLIC
			});
		});
	};
	/* 分享基金
	*
	*/
	this.getInvitation = function(req, res, next){
		res.render('../views/mychunbo/invitation.html',{
			title: '分享基金',
			public: config.PUBLIC
		});
	};
}

module.exports = user;
