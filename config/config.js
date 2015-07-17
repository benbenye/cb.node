var app = require('express')();
var config = {};

if(app.get('env') !== 'development'){
	config = {
		PUBLIC      : "/",
		API_USER    : "http://user.dev.chunbo.com/",
		API_CART    : "http://cart.dev.chunbo.com/",
		API_REVIEW  : "http://review.dev.chunbo.com/",
		API_SEARCH  : "http://search.chunbo.com/",
		API_YAOJIE  : 'http://user.yaojie.com/',
		API_CATALOG : "http://catalog.dev.chunbo.com/",
		PAGE_SIZE   : 10,
		DB          : '127.0.0.1'
	}
}else{
	config = {
		PUBLIC      : "http://static.chunboimg.com/",
		API_USER    : "http://user.chunbo.com/",
		API_CART    : "http://cart.chunbo.com/",
		API_REVIEW  : "http://review.chunbo.com/",
		API_SEARCH  : "http://search.chunbo.com/",
		API_YAOJIE  : 'http://user.yaojie.com/',
		API_CATALOG : "http://catalog.chunbo.com/",
		PAGE_SIZE   : 10,
		DB          : '127.0.0.1'
	}
}

module.exports = config;