var user = new User();
var path = require('path')
var request = require('superagent');
var prefix = require('superagent-prefix')('/static');
var config = require('../config');
var async = require('async');

function User(){
	/* 我的积分，获取积分明细和积分个数
	* 【API格式】获取积分列表  gets/member_id/59
	* 【API格式】获取积分个数  getPointsTotal/member_id/59
	*/
	this.getPoints = function(req, res, next){
		var tasks = [];
		var asd = req.query.split('/');
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'gets/member_id/59')
				.end(function(err, data){
					callback(err, data);
				});
		});
		tasks.push(function(callback){
			request
				.get(config.API_USER + 'getPointsTotal/member_id/59')
				.end(function(err, data){
					callback(err, data);
				});
		});

		async.parallel(tasks,function(err, result){
			res.render('../views/mychunbo/points.html',{
				data:result[0].res.body,
				pointsTotal:result[1].res.body.pointsTotal,
				pages:Math.ceil(result[0].res.body.count/10),
				title: '我的积分',
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
	* 【API格式】获取分页积分列表  /gets/member_id/59/type/3/page/1/page_size/10
	*/
	this.pagePoints = function(req, res, next){
		var query = req.query;
		var _url = 'member_id/' + query.member_id + '/type/' + query.type + '/page/' + query.page + '/page_size/10';
		request
			.get(config.API_USER + 'gets/'+_url)
			.end(function(err, data){
				res.send({
					pointsList:data.res.body.points_list
				});
			});
	};

	this.getCoupons = function(req, res, next){

	};
}

module.exports = user;
