const express = require('express');
const router = express.Router();

const security = require('../util/security');

const yms = require('../model/yms');
const tool = require('../util/tool');
const yyyymmdds = require('../model/yyyymmdds');
const yyyymmdds_fix = require('../model/yyyymmdds_fix');
const users = require('../model/users');
const memos = require('../model/memos');

// TOPページ
router.get('/', security.authorize(), (req, res, next) => {
  (async () => {
    const retObjYm = await yms.find();
    res.render("./yms", {
      yms: retObjYm,
    });
  })();
});

// メニューから登録画面（ymForm）へ
router.get('/insert', security.authorize(), (req, res, next) => {
  res.render('ymform', {
    ym: null,
    mode: 'insert',
    message: null,
  });
});

//年月を指定して更新画面（ymForm）へ
router.get('/update/:ym', security.authorize(), (req, res, next) => {
  (async () => {
    const retObjYm = await yms.findPKey(req.params.ym);
    res.render('ymform', {
      ym: retObjYm[0],
      mode: 'update',
      message: null,
    });
  })();
});

//年月情報の登録
router.post('/insert', security.authorize(), (req, res, next) => {
  let inObjYm = {};
  inObjYm.yyyymm = req.body.yyyymm;
  inObjYm.status = req.body.status;
  inObjYm.id_add = req.user.id;
  inObjYm.ymd_add = tool.getYYYYMMDD(new Date());
  inObjYm.id_upd = req.user.id;
  inObjYm.ymd_upd = tool.getYYYYMMDD(new Date());

  if (!req.body.yyyymm) {
    res.render("ymform", {
      ym: inObjYm,
      mode: "insert",
      message: "年月は入力してください",
    });
    return;
  }

  (async () => {
    try {
      const retObjYm = await yms.insert(inObjYm);
      res.redirect(req.baseUrl);
    } catch (err) {
      // if (err.errno === 1062) {
      if (err.code === '23505') {
          res.render("ymform", {
          ym: inObjYm,
          mode: "insert",
          message: "年月【" + inObjYm.yyyymm + "】はすでに存在しています",
        });
      } else {
        throw err;
      }
    }
  })();

});

//年月情報の更新
router.post('/update/update', security.authorize(), (req, res, next) => {
  let inObjYm = {};
  inObjYm.yyyymm = req.body.yyyymm;
  inObjYm.status = req.body.status;
  inObjYm.ymd_add = req.body.ymd_add;
  inObjYm.id_add = req.body.id_add;
  inObjYm.ymd_upd = tool.getYYYYMMDD(new Date());
  inObjYm.id_upd = req.user.id;

  (async () => {
    const retObjYm = await yms.update(inObjYm);
    // if (retObjYm.changedRows === 0) {
    if (retObjYm.rowCount === 0) {
        res.render("ymform", {
        ym: inObjYm,
        mode: "update",
        message: "更新対象がすでに削除されています",
      });
    } else {
      res.redirect(req.baseUrl);
    }
  })();
});

//年月情報の削除
router.post('/update/delete', security.authorize(), function (req, res, next) {
  (async () => {
    try {
      const retObjYm = await yms.remove(req.body.yyyymm);
      res.redirect(req.baseUrl);
    } catch (err) {
        // if (err && err.errno === 1451) {
        if (err && err.code === '23503') {
            try {
          const retObjYm_again = await yms.findPKey(req.body.yyyymm);
          res.render("ymform", {
            ym: retObjYm_again[0],
            mode: "update",
            message: "削除対象の年月は使用されています",
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

//対象年月のシフト情報をダウンロード
router.get('/download/:ym', security.authorize(), (req, res, next) => {

  let csv = '';

  (async () => {
    const retObjYyyymmdds = await yyyymmdds.findByYyyymmForDownload(req.params.ym);
    retObjYyyymmdds.forEach( (row) => {
      csv += row.id_users + ',' + row.name_users + ',' + row.yyyymmdd + ',' + row.kubun + '\r\n'
    });

    // const retObjMemos = await memos.findByYyyymmForDownload(req.params.ym);
    // retObjMemos.forEach( (row) => {
    //   csv += row.id_users + ',' + row.name_users + ',MEMO,' + row.memo + '\r\n'
    // })

    res.setHeader('Content-disposition', 'attachment; filename=data.csv');
    res.setHeader('Content-Type', 'text/csv; charset=UTF-8');
  
    res.send(csv);
  })();
});

router.get('/users/:ym', security.authorize(), (req, res, next) => {
  (async () => {
    const retObjYmUser = await yyyymmdds.findByYyyymmGroupByUser(req.params.ym);
    const retObjYmNoUser = await yyyymmdds.findByYyyymmGroupByNoUser(req.params.ym);
    res.render("ymusers", {
      yms: req.params.ym,
      users: retObjYmUser,
      nousers: retObjYmNoUser,
    });
  })();
});

router.get('/users/:ym/:id_users', security.authorize(), (req, res, next) => {
  (async () => {
    const retObjYyyymmdd = await yyyymmdds.findByYyyymmAndUserid(req.params.ym, req.params.id_users);
    let retObjList = [];
    retObjYyyymmdd.forEach((item,idx) => {
      let inObj = {};
      inObj = item;
      inObj.daykubun = tool.getDayKubun(item.yyyymmdd);
      inObj.isHoliday = tool.getHoliday(item.yyyymmdd);
      retObjList.push(inObj);
    });
    
    // メモ
    const retObjMemo = await memos.findPKey(req.params.ym, req.params.id_users);
    const memo = retObjMemo.length !== 0? retObjMemo[0].memo: null;

    // ユーザー名を取得
    const retObjUser = await users.findPKey(req.params.id_users);

    res.render("./yyyymmdds", {
      yyyymmdds: retObjList,
      memo: memo,
      target_yyyymm: req.params.ym,
      target_name_users: retObjUser[0].name,
      target_id_users: req.params.id_users,
      mode: 'admin',
    });

  })();
});

// 確定情報一覧表示画面へ
router.get('/fix/:yyyymm', security.authorize(), (req, res, next) => {
  (async () => {

    // 確定情報より現在のユーザーが設定されているレコードを取得
    const retObjYyyymmdd = await yyyymmdds_fix.findByYyyymm(req.params.yyyymm);

    let retObjList = [];
    if (retObjYyyymmdd.length !== 0) {
      //　存在する場合
      retObjYyyymmdd.forEach((item,idx) => {
        let inObj = {};
        inObj = item;
        if ((item.id_users_haya_1) && (item.id_users_oso_1)) {
          inObj.status = '確定';
        } else if (item.id_users_haya_1) {
          inObj.status = '募集中(遅)';
        } else if (item.id_users_oso_1) {
          inObj.status = '募集中(早)';
        } else {
          inObj.status = '募集中(早遅)';
        }
        inObj.daykubun = tool.getDayKubun(item.yyyymmdd);
        inObj.isHoliday = tool.getHoliday(item.yyyymmdd);
        retObjList.push(inObj);
      });
    }

    // // ユーザー情報を取得
    // const retObjUser = await users.findPKey(req.user.id);

    res.render("./yyyymmdds_fix", {
      yyyymmdds: retObjList,
      target_yyyymm: req.params.yyyymm,
      // target_name_users: retObjUser[0].name,
      // target_id_users: req.user.id,
      mode: 'admin',
    });
  })();
});


module.exports = router;
