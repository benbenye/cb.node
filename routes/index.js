var express = require('express');
var user = require('../controllers/user');
var request = require('superagent');
var path = require('path');
var prefix = require('superagent-prefix')('/static');
var config = require('../config');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.html', {
  	title: 'Express',
  	public: config.PUBLIC
  });
});

module.exports = router;
