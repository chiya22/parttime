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
        if ((item.role_users_haya_1 !== 'admin') && (item.role_users_oso_1 !== 'admin')) {
          inObj.status = '確定';
        } else if ((item.role_users_haya_1 === 'admin') && (item.role_users_oso_1 === 'admin')) {
          inObj.status = '募集中(早遅)';
          // 早番のサブが現在のユーザー以外の場合はマスキングする
          if ((item.id_users_haya_2) && (item.id_users_haya_2 !== req.user.id)) {
            inObj.nm_users_haya_2 = '*****'
          }
          // 遅番のサブが現在のユーザー以外の場合はマスキングする
          if ((item.id_users_oso_2) && (item.id_users_oso_2 !== req.user.id)) {
            inObj.nm_users_oso_2 = '*****'
          }
        } else if (item.role_users_haya_1 !== 'admin') {
          inObj.status = '募集中(遅)';
          // マスキング
          if ((item.id_users_haya_1 !== req.user.id) && (item.id_users_haya_2 !== req.user.id) && (item.id_users_oso_2 !== req.user.id)) {
            inObj.nm_users_haya_1 = '*****'
            if (inObj.id_users_haya_2) {
              inObj.nm_users_haya_2 = '*****'
            }
            if (item.id_users_oso_2) {
              inObj.nm_users_oso_2 = '*****'
            }
          }
        } else {
          inObj.status = '募集中(早)';
          // マスキング
          if ((item.id_users_oso_1 !== req.user.id) && (item.id_users_oso_2 !== req.user.id) && (item.id_user_haya_2 !== req.user.id)) {
            inObj.nm_users_oso_1 = '*****'
            if (inObj.id_users_oso_2) {
              inObj.nm_users_oso_2 = '*****'
            }
            if (item.id_users_haya_2) {
              inObj.nm_users_haya_2 = '*****'
            }
          }
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

module.exports = router;
