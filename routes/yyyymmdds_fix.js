const express = require('express');
const router = express.Router();

const security = require('../util/security');

const yyyymmdds_fix = require('../model/yyyymmdds_fix');
const users = require('../model/users');
const tool = require('../util/tool');

const log4js = require("log4js");
const logger = log4js.configure("./config/log4js-config.json").getLogger();

// TOPページ
router.get('/:yyyymm', security.authorize(), (req, res, next) => {
  (async () => {

    // 確定情報より現在のユーザーが設定されているレコードを取得
    const retObjYyyymmdd = await yyyymmdds_fix.findByYyyymm(req.params.yyyymm, req.user.id);

    let retObjList = [];
    if (retObjYyyymmdd.length !== 0) {

      //　存在する場合
      retObjYyyymmdd.forEach((item,idx) => {
        let inObj = {};
        inObj = item;

        let isHayaBosyu = false;
        let isOsoBosyu = false;

        // 早
        if ((item.role_users_haya_1 === 'admin') && (!inObj.id_users_haya_2)) {
          isHayaBosyu = true;
        }

        // 遅
        if ((item.role_users_oso_1 === 'admin') && (!inObj.id_users_oso_2)) {
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
        
        // 募集中を設定する
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

        if ((inObj.status === '募集中(早遅)') || (inObj.status === '募集中(早)') || (inObj.status === '募集中(遅)')) {
          // 募集中の場合
          retObjList.push(inObj);
        } else {
          // 確定の場合
          // 現在のユーザーが設定されている日付である場合のみ
          if ((item.id_users_haya_1 === req.user.id) || (item.id_users_haya_2 === req.user.id) || (item.id_users_oso_1 === req.user.id) || (item.id_users_oso_2 === req.user.id)) {
            retObjList.push(inObj);
          }
        }
      });
    }

    // ユーザー情報を取得
    const retObjUser = await users.findPKey(req.user.id);

    res.render("./yyyymmdds_fix", {
      yyyymmdds: retObjList,
      target_yyyymm: req.params.yyyymm,
      target_name_users: retObjUser[0].name,
      target_id_users: req.user.id,
      mode: 'normal',
    });
  })();
});

// 指定された年月日の確定情報を取得
router.get('/update/:yyyymmdd', security.authorize(), (req, res, next) => {
  (async () => {

    const yyyymmdd = req.params.yyyymmdd;
    
    const retObjYyyymmdd = await yyyymmdds_fix.findByYyyymmdd(yyyymmdd);
    const retObjUserList = await users.findSelectUser(tool.getYYYYMMDD(new Date()));

    retObjYyyymmdd[0].daykubun = tool.getDayKubun(yyyymmdd);
    retObjYyyymmdd[0].isHoliday = tool.getHoliday(yyyymmdd);
    res.render("./yyyymmddform", {
      yyyymmdd: retObjYyyymmdd[0],
      target_yyyymmdd: yyyymmdd,
      selectuserlist: retObjUserList,
      message: null,
    });
  })();
});

// 指定された年月日の確定情報を更新
router.post('/update', security.authorize(), (req, res, next) => {
  (async () => {

    const id_users_haya_1 = req.body.id_users_haya_1;
    const id_users_haya_2 = req.body.id_users_haya_2;
    const id_users_oso_1 = req.body.id_users_oso_1;
    const id_users_oso_2 = req.body.id_users_oso_2;
    const yyyymmdd = req.body.yyyymmdd;

    if ((id_users_haya_1 === '') || (id_users_oso_1 === '')) {

      req.flash("error", "『早1』と『遅1』は必ず設定してください");
      res.redirect("/yyyymmdds_fix/update/" + yyyymmdd);

    } else {

      // 対象年月日の確定情報を更新
      const retObjYyyymmdds_fix = await yyyymmdds_fix.update(yyyymmdd, id_users_haya_1,id_users_haya_2,id_users_oso_1, id_users_oso_2, tool.getYYYYMMDD(new Date()), req.user.id)
      req.flash("success", `更新しました。${yyyymmdd.slice(0,4)}年${yyyymmdd.slice(4,6)}月${yyyymmdd.slice(6,8)}日`);
      res.redirect("/yms/fix/" + yyyymmdd.slice(0,6));
    }

  })();
});


module.exports = router;
