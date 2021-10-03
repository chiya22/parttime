const express = require('express');
const router = express.Router();

const security = require('../util/security');

const yyyymmdds = require('../model/yyyymmdds');
const users = require('../model/users');
const tool = require('../util/tool');

const memos = require('../model/memos');

const log4js = require("log4js");
const logger = log4js.configure("./config/log4js-config.json").getLogger();

// TOPページ
router.get('/:yyyymm', security.authorize(), (req, res, next) => {
  (async () => {
    const retObjYyyymmdd = await yyyymmdds.findByYyyymmAndUserid(req.params.yyyymm, req.user.id);

    let retObjList = [];
    let retObjMemo = null;
    if (retObjYyyymmdd.length === 0) {
      //　存在しない場合
      // 対象年月の年月日リストを取得
      const yyyymmdddata = tool.getYyyymmddByYyyymm(req.params.yyyymm);
      // 対象年月の年月日オブジェクトリストを作成
      yyyymmdddata.forEach((item, idx) => {
        let inObj = {};
        inObj.id_users = req.user.id;
        inObj.yyyymm = req.params.yyyymm;
        inObj.yyyymmdd = item;
        inObj.kubun = '4';
        inObj.ymd_add = tool.getYYYYMMDD(new Date());
        inObj.id_add = req.user.id;
        inObj.ymd_upd = tool.getYYYYMMDD(new Date());
        inObj.id_upd = req.user.id;
        inObj.daykubun = tool.getDayKubun(item);
        inObj.isHoliday = tool.getHoliday(item);
        retObjList.push(inObj);
      })
    } else {
      //　存在する場合
      retObjYyyymmdd.forEach((item,idx) => {
        let inObj = {};
        inObj = item;
        inObj.daykubun = tool.getDayKubun(item.yyyymmdd);
        inObj.isHoliday = tool.getHoliday(item.yyyymmdd);
        retObjList.push(inObj);
      });
      retObjMemo = await memos.findPKey(req.params.yyyymm, req.user.id);
    }

    // メモ
    const memo = retObjMemo? retObjMemo[0].memo: null;

    // ユーザー名を取得
    const retObjUser = await users.findPKey(req.user.id);

    res.render("./yyyymmdds", {
      yyyymmdds: retObjList,
      memo: memo,
      target_yyyymm: req.params.yyyymm,
      target_name_users: retObjUser[0].name,
      target_id_users: req.user.id,
      mode: 'normal',
    });
  })();
});

// 更新
router.post('/update', security.authorize(), (req, res, next) => {

  (async () => {

    // 対象年月が募集締切になっていないか確認する　★ToDo

    // 対象年月の日付リストを取得する
    const yyyymmdddata = tool.getYyyymmddByYyyymm(req.body.yyyymm[0]);

    // 区分を配列に格納しなおす
    let kubun = [];
    yyyymmdddata.forEach((yyyymmdd) => {
      kubun.push(req.body['kubun_' + yyyymmdd]);
    })

    // 既存情報を削除
    const retObjYyyymmdd = await yyyymmdds.removeByYyyymmAndUserid(req.body.yyyymm[0], req.body.target_id_users[0]);
    const retObjMemo = await memos.remove(req.body.yyyymm[0], req.body.target_id_users[0])

    // 新規情報を登録
    req.body.yyyymmdd.map((item, idx) => {
      let inObjYyyymmdd = {};
      inObjYyyymmdd.id_users = req.body.id_users[idx];
      inObjYyyymmdd.yyyymm = req.body.yyyymm[idx];
      inObjYyyymmdd.yyyymmdd = req.body.yyyymmdd[idx];
      inObjYyyymmdd.kubun = kubun[idx];
      inObjYyyymmdd.ymd_add = tool.getYYYYMMDD(new Date());
      inObjYyyymmdd.id_add = req.user.id;
      inObjYyyymmdd.ymd_upd = tool.getYYYYMMDD(new Date());
      inObjYyyymmdd.id_upd = req.user.id;
      inObjYyyymmdd.daykubun = tool.getDayKubun(req.body.yyyymmdd[idx]);
      inObjYyyymmdd.isHoliday = tool.getHoliday(req.body.yyyymmdd[idx]);
      (async () => {
        await yyyymmdds.insert(inObjYyyymmdd);
      })();
    });

    let inObjMemo = {};
    inObjMemo.yyyymm = req.body.yyyymm[0];
    inObjMemo.id_users = req.body.target_id_users[0];
    inObjMemo.memo = req.body.memo;
    inObjMemo.ymd_add = tool.getYYYYMMDD(new Date());
    inObjMemo.id_add = req.user.id;
    inObjMemo.ymd_upd = tool.getYYYYMMDD(new Date());
    inObjMemo.id_upd = req.user.id;
    await memos.insert(inObjMemo);

    if (req.body.mode === 'admin') {
      res.redirect('/yms/users/' + req.body.yyyymm[0]);
    } else {
      res.redirect('/');
    }

  })();

});

module.exports = router;
