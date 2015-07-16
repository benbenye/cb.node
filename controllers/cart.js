var cart = new Cart();
var path = require('path')
var request = require('superagent');
var logger = require('./log');
var prefix = require('superagent-prefix')('/static');
var config = require('../config/config');
var async = require('async');
var funcHepler = require('../middlewares/funcHelper');

function Cart(){
	/*订单信息*/
	this.getOrderInfo = function(req, res){
		var tasks = [],
				status = req.query.status || 0,
				page = req.query.page || 1;
		tasks.push(function(callback){
			request
				.get(config.API_CART + 'Order/OrderCount/member_id/'+ req.user.member_id)
				.end(function(err, data){
					if(err || !data.ok){
						return callback(err || 'data.ok', '获取订单数量失败');
					}
					callback(err, data);
				});
		});
		tasks.push(function(callback){
			request
				.get(config.API_CART + 'order/lists/member_id/'+req.user.member_id+'/status/'+status+'/page/'+page+'/page_size/'+config.PAGE_SIZE)
				.end(function(err, data){
					if(err || !data.ok){
						return callback(err || 'data.ok', '获取订单列表失败');
					}
					if(JSON.parse(data.res.text).flag == 1){
						callback(err, JSON.parse(data.res.text));
					}else{
						callback(err, {list:[],count:0})
					}
				});
		});

		async.parallel(tasks,function(err, result){
			if(err){
				logger.error('cart.js: line-41,erro:服务器异常');
				logger.error(err);
				res.status(500);
				res.render(funcHepler.agent(req.headers['user-agent'])+'/views/error.html',{
					title:'服务器异常',
					public: config.PUBLIC,
					ua:funcHepler.agent(req.headers['user-agent'])
				});
				return;
			}
			res.render(funcHepler.agent(req.headers['user-agent'])+'/views/my/orderInfo.html',{
				title:'我的订单',
				public:config.PUBLIC,
				ua : funcHepler.agent(req.headers['user-agent']),
				userInfo:req.user,
				orderCount: JSON.parse(result[0].res.text).list,
				orderList: result[1].list,
				pages: result[1].count ? Math.ceil(result[1].count/10) : 0,
				page:page,
				status: status
			});
		});
	};
	/* 已购买商品
	* @param  order：1【销量降序】，2【销量升序】，3【价格降序】，4【价格升序】，
									5【上架时间降序】，6【上架时间升序】，7【评论降序】，8【评论升序】 
	* @param  product_ids：【商品编号，多个商品用半角逗号分割】
	*/
	this.getPurchased = function (req, res) {
		var tasks = [],
				order = req.query.order || 1,
				page = req.query.page || 1,
				page_size = 8,
				is_stock = req.query.is_stock || 0;
		tasks.push(function (callback){
			request
				.get(config.API_CART + 'Order/getMemberProductList/member_id/' + req.user.member_id + '/page_size/8/order/'+order+'/page/'+page)
				.end(function(err, data){
					if(err || !data.ok){
						return callback(err || 'data.ok', '获取获取已购商品列表总数失败');
					}
					callback(err, JSON.parse(data.res.text).count);
				});
		});
		tasks.push(function (count, callback) {
			request
				.get(config.API_CART + 'Order/getMemberProductList/member_id/' + req.user.member_id + '/page_size/'+count)
				.end(function (err, data) {
					if(err || !data.ok){
						return callback(err || 'data.ok', '获取已购商品列表失败');
					}
					var _arr = JSON.parse(data.res.text).list ? Object.keys(JSON.parse(data.res.text).list) : [],
							_temp = [];
					_arr.forEach(function(ele){
						_temp.push(JSON.parse(data.res.text).list[ele].product_id);
					});
					callback(err, _temp.join(','));
				});
		});
		tasks.push(function (ids, callback) {
			request
				.get(config.API_SEARCH + 'list_solr.php?product_ids='+ids+'&order='+order+'&page_size='+page_size+'&page='+page+'&is_stock='+is_stock)
				.end(function(err, data){
					if(err || !data.ok){
						return callback(err || 'data.ok', '获取排序好的已购商品列表失败');
					}
					callback(err, data);
				})
		})
		async.waterfall(tasks, function (err, result) {
			if(err){
				logger.error('已购商品-服务异常');
				logger.error(err);
				res.render(funcHepler.agent(req.headers['user-agent']) + '/views/error.html',{
					title:'服务异常',
					public: config.PUBLIC,
					ua: funcHepler(req.headers['user-agent'])
				});
				return;
			}
			res.render(funcHepler.agent(req.headers['user-agent'])+'/views/my/purchased.html',{
				title:'已购商品',
				public: config.PUBLIC,
				userInfo: req.user,
				order:order,
				data: JSON.parse(result.res.text).product_list,
				page:page,
				pages: JSON.parse(result.res.text).total ? Math.ceil(JSON.parse(result.res.text).total/8):0,
				ua:funcHepler.agent(req.headers['user-agent']),
				is_stock:is_stock
			});
		});
	};

	/*订单详情*/
	this.getOrderDetail = function(req, res){
		var orderId = req.params.orderId,
				member_id = req.user.member_id,
				tasks = [];
		tasks.push(function(callback){
			request
				.get(config.API_CART + 'order/info/member_id/'+member_id+'/order_id/'+orderId)
				.end(function(err, data){
					if(err || !data.ok){
						return callback(err || 'data.ok', '获取订单详情失败');
					}
					callback(err, JSON.parse(data.res.text));
				});
		});
		tasks.push(function(callback){
			request
				.get(config.API_CART + 'Order/getLogitics/order_id/'+orderId)
				.end(function(err, data){
					if(err || !data.ok){
						return callback(err || 'data.ok', '获取物流信息失败');
					}
					if(JSON.parse(data.res.text).flag == 1){
						callback(err, JSON.parse(data.res.text));
					}else{
						callback(err, null);
					}
				});
		});
		async.parallel(tasks, function(err, result){
			if(err){
				logger.error('订单详情-服务异常');
				logger.error(err);
				res.render(funcHepler.agent(req.headers['user-agent']) + '/views/error.html',{
					title:'服务异常',
					public: config.PUBLIC,
					ua: funcHepler(req.headers['user-agent'])
				});
				return;
			}
			res.render(funcHepler.agent(req.headers['user-agent'])+'/views/my/orderDetail.html',{
				title:'订单详情',
				public: config.PUBLIC,
				ua:funcHepler.agent(req.headers['user-agent']),
				userInfo: req.user,
				data:result[0].info,
				logitics: result[1]
			});
		});	
	};

	/*取消订单*/
	this.delOrder = function(req, res){
		var order_id = req.params.order_id,
				source = 'web',
				system = 'web system',
				nickname = req.user.nickname,
				cause = '取消订单',
				member_id = req.user.member_id,
				url = '/source/'+source+'/system/'+system+'/nickname/'+nickname+'/cause/'+cause+'/member_id/'+member_id;
				url = encodeURIComponent(url);
		request
			.get(config.API_CART + 'order/delorder/order_id/'+order_id+url)
			.end(function(err, data){
				if (err || !data.ok) {
					logger.error(err || 'data.ok');
					return res.json({status:0,info:'取消订单失败'});
				}
				data = JSON.parse(data.res.text);
				if(data.flag == 2 && data.erron == 1001){
					res.json({
						status:0,
						info:'重复取消订单'
					});
				}else if(data.flag == 2){
					res.json({
						status:0,
						info:'取消订单失败'
					});
				}else{
					res.json({
						status:1,
						info:'正在取消订单，请等待'
					});
				}
			});
	};

	/*获取订单物流信息*/
	this.getLogitics = function (req, res) {
		var order_id = req.params.order_id;
		request
			.get(config.API_YAOJIE + 'member/getLogitics/order_id/'+order_id)
			.end(function (err, data) {
				if (err || !data.ok) {
					logger.error('获取订单物流信息-服务异常');
					logger.error(err || 'data.ok');
					return res.json({status:0, info:'获取物流信息失败'});
				}
				var resData = JSON.parse(data.res.text);
				if(data.ok && resData.errcode == 0){
					res.json({
						status:1,
						info:resData.data
					});
				}else{
					res.json({
						status:0,
						info:'获取物流信息失败'
					});
				}
			});
	};
	
	/*追踪监测情况*/
	this.getInspection = function (req, res) {
		var skuId = req.params.skuId,
			skuLot = req.params.skuLot;
		request
			.get(config.API_YAOJIE +'member/getInspection/skuId/'+skuId+'/skuLot/'+skuLot)
			.end(function (err, data) {
				if (err || !data.ok) {
					logger.error('追踪检测情况-服务异常');
					logger.error(err || 'data.ok');
					return res.send('获取检测情况失败');
				}
				var resData = JSON.parse(data.res.text);
				if(data.ok && resData.errcode == 0){
					res.send(resData.data);
				}
			});
	};
}

module.exports = cart;