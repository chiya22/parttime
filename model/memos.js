const knex = require('../db/knex.js').connect();
const log4js = require("log4js");
const logger = log4js.configure("./config/log4js-config.json").getLogger();

const findPKey = async (yyyymm, id_users) => {
    try {
        const retObj = await knex.from("memos").where({yyyymm: yyyymm, id_users: id_users })
        return retObj;
    } catch(err) {
        throw err;
    }
};

const insert = async (inObj) => {
    try {
        const query = "insert into memos values ('" + inObj.yyyymm + "','" + inObj.id_users + "','" + inObj.memo + "','" + inObj.ymd_add + "', '" + inObj.id_add + "', '" + inObj.ymd_upd + "', '" + inObj.id_upd + "')";
        logger.info(query);
        const retObj = await knex.raw(query)
        return retObj;
        // return retObj[0];
    } catch(err) {
        throw err;
    }
};

const remove = async (yyyymm, id_users) => {
    try {
        const query = "delete from memos where yyyymm = '" + yyyymm + "' and id_users = '" + id_users + "';";
        logger.info(query);
        const retObj = await knex.raw(query)
        return retObj;
        // return retObj[0];
    } catch(err) {
        throw err;
    }
};

module.exports = {
    findPKey: findPKey,
    insert: insert,
    remove: remove,
};