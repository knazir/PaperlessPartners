/* Dependencies */
var express       = require('express'),
    path          = require('path'),
    favicon       = require('serve-favicon'),
    logger        = require('morgan'),
    cookieParser  = require('cookie-parser'),
    bodyParser    = require('body-parser'),
    mongoose      = require ('mongoose');

/* JavaScript Files */
var config  = require('./public/javascripts/server/config.js').config;

/* MongoDB */
var MongoURI = config.getMongoURI();
mongoose.connect(MongoURI, function (err) {
  if (err) {
    console.log ('ERROR connecting to: ' + MongoURI + '. ' + err);
  } else {
    console.log ('Successfully connected to: ' + MongoURI);
  }
});

/* Express Route and Error Handling */
var app = express();

app.use(favicon(path.join(__dirname, 'public/images', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* Routes */
app.get('/', function(req, res, next) {
  res.sendfile(config.getIndexPage(), {root: __dirname})
});

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/* Error Handler */
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(config.getErrorPage());
});

module.exports = app;
