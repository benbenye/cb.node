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
var ua = require('../middlewares/funcHelper');
var encoding = require('encoding');

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
	request.get('http://www.5tps.com/html/4180.html').parse(parser).end(function(err, data){
		console.log('res',data.res.charset)
		res.send(data.res.text)
	})
})
module.exports = router;
