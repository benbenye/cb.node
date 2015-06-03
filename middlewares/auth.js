var auth = new Auth();
var path = require('path');
var config = require('../config');
var request = require('superagent');
var prefix = require('superagent-prefix')('/static');

function Auth(){
	this.checkLogin = function(req, res, next){
		request
		  .post('http://chunbo.com/Login/getstatus')
		  .end(function(err, res){
		    if(res.text == 1){
					// 发送isLogined的请求
					// 注册登录？
					req.flag = true;
		    }else{
		    	req.flag = false;
		    }
					next();
		  });

	};
}

module.exports = auth;