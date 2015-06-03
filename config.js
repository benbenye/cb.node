var app = require('express')();
var config = {};

if(app.get('env') !== 'development'){
	config = {
		PUBLIC      : "/",
		API_USER    : "http://user.dev.chunbo.com/",
		PAGE_SIZE   : 10,
		DB          : '127.0.0.1'
	}
}else{
	config = {
		PUBLIC      : "http://static.chunboimg.com/",
		API_USER    : "http://user.chunbo.com/",
		PAGE_SIZE   : 10,
		DB          : '127.0.0.1'
	}
}

module.exports = config;