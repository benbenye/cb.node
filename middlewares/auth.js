var auth = new Auth();
var path = require('path')
var request = require('superagent');
var prefix = require('superagent-prefix')('/static');

function Auth(){
	this.checkLogin = function(req, res, next){
		console.log('ss');
		next();
	};
}

module.exports = auth;