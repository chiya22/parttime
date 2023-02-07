const express = require('express');
const router = express.Router();

const security = require('../util/security');

const yms = require('../model/yms');
const yyyymmdds = require('../model/yyyymmdds');
const yyyymmdds_fix = require('../model/yyyymmdds_fix');
const users = require('../model/users');
const memos = require('../model/memos');

const tool = require('../util/tool');

const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() }).single('file');

// TOPページ
router.get('/', security.authorize(), (req, res, next) => {
  (async () => {
    const retObjYm = await yms.find();
    res.render("./yms", {
      yms: retObjYm,
    });
  })();
});

// 年月情報の新規登録画面（ymForm）へ
router.get('/insert', security.authorize(), (req, res, next) => {
  res.render('ymform', {
    ym: null,
    mode: 'insert',
  });
});

//年月情報の更新画面（ymForm）へ
router.get('/:ym', security.authorize(), (req, res, next) => {
  (async () => {
    const retObjYm = await yms.findPKey(req.params.ym);
    res.render('ymform', {
      ym: retObjYm[0],
      mode: 'update',
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
    req.flash("error","年月は必ず入力してください");
    res.redirect("/yms/insert");
  } else {
    (async () => {
      try {
        const retObjYm = await yms.insert(inObjYm);
        res.redirect(req.baseUrl);
      } catch (err) {
        // if (err.errno === 1062) {
        if (err.code === '23505') {
          req.flash("error","年月【" + inObjYm.yyyymm + "】はすでに存在しています");
          res.redirect("/yms/insert");
        } else {
          throw err;
        }
      }
    })();
  }
});

//年月情報の更新
router.post('/update', security.authorize(), (req, res, next) => {
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
      req.flash("error","更新対象がすでに削除されています");
      res.redirect("/yms/update");
    } else {
      res.redirect(req.baseUrl);
    }
  })();
});

//年月情報の削除
router.post('/delete', security.authorize(), function (req, res, next) {
  (async () => {
    try {
      const retObjYm = await yms.remove(req.body.yyyymm);
      res.redirect(req.baseUrl);
    } catch (err) {
      // if (err && err.errno === 1451) {
      if (err && err.code === '23503') {
        try {
          req.flash("error","削除対象の年月は使用されています");
          res.redirect("/yms/update/delete");
        } catch (err) {
          throw err;
        }
      } else {
        throw err;
      }
    }
  })();
});

//対象年月の希望情報のユーザー提示状況一覧を確認する
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

//対象年月の対象ユーザーの希望情報を確認する
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

//対象年月の希望情報をダウンロード
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

//対象年月の確定情報アップロード画面へ遷移する
router.get("/fixupload/:ym", security.authorize(), (req,res) => {
  res.render("upload", {
    targetYyyymm: req.params.ym
  })
});

//対象年月の確定情報をアップロード
router.post('/fixupload', security.authorize(), upload, (req, res) => {
  (async () => {

    if (!req.file) {
      req.flash("error","ファイルを選択してください")
      res.redirect("/fixupload/" + req.body.targetYyyymm)
    } else {
      // const filename = req.file.originalname;
      const lines = req.file.buffer.toString().split('\r\n');

      // 対象年月とアップロードされた確定情報の年月が不一致の場合
      if (lines[0].slice(0,6) !== req.body.targetYyyymm) {
        res.render("upload", {
          msg: `アップロードしたファイルの年月が誤っています。${lines[0].slice(0,6)}`,
          targetYyyymm: req.body.targetYyyymm
        })
        return;
      }

      //既存データを削除
      await yyyymmdds_fix.removeByYyyymm(lines[0].slice(0,6));

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
          inObj.ymd_upd = tool.getYYYYMMDD(new Date());
          inObj.id_upd = req.user.id;
          await yyyymmdds_fix.insert(inObj);
        }
      }

      req.flash("success",req.file.originalname + 'ファイルのアップロードが完了しました');
      res.redirect("/yms/fixupload/" + req.body.targetYyyymm);
    }

  })();
});

//対象年月の確定情報表示画面へ
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

        let isHayaBosyu = false;
        let isOsoBosyu = false;

        // 早
        if ((item.role_users_haya_1 === 'admin') && (inObj.id_users_haya_2 === '')) {
          isHayaBosyu = true;
        }

        // 遅
        if ((item.role_users_oso_1 === 'admin') && (inObj.id_users_oso_2 === '')) {
          isOsoBosyu = true;
        }

        // ステータス
        if ((isHayaBosyu) && (isOsoBosyu)) {
          inObj.status = '募集中(早遅)'
        } else if ((isHayaBosyu) && (!isOsoBosyu)) {
          inObj.status = '募集中(早)'
        } else if ((!isHayaBosyu) && (isOsoBosyu)) {
          inObj.status = '募集中(遅)'
        } else {
          inObj.status = '確定'
        }
        
        if (!item.id_users_haya_1) {
          inObj.id_users_haya_1 = '募集中'
          inObj.nm_users_haya_1 = '募集中'
        }
        if (!item.id_users_oso_1) {
          inObj.id_users_oso_1 = '募集中'
          inObj.nm_users_oso_1 = '募集中'
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
      target_id_users: req.user.id,
      mode: 'admin',
    });
  })();
});

//対象年月の確定情報をダウンロード
router.get('/fixdownload/:ym', security.authorize(), (req, res, next) => {

  let csv = '';

  (async () => {
    const retObjYyyymmdds_fix = await yyyymmdds_fix.findByYyyymmForDownload(req.params.ym);
    retObjYyyymmdds_fix.forEach( (row) => {
      csv += row.yyyymmdd + ',' + row.yyyymm + ',' + (row.id_users_haya_1?row.id_users_haya_1:'') + ',' + (row.id_users_haya_2?row.id_users_haya_2:'') + ',' + (row.id_users_oso_1?row.id_users_oso_1:'') + ',' + (row.id_users_oso_2?row.id_users_oso_2:'') + '\r\n'
    });

    // const retObjMemos = await memos.findByYyyymmForDownload(req.params.ym);
    // retObjMemos.forEach( (row) => {
    //   csv += row.id_users + ',' + row.name_users + ',MEMO,' + row.memo + '\r\n'
    // })

    res.setHeader('Content-disposition', 'attachment; filename=data_fix.csv');
    res.setHeader('Content-Type', 'text/csv; charset=UTF-8');
  
    res.send(csv);
  })();
});


module.exports = router;
