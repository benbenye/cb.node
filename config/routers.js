
var index = require('../routes/index');
var mychunbo = require('../routes/my');
var product = require('../routes/product');
var users = require('../routes/users');
var static = require('../routes/static');

module.exports = function(app){
	app.use(index);
	app.use(users);
	app.use(mychunbo);
	app.use(product);
	app.use(static);
};