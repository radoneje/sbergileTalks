var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var config = require('./config.json')
var session = require('express-session');
var  fileUpload=require('express-fileupload')

var indexRouter = require('./routes/index');
var api = require('./routes/api');

var app = express();
var knex = require('knex')({
  client: 'pg',
  version: '7.2',
  connection:config.pgConnection
});

const pgSession = require('connect-pg-simple')(session);
const pgStoreConfig = {conObject: config.pgConnection}
app.use(session({
  secret: 'dvdfvbfebvfgfeß',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1 * 24 * 60 * 60 * 1000 }, // 1 days
  store:new pgSession(pgStoreConfig),
}));
app.use(fileUpload({
  limits: { fileSize: 100 * 1024 * 1024 },
  useTempFiles : true,
  tempFileDir : path.join(__dirname, 'public/files'),
  safeFileNames: true
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use("/", (req,res, next)=>{req.knex=knex;next();});

app.use('/', indexRouter);
app.use('/rest/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
