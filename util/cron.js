const config = require("../config/app.config");
const log4js = require("log4js");
const logger = log4js.configure("./config/log4js-config.json").getLogger();

const cron = require("node-cron");
const line = require('@line/bot-sdk');
const yyyymmdds_fix = require('../model/yyyymmdds_fix');
const tool = require('./tool');

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// cron設定
const startcron = () => {

  if (config.cron.effective === "on") {

    cron.schedule(config.cron.sendShift, () => {

      (async () => {

        // 本日のシフト情報を取得
        const yyyymmdd = tool.getYYYYMMDDAfterOneDay(new Date());
        const youbi = tool.getDayKubun(yyyymmdd);
        const youbiStr = youbi==='0'?'日':youbi==='1'?'月':youbi==='2'?'火':youbi==='3'?'水':youbi==='4'?'木':youbi==='5'?'金':'土';
        const yyyymmdd_fix = await yyyymmdds_fix.findByYyyymmdd(yyyymmdd);

        // 早番１
        if (yyyymmdd_fix[0].id_line_group_haya_1) {
          let messagebody;
          messagebody = `▼ 明日のシフト通知 ▼`;
          messagebody += `\r\n${yyyymmdd_fix[0].nm_users_haya_1}さんは明日${yyyymmdd.slice(4,6)}月${yyyymmdd.slice(6,8)}日(${youbiStr})の早番です。`;
          messagebody += `\r\n忘れずに出勤お願いしますロボ`;
          await sendLineMessage(messagebody, yyyymmdd_fix[0].id_line_group_haya_1)
        }
        // 早番２
        if (yyyymmdd_fix[0].id_line_group_haya_2) {
          let messagebody;
          messagebody = `▼ 明日のシフト通知 ▼`;
          messagebody += `\r\n${yyyymmdd_fix[0].nm_users_haya_2}さんは明日${yyyymmdd.slice(4,6)}月${yyyymmdd.slice(6,8)}日(${youbiStr})の早番です。`;
          messagebody += `\r\n忘れずに出勤お願いしますロボ`;
          await sendLineMessage(messagebody, yyyymmdd_fix[0].id_line_group_haya_2)
        }
        // 遅番１
        if (yyyymmdd_fix[0].id_line_group_oso_1) {
          let messagebody;
          messagebody = `▼ 明日のシフト通知 ▼`;
          messagebody += `\r\n${yyyymmdd_fix[0].nm_users_oso_1}さんは明日${yyyymmdd.slice(4,6)}月${yyyymmdd.slice(6,8)}日(${youbiStr})の遅番です。`;
          messagebody += `\r\n忘れずに出勤お願いしますロボ`;
          await sendLineMessage(messagebody, yyyymmdd_fix[0].id_line_group_oso_1)
        }
        // 遅番２
        if (yyyymmdd_fix[0].id_line_group_oso_2) {
          let messagebody;
          messagebody = `▼ 明日のシフト通知 ▼`;
          messagebody += `\r\n${yyyymmdd_fix[0].nm_users_oso_2}さんは明日${yyyymmdd.slice(4,6)}月${yyyymmdd.slice(6,8)}日(${youbiStr})の遅番です。`;
          messagebody += `\r\n忘れずに出勤お願いしますロボ`;
          await sendLineMessage(messagebody, yyyymmdd_fix[0].id_line_group_oso_2)
        }

      })();
    });
  }
};

const sendLineMessage = (messagebody, sendToId) => {
  (async () => {
    
    const message = {
      type: 'text',
      text: messagebody
    };
  
    // LINEコンテンツを生成
    const client = new line.Client({
      channelAccessToken: process.env.LINE_ACCESS_TOKEN
    });
    
    // LINE送信
    // await client.pushMessage(process.env.LINE_SHAIN_GROUP, message)
    if (sendToId) {
      await client.pushMessage(sendToId, message)
      .then(() => {
        logger.info("メッセージの送信に成功しました。");
      })
      .catch((err) => {
        logger.info("メッセージの送信に失敗しました。：" + err);
      });
    }
  })()
};

module.exports = {
  startcron,
};
