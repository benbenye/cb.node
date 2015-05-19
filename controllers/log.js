"use strict";
	
var log4js = require('log4js'),
	mkdirp = require('mkdirp');

var LOG_NAME = 'cms';
var LOG_DIR = 'logs/';

mkdirp(LOG_DIR);//do not care callback

log4js.configure({
	appenders: [{
		type: 'file',
		filename: LOG_DIR + 'cms.log',
		maxLogSize: 1024,
		category: LOG_NAME
	}]
});

module.exports = log4js.getLogger(LOG_NAME);