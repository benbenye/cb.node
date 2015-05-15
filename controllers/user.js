var user = new User();
var path = require('path')
var request = require('superagent');
var prefix = require('superagent-prefix')('/static');
var config = require('../config');
var async = require('async');

function User(){
	this.getPoints = function(req, res, next){

		var tasks = [];
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
			// console.log(result);

				res.render('../views/mychunbo/points.html',{
					data:result[0].res.body,
					pointsTotal:result[1].res.body.pointsTotal,
					pages:Math.ceil(result[0].res.body.count/10),
					title: '我的积分',
					public: config.PUBLIC
				});
		});
	};
	this.handlePoints = function(req, res, next){
		var params = req.params;
		var _url = 'member_id/' + params.id + '/type/' + params.type + '/page/' + params.page + '/page_size/10';
		request
			.get(config.API_USER + 'gets/'+_url)
			.end(function(err, data){
				res.send({
					pointsList:data.res.body.points_list
				});
			});
	};
}

module.exports = user;