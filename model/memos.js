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

// const findByYyyymmForDownload = async (yyyymm) => {
//     try {
//         const query = "SELECT a.id_users, b.name AS name_users, a.memo FROM memos a LEFT OUTER JOIN users b ON a.id_users = b.id  WHERE a.yyyymm = '" + yyyymm + "' ORDER BY a.id_users ASC;"
//         logger.info(query);
//         const retObj = await knex.raw(query);
//         return retObj.rows;
//         // return retObj[0];
//     } catch(err) {
//         throw err;
//     }

// }

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
    // findByYyyymmForDownload:findByYyyymmForDownload,
    insert: insert,
    remove: remove,
};