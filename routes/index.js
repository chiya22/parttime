const express = require('express');
const router = express.Router();
const security = require('../util/security');
const yms = require('../model/yms');
const users = require('../model/users');
const fs = require("fs");
const tool = require("../util/tool")
const yyyymmdd_fix = require("../model/yyyymmdds_fix");

const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() }).single('file');

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
  req.logout();
  res.redirect("/login");
});

//確定情報アップロード
router.get("/upload", security.authorize(), (req,res) => {
  res.render("upload", {
    msg: null,
  })
});

//
router.post("/upload", security.authorize(), upload, (req,res) => {
    (async () => {

      if (!req.file) {
        res.render("upload", {
          msg: 'ファイルを選択してください。',
        })
        return;
      }
      const filename = req.file.originalname;
      const lines = req.file.buffer.toString().split('\r\n');

    //既存データを削除
    await yyyymmdd_fix.removeByYyyymm(lines[0].slice(0,6));

    const aaa = lines.length;
    //ファイルを読込データを登録
    for (let i=0; i<lines.length; i++) {
  
      if (lines[i]) {
        let items = lines[i].split(",");
        let inObj = {};
        inObj.yyyymmdd = items[0];
        inObj.yyyymm = items[1];
        inObj.id_users_haya_1 = items[2];
        inObj.id_users_haya_2 = items[3];
        inObj.id_users_oso_1 = items[4];
        inObj.id_users_oso_2 = items[5];
        inObj.ymd_add = tool.getYYYYMMDD(new Date());
        inObj.id_add = req.user.id;
        await yyyymmdd_fix.insert(inObj);
      }
    }
    res.render("upload", {
      msg: req.file.originalname + 'ファイルのアップロードが完了しました',
    })
  })();
})

module.exports = router;
