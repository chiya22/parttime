const express = require('express');
const router = express.Router();
const security = require('../util/security');

/* GET home page. */
router.get('/', security.authorize(), function (req, res, next) {
  res.render('index', {
    title: 'Express',
  });
});

//認証画面の初期表示
router.get('/login', function (req, res) {
  res.render("./login.ejs", { message: req.flash("message") });
});

//認証画面の入力
router.post('/login', security.authenticate());

//ログアウト
router.post("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

module.exports = router;
