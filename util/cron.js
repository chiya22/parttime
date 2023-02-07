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
        const yyyymmdd = tool.getYYYYMMDD(new Date());
        const youbi = tool.getDayKubun(yyyymmdd);
        const youbiStr = youbi==='0'?'日':youbi==='1'?'月':youbi==='2'?'火':youbi==='3'?'水':youbi==='4'?'木':youbi==='5'?'金':'土';
        const yyyymmdd_fix = await yyyymmdds_fix.findByYyyymmdd(yyyymmdd);

        let messagebody;
        messagebody = `▼ 明日のシフト通知 ▼`;
        messagebody += `\r\n${yyyymmdd.slice(0,4)}年${yyyymmdd.slice(4,6)}月${yyyymmdd.slice(6,8)}日(${youbiStr})`;
        messagebody += `\r\n\r\n早番：${yyyymmdd_fix[0].nm_users_haya_1}`;
        messagebody += yyyymmdd_fix[0].nm_users_haya_2?yyyymmdd_fix[0].nm_users_haya_2:"";
        messagebody += `\r\n遅番：${yyyymmdd_fix[0].nm_users_oso_1}`;
        messagebody += yyyymmdd_fix[0].nm_users_oso_2?yyyymmdd_fix[0].nm_users_oso_2:"";
        messagebody += '\r\n\r\n出勤よろしくお願いしますロボ！';

        const message = {
          type: 'text',
          text: messagebody
        };

        // LINEコンテンツを生成
        const client = new line.Client({
          channelAccessToken: process.env.LINE_ACCESS_TOKEN
        });
        
        // LINE送信
        await client.pushMessage(process.env.LINE_SHAIN_GROUP, message)
          .then(() => {
            logger.info("メッセージの送信に成功しました。");
          })
          .catch((err) => {
            logger.info("メッセージの送信に失敗しました。：" + err);
          });

      })();

    });
  }
};

module.exports = {
  startcron,
};
