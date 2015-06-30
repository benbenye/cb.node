var review = new Review();
var path = require('path')
var request = require('superagent');
var logger = require('./log');
var prefix = require('superagent-prefix')('/static');
var config = require('../config/config');
var async = require('async');
var ua = require('../middlewares/useragent');



function Review(){

	/*订单评价*/
	this.getReviewPidOid = function(req, res){
		var product_id = req.body.product_id,
				order_id = req.body.order_id;
		request
			.get(config.API_REVIEW+'Review/viewReview/product_id/'+product_id+'/order_id/'+order_id)
			.end(function(err, data){
				res.json(JSON.parse(data.res.text));
			})
	};
	
}

module.exports = review;