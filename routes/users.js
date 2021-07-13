const express = require('express');
const router = express.Router();

const security = require('../util/security');
const hash = require('../util/hash').digest;

const users = require('../model/users');
const tool = require('../util/tool');

// TOPページ
router.get('/', security.authorize(), (req, res, next) => {
  (async () => {
    const retObjUser = await users.find();
    res.render("./users", {
      users: retObjUser,
    });
  })();
});

// メニューから登録画面（usersForm）へ
router.get('/insert', security.authorize(), (req, res, next) => {
  res.render('usersform', {
    user: null,
    mode: 'insert',
    message: null,
  });
});

//ユーザIDを指定して更新画面（usersForm）へ
router.get('/update/:id', security.authorize(), (req, res, next) => {
  (async () => {
    const retObjUser = await users.findPKey(req.params.id);
    res.render('usersform', {
      user: retObjUser[0],
      mode: 'update',
      message: null,
    });
  })();
});

//ユーザ情報の登録
router.post('/insert', security.authorize(), (req, res, next) => {
  let inObjUser = {};
  inObjUser.id = req.body.id;
  inObjUser.name = req.body.name;
  inObjUser.password = hash(req.body.password);
  inObjUser.role = req.body.role;
  inObjUser.id_add = req.user.id;
  inObjUser.ymd_add = tool.getYYYYMMDD(new Date());
  inObjUser.id_upd = req.user.id;
  inObjUser.ymd_upd = tool.getYYYYMMDD(new Date());

  (async () => {
    try {
      const retObjUsers = await users.insert(inObjUser);
      res.redirect(req.baseUrl);
    } catch (err) {
      if (err.errno === 1062) {
        res.render("/userform", {
          user: inObjUser,
          mode: "insert",
          message: "ユーザー【" + inObjUser.id + "】はすでに存在しています",
        });
      } else {
        throw err;
      }
    }
  })();

});

//ユーザ情報の更新
router.post('/update/update', security.authorize(), (req, res, next) => {
  let inObjUser = {};
  inObjUser.id = req.body.id;
  inObjUser.name = req.body.name;
  inObjUser.password = hash(req.body.password);
  inObjUser.role = req.body.role;
  inObjUser.ymd_add = req.body.ymd_add;
  inObjUser.id_add = req.body.id_add;
  inObjUser.ymd_upd = tool.getYYYYMMDD(new Date());
  inObjUser.id_upd = req.user.id;
  (async () => {
    const retObjUser = await users.update(inObjUser);
    if (retObjUser.changedRows === 0) {
      res.render("/userform", {
        user: inObjUser,
        mode: "update",
        message: "更新対象がすでに削除されています",
      });
    } else {
      res.redirect(req.baseUrl);
    }
  })();
});

//ユーザ情報の削除
router.post('/update/delete', security.authorize(), function (req, res, next) {
  (async () => {
    try {
      const retObjUser = await users.remove(req.body.id);
      res.redirect(req.baseUrl);
    } catch (err) {
      if (err && err.errno === 1451) {
        try {
          const retObjUser_again = await ussers.findPKey(req.body.id);
          res.render("/userform", {
            user: retObjUser_again[0],
            mode: "update",
            message: "削除対象のユーザーは使用されています",
          });
        } catch (err) {
          throw err;
        }
      } else {
        throw err;
      }
    }
  })();
});

module.exports = router;
