const express = require('express');
const router = express.Router();
const security = require('../util/security');
const yms = require('../model/yms');
const users = require('../model/users');

/* GET home page. */
router.get('/', security.authorize(), (req, res, next)=> {
  (async () => {
    const retObjYm = await yms.findThreeMonth();
    const retObjUser = await users.findPKey(req.user.id);
    res.render("index", {
      yms: retObjYm,
      user: retObjUser[0],
    });
  })();
});

//認証画面の初期表示
router.get('/login', (req, res) => {
  res.render("./login.ejs", { message: req.flash("message") });
});

//認証画面の入力
router.post('/login', security.authenticate());

//ログアウト
router.post("/logout", (req, res) => {
  req.logout(()=> {
    res.redirect("/login");
  });
});


module.exports = router;
