var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var MongoStore = require('connect-mongo')(session);
var nunjucks = require('nunjucks');

var routes = require('./routes/index');
var mychunbo = require('./routes/my');
var product = require('./routes/product');
var users = require('./routes/users');
var static = require('./routes/static');

var config = require('./config');
var ua = require('./middlewares/useragent');

var app = express();

// view engine setup
app.set('projects', path.join(__dirname, 'projects'));

// env.getFilter('imgUrl');
var env = nunjucks.configure('projects', {
    autoescape: true,
    express: app
});
// var env = new nunjucks.Environment();
env.addFilter('subDoubleByte', function(str, len) {
  if(len === +len && len > 0 && len < str.length){
    var reg = /[^\x00-\xff]/,
        sub = i = 0,
        arr = str.split('');
    len *= 2;
    for(var l = str.length; sub < len && i < l; ++i){
      reg.test(str[i]) ? sub+=2 : ++sub;
    }
    return str.substr(0, i-1)+'…';
  }
  return str;
});
env.addFilter('splitBirthday', function(str, tag, i) {
  if(str.length < 18){str += ' 00:00:00';}
  str = str.substr(0, str.length - 9);
  if(!tag){
    return str;
  }
  var arr = str.split(tag);
  if(i in [0,1,2]){
    return arr[i]
  }
  str = arr[0]+'年'+arr[1]+'月'+arr[2]+'日';
  return str;
});
// uncomment after placing your favicon in /public
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
app.use(routes);
app.use(users);
app.use(mychunbo);
app.use(product);
app.use(static);
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
