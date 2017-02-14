#!/usr/bin/env node

/* Dependencies */
var express       = require('express'),
    path          = require('path'),
    fs            = require("fs"),
    favicon       = require('serve-favicon'),
    logger        = require('morgan'),
    cookieParser  = require('cookie-parser'),
    bodyParser    = require('body-parser'),
    mongoose      = require('mongoose'),
    debug         = require('debug')('paperlesspartners:server'),
    http          = require('http'),
    socketIO      = require('socket.io'),
    childProcess  = require('child_process'),
    phantomjs     = require('phantomjs-prebuilt');

/* JavaScript Files */
var config  = require('./public/javascripts/server/config').config;

/* Create Temporary Storage */
var tempDir = path.join(process.cwd(), 'public/downloads');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

/* MongoDB */
var mongoURI = config.getMongoURI();
mongoose.connect(mongoURI, function (err, db) {
  if (err) {
    console.log ('ERROR connecting to: ' + mongoURI + '. ' + err);
  } else {
    console.log ('Successfully connected to: ' + mongoURI);
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

/**
 * Get port from environment and store in Express.
 */
var port = process.env.PORT || 3000;
app.set('port', port);

/**
 * Listen on provided port, on all network interfaces.
 */
var server = app.listen(port, function() {
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

server.on('error', onError);
server.on('listening', onListening);

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

/* Routes */
app.get('/', function(req, res, next) {
  res.sendFile('./public/html/index.html', {root: __dirname})
});

/* Socket.io */
var io = socketIO.listen(server);

io.on('connection', (socket) => {
  console.log('Client connected to socket.');
  socket.on('disconnect', () => console.log('Client disconnected from socket.'));
});

setInterval(() => io.emit('time', new Date().toTimeString()), 1000);

/* PhantomJS Setup */
var binPath = phantomjs.path;

app.post('/compile', function(req, res) {
  var childArgs = [
      './public/javascripts/server/collect.js',
      req.body.user,
      req.body.password,
      req.body.course,
      req.body.quarter,
      req.body.assignment,
      req.body.token
  ];

  var child = childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
    console.log('Downloaded submissions for user: ' + req.body.user);
  });

  child.unref();
  child.stdout.on('data', function(data) {
    emitter = req.body.user + '-' + req.body.password[0] + '-message';
    io.emit(emitter, data.toString('utf8'));
  });

  child.on('exit', function(code) {
    var submissionsDir = './public/downloads/' + req.body.token + '/' + req.body.user + '/' + req.body.course + '/' +
        req.body.quarter + '/' + 'assignment' + req.body.assignment;
    var submissionsZip = 'assignment' + req.body.assignment + '/assignment' + req.body.assignment + '_submissions.zip';
    var zipCommand = 'cd ' + submissionsDir + '/.. && zip -r ' + submissionsZip + ' assignment' + req.body.assignment + '/';

    console.log('Running command: ' + zipCommand);

    var zipper = childProcess.exec(zipCommand, function(err, stdout, stderr) {
      emitter = req.body.user + '-' + req.body.password[0] + '-message';
      if (err) {
        io.emit(emitter, 'An error occurred. Please contact knazir@stanford.edu.');
      } else {
        io.emit(emitter, 'Finished.');
        console.log('Zipped up submissions for user: ' + req.body.user);
      }
    });
    zipper.unref();
  });

  res.sendStatus(200);
});

app.get('/download', function(req, res) {
  console.log('Location: ' + req.query.location);
  console.log('Token: ' + req.query.token);

  var file = './public/downloads/' + req.query.token + '/' + req.query.location;
  console.log('file: ' + file);

  res.download(file);
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

  var errorStatus = err.status || 500;
  res.send('An error occurred. Status: ' + errorStatus + '. Message: ' + err.message + '.');
  //res.sendFile('./public/html/error.html', {root: __dirname});
});

/* Export Express App */
module.exports = app;
