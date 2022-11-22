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
  res.render('userform', {
    selectuser: null,
    mode: 'insert',
  });
});

//ユーザIDを指定して更新画面（usersForm）へ
router.get('/:id', security.authorize(), (req, res, next) => {
  (async () => {
    const retObjUser = await users.findPKey(req.params.id);
    res.render('userform', {
      selectuser: retObjUser[0],
      mode: 'update',
    });
  })();
});

//パスワード変更画面へ
router.get('/updatepwd/:id', security.authorize(), (req,res, next) => {
  (async () => {
    const retObjUser = await users.findPKey(req.params.id);
    res.render('userform', {
      selectuser: retObjUser[0],
      mode: 'updatepwd',
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
  inObjUser.id_end = req.user.id;
  inObjUser.ymd_end = '99991231';
  inObjUser.id_upd = req.user.id;
  inObjUser.ymd_upd = tool.getYYYYMMDD(new Date());

  if ((!req.body.id) || (!req.body.name) || (!req.body.password)) {
    req.flash("error","ID、名前、パスワードはすべて入力してください");
    res.redirect("/users/insert");
    return;
  } else {
    (async () => {
      try {
        const retObjUsers = await users.insert(inObjUser);
        res.redirect(req.baseUrl);
      } catch (err) {
        // if (err.errno === 1062) {
        if (err.code === '23505') {
          req.flash("error","ユーザー【" + inObjUser.id + "】はすでに存在しています");
          res.redirect("/users/insert");
        } else {
          throw err;
        }
      }
    })();
  }
});

//ユーザ情報の更新（パスワードの更新もこちらの処理で行う）
router.post('/update', security.authorize(), (req, res, next) => {
  let inObjUser = {};
  inObjUser.id = req.body.id;
  inObjUser.name = req.body.name;
  inObjUser.password = req.body.password?hash(req.body.password):null;
  inObjUser.role = req.body.role;
  inObjUser.ymd_add = req.body.ymd_add;
  inObjUser.id_add = req.body.id_add;
  inObjUser.ymd_end = req.body.ymd_end;
  inObjUser.id_end = req.body.id_end;
  inObjUser.ymd_upd = tool.getYYYYMMDD(new Date());
  inObjUser.id_upd = req.user.id;

  if ((!req.body.id) || (!req.body.name)) {
    req.flash("error","名前は入力してください");
    res.redirect("/users/update");
  } else {
    (async () => {
      const retObjUser = await users.update(inObjUser);
      // if (retObjUser.changedRows === 0) {
      if (retObjUser.rowCount === 0) {
        req.flash("error","更新対象のユーザーはすでに削除されています");
        res.redirect("/users/update");
      } else {
        //パスワード変更の場合はトップ画面へ戻る
        if (req.body.mode === 'updatepwd') {
          res.redirect('/');
        } else {
          res.redirect(req.baseUrl);
        }
      }
    })();
  }
});

//ユーザ情報の削除
// router.post('/update/delete', security.authorize(), function (req, res, next) {
//   (async () => {
//     try {
//       const retObjUser = await users.remove(req.body.id);
//       res.redirect(req.baseUrl);
//     } catch (err) {
//       // if (err && err.errno === 1451) {
//       if (err && err.code === '23503') {
//           try {
//           const retObjUser_again = await ussers.findPKey(req.body.id);
//           res.render("userform", {
//             selectuser: retObjUser_again[0],
//             mode: "update",
//             message: "削除対象のユーザーは使用されています",
//           });
//         } catch (err) {
//           throw err;
//         }
//       } else {
//         throw err;
//       }
//     }
//   })();
// });

module.exports = router;
