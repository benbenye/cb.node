/**
 * Created by bby on 15/6/4.
 */
var express = require('express');
var user = require('../controllers/user');
var auth = require('../middlewares/auth');
var request = require('superagent');
var path = require('path');
var prefix = require('superagent-prefix')('/static');
var config = require('../config/config');
var router = express.Router();
var ua = require('../middlewares/useragent');
var encoding = require('encoding');
var async = require('async');
var cheerio = require('cheerio');
var http = require('http')

router.get('/download', function(req, res){
    res.render(ua.agent(req.headers['user-agent'])+'/views/app/download.html',{
        title:'App下载页面',
        public: config.PUBLIC
    })
});

router.get('/getmp3',function(req, res){
	var parser = function(res, done) {
	  res.text = '';
	  res.setEncoding('binary');
	  res.on('data', function(chunk) { res.text += chunk });
	  res.on('end', function() {
	    res.text = encoding.convert(res.text, 'UTF8', 'GBK').toString();
	    done();
	  })
	};
	var audio = {
		1: [4180, 31],
		2: [4261, 23],
		3: [6926, 19],
		4: [6927, 22],
		5: [6929, 20],
		6: [6928, 20],
		7: [6930, 21]
	};
	var hrefs = [];
	//http://www.5tps.com/down/4180_48_1_1.html
	for(var i = 1; i <= 7; ++i){
		for(var j = 1; j <= audio[i][1]; ++j){
			hrefs.push('http://www.5tps.com/down/'+audio[i][0]+'_48_1_'+j+'.html');
		}
	}
	var tasks = [];
	var count = 0;
	async.whilst(
	    function () { return count < hrefs.length-1; },
	    function (callback) {
	        tasks.push(function(cb){
	        	console.log(hrefs[count])
				request.get(hrefs[count]).parse(parser).end(function(err,data){
					$ = cheerio.load(data.res.body);
					console.log($('#play li:first a').attr('href'));
					cb();
				});
			});
	        count++;
	        callback();
	    },
	    function (err) {
			async.waterfall(tasks, function(err, result){
				console.log(result.length)
			})
	    }
	);

	
});
module.exports = router;
