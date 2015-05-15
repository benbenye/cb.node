var express = require('express');
var user = require('../controllers/user');
var request = require('superagent');
var path = require('path');
var prefix = require('superagent-prefix')('/static');
var router = express.Router();

router.get('/product', function(){});


module.exports = router;
