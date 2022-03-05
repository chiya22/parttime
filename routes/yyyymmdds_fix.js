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
    const retObjYyyymmdd = await yyyymmdds_fix.findByYyyymmAndUserid(req.params.yyyymm, req.user.id);

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
