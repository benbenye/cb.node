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

router.get('/download', function(req, res){
    res.render(ua.agent(req.headers['user-agent'])+'/views/app/download.html',{
        title:'App下载页面',
        public: config.PUBLIC
    })
});

router.get('/getmp3',function(req, res){
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
	    res.text = encoding.convert(res.text, 'GBK', 'UTF8').toString();
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
				console.log(count)

				request.get(hrefs[count]).parse(parserGBK).end(function(err,data){

					$ = cheerio.load(data.res.text);
					http.get('http://www.5tps.com'+$('#play').attr('src'),function(res){
						var bufferHelper = new BufferHelper();    //解决中文编码问题
				         res.on('data', function (chunk) {
				             bufferHelper.concat(chunk);
				         });
				         res.on("end", function () {
				             //注意，此编码必须与抓取页面的编码一致，否则会出现乱码，也可以动态去识别
				             var val = iconv.decode(bufferHelper.toBuffer(), 'gb2312'); 
				             console.log(val)
				        		count++;	   
				             callback();
				         });
					}).on("error", function () {
				        callback();
				     });
					request.get('http://www.5tps.com'+$('#play').attr('src'))
						//.set('Cookie','ASPSESSIONIDCASCDBTT=LCPJDHABBHFOFMLFLNPDMFGH; my_play_history=%7C%u660E%u671D%u90A3%u4E9B%u4E8B%u513F%u7B2C%u4E00%u5377_%u9AD8%u9E64%u2014%u2014%u7B2C1%u56DE%2C/play/4180_48_1_1.html; ASPSESSIONIDCCTAADST=IADGADNBKDMECKHNEODKNJDN; 4=true; 3=true; 1=true; vhjj=48; Hm_lvt_70f1448812c0e1f65a8b92423e7f2b42=1435660002,1435745417; Hm_lpvt_70f1448812c0e1f65a8b92423e7f2b42=1435821272; CNZZDATA362661=cnzz_eid%3D1190973278-1435658273-null%26ntime%3D1435816009')
//						.set('Accept','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
						//.set('Accept-Encoding','gzip, deflate, sdch')
//						.set('Accept-Language','zh-CN,zh;q=0.8,en;q=0.6')
						.set('Referer',hrefs[count])
//						.set('Content-Type','text/html; charset=gb2312')
//						.set('User-Agent','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.130 Safari/537.36')
						.parse(parserGBK)
						.end(function(err, re){
						if(err) console.log(err);
						$ = cheerio.load(re.res.text);
						console.log(re.res.text);
			        count++;
			        callback();
					});
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
