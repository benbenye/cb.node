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
var iconv = require('iconv-lite');
var async = require('async');
var cheerio = require('cheerio');
var http = require('http');
var BufferHelper = require('bufferhelper');
var logger = require('../controllers/log');
var fs = require('fs');
var chalk = require('chalk');

router.get('/download', function(req, res){
    res.render(ua.agent(req.headers['user-agent'])+'/views/app/download.html',{
        title:'App下载页面',
        public: config.PUBLIC
    })
});

router.get('/getmp3',function(req, res){
	res.send('正在下载');
	var parserGBK = function(res, done) {
	  res.text = '';
	  res.setEncoding('binary');
	  res.on('data', function(chunk) { res.text += chunk });
	  res.on('end', function() {
	    res.text = encoding.convert(res.text, 'UTF8', 'GBK').toString();
	    done();
	  })
	};
		var parserUTF8 = function(res, done) {
	  res.text = '';
	  res.setEncoding('binary');
	  res.on('data', function(chunk) { res.text += chunk });
	  res.on('end', function() {
	    res.text = encoding.convert(res.text, 'GBK', 'UTF16').toString();
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
	var audio77 = {
		1: [5306, 30],
		2: [5312, 23],
		3: [5309, 19],
		4: [5308, 22],
		5: [5307, 20],
		6: [5311, 20],
		7: [5310, 21]
	}
	var hrefs = [];
	//http://www.5tps.com/down/4180_48_1_1.html
//	for(var i = 1; i <= 7; ++i){
//		for(var j = 1; j <= audio[i][1]; ++j){
//			hrefs.push('http://www.5tps.com/down/'+audio[i][0]+'_48_1_'+j+'.html');
//		}
//	}
	//http://www.77nt.com/play/5306/0.html
	for(var i = 1; i <= 7; ++i){
		for(var j = 1; j <= audio77[i][1]; ++j){
			hrefs.push('http://www.77nt.com/play/'+audio77[i][0]+'/'+(j-1)+'.html');
		}
	}
	var tasks = [];
	var count = 0;
	async.whilst(
	    function () { return count < hrefs.length-1; },
	    function (callback) {
			console.log(hrefs[count])
			request.get(hrefs[count])
			.parse(parserGBK).end(function(err, data){
				$ = cheerio.load(data.res.text);
				var url = encodeURI($('audio source').attr('src'));
				//if()如果文件已下载略过
				var stream = fs.createWriteStream(path.join(__dirname, './audio/')+count+'.mp3');

				var cic = 0, checkSize = 0;
				var req = request.get(url);
				req.pipe(stream);
				req.on('end',function(){
					count++
					callback();
				})
				req.end();
				setInterval(function(){
//				var reaStream = fs.createReadStream(path.join(__dirname, './audio/')+count+'.mp3');
				fs.existsSync(path.join(__dirname, './audio/')+count+'.mp3', function (exists) {
				  if(!exists){
				  	fs.open(path.join(__dirname, './audio/')+count+'.mp3','w+');
				  }
				});
					var reaSize = fs.statSync(path.join(__dirname, './audio/')+count+'.mp3').size;
					
					if(reaSize == checkSize){
						cic++;
						if(cic > 500){
							console.log(chalk.red('下载异常，重新尝试。'));
							callback();
						}
					}
					console.log(chalk.blue(path.join(__dirname, './audio/')+count+'.mp3')+chalk.green(',已完成：')+(reaSize/1E6).toFixed(4)+'Mb');
					
					checkSize = reaSize;
				},500);
			});
	    },
	    function (err) {
			async.waterfall(tasks, function(err, result){
				console.log(result.length)
			})
	    }
	);

	
});
module.exports = router;
