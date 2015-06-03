var express = require('express');
var session = require('express-session');
var path = require('path');
var config = require('./config');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var connect = require('connect');
var nunjucks = require('nunjucks');

var routes = require('./routes/index');
var mychunbo = require('./routes/mychunbo');
var product = require('./routes/product');

var config = require('./config');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');
nunjucks.configure('views', {
    autoescape: true,
    express: app
});

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret: 'keyboard cat',
  cookie: { maxAge: 60000 },
  resave: true,
  saveUninitialized: true,
  store: new connect({
    url: config.DB+'/session',
    collection : 'cbsession'
  })
}))
app.use('/', routes);
// app.use('/users', users);
app.use('/mychunbo', mychunbo);
app.use('/product', product);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error.html', {
      message: err.message,
      error: err,
      public: config.PUBLIC
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error.html', {
    message: err.message,
    error: {},
    public: config.PUBLIC
  });
});


module.exports = app;
