var request = new Request();
var config = require('../config/config');

function Request(){
	this.checkAjax = function(req, res, next){
		if(!req.headers['x-requested-with']){
			res.status(404);
			res.render('error.html', {
			  message: '错误访问',
			  title:'404',
			  public: config.PUBLIC
			});
		}
		next();
	}
}
module.exports = request;