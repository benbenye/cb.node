var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var MongoStore = require('connect-mongo')(session);
var nunjucks = require('nunjucks');

var config = require('./config/config');
var ua = require('./middlewares/funcHelper');

var app = express();

app.set('projects', path.join(__dirname, 'projects'));

require('./config/nunFilters')(app, nunjucks);
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'projects')));
app.use(session({
  secret: 'keyboard cat',
  cookie: { maxAge: 60000*60*24*365 },
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({
    db:'session',
    url:'mongodb://localhost/session'
  })
}));

require('./config/routers')(app);
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
    res.render(ua.agent(req.headers['user-agent'])+'/views/error.html', {
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
  res.render(ua.agent(req.headers['user-agent'])+'/views/error.html', {
    message: err.message,
    error: {},
    public: config.PUBLIC
  });
});


module.exports = app;
