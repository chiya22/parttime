const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const security = require('./util/security');
const connectFlash = require("connect-flash");

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const ymsRouter = require('./routes/yms');
const yyyymmddsRouter = require('./routes/yyyymmdds');
const yyyymmddsFixRouter = require('./routes/yyyymmdds_fix');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//セッションの有効化
const session = require('express-session');
app.use(session({
  secret: "auth-secret",
  resave: false,
  saveUninitialized: true,
  name: "sid",
  cookie: {
    maxAge: 3 * 24 * 60 * 1000,
    secure: false
  }
}));

//connect-flashをミドルウェアとして設定
app.use(connectFlash());
//フラッシュメッセージをresのローカル変数のflashMessagesに代入
app.use((req, res, next) => {
  res.locals.flashMessages = req.flash();
  next();
});

//認証の初期化
app.use(...security.initialize());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/yms', ymsRouter);
app.use('/yyyymmdds', yyyymmddsRouter);
app.use('/yyyymmdds_fix', yyyymmddsFixRouter);

const cron = require('./util/cron');
cron.startcron();

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
