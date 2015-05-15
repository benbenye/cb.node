var app = require('express')();
var config = {};

if(app.get('env') !== 'development'){
	config = {
		PUBLIC      : "/",
		API_USER    : "http://user.dev.chunbo.com/Points/"
	}
}else{
	config = {
		PUBLIC      : "http://static.chunboimg.com/",
		API_USER    : "http://user.chunbo.com/Points/"
	}
}

module.exports = config;