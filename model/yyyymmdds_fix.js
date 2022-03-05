const knex = require('../db/knex.js').connect();
const log4js = require("log4js");
const logger = log4js.configure("./config/log4js-config.json").getLogger();

const findPKey = async (yyyymmdd) => {
    try {
        const retObj = await knex.from("yyyymmdds_fix").where({yyyymmdd: yyyymmdd })
        return retObj;
    } catch(err) {
        throw err;
    }
};

const findByYyyymm = async (yyyymm) => {
    try {
        const query1 = "SELECT aa.* from yyyymmdds_fix aa WHERE aa.yyyymm = '" + yyyymm + "'"
        const query = "SELECT a.*, b.name as nm_users_haya_1, c.name as nm_users_haya_2, d.name as nm_users_oso_1, e.name as nm_users_oso_2 FROM (" + query1 + ") a LEFT OUTER JOIN users b ON a.id_users_haya_1 = b.id LEFT OUTER JOIN users c ON a.id_users_haya_2 = c.id LEFT OUTER JOIN users d ON a.id_users_oso_1 = d.id LEFT OUTER JOIN users e ON a.id_users_oso_2 = e.id ORDER BY a.yyyymmdd ASC;"
        logger.info(query);
        const retObj = await knex.raw(query);
        // Postgres
        return retObj.rows;
        // MySql
        // return retObj[0];
    } catch(err) {
        throw err;
    }
};

const findByYyyymmAndUserid = async (yyyymm, id_users ) => {
    try {
        // 対象年月の中で、募集中のレコード（早番、遅番が確定していない）、または、自分が早番か遅番に設定されているレコード
        const query1 = "SELECT aa.* from yyyymmdds_fix aa WHERE ((aa.id_users_haya_1 IS NULL AND aa.id_users_haya_2 IS NULL) OR (aa.id_users_oso_1 IS NULL AND aa.id_users_oso_2 IS NULL)) OR (aa.id_users_haya_1 = '" + id_users + "' OR aa.id_users_haya_2 = '" + id_users + "' OR aa.id_users_oso_1 = '" + id_users + "' OR aa.id_users_oso_2 = '" + id_users + "') AND aa.yyyymm = '" + yyyymm + "'"
        const query = "SELECT a.*, b.name as nm_users_haya_1, c.name as nm_users_haya_2, d.name as nm_users_oso_1, e.name as nm_users_oso_2 FROM (" + query1 + ") a LEFT OUTER JOIN users b ON a.id_users_haya_1 = b.id LEFT OUTER JOIN users c ON a.id_users_haya_2 = c.id LEFT OUTER JOIN users d ON a.id_users_oso_1 = d.id LEFT OUTER JOIN users e ON a.id_users_oso_2 = e.id ORDER BY a.yyyymmdd ASC;"
        logger.info(query);
        const retObj = await knex.raw(query);
        // Postgres
        return retObj.rows;
        // MySql
        // return retObj[0];
    } catch(err) {
        throw err;
    }
};

const insert = async (inObj) => {
    try {
        const query = "insert into yyyymmdds values ('" + inObj.yyyymmdd + "','" + inObj.yyyymm + "','" + inObj.id_users_haya_1 + "','" + inObj.id_users_haya_2 + "','" + inObj.id_users_oso_1 + "','" + inObj.id_users_oso_2 + "','" + inObj.ymd_add + "','" + inObj.id_add + "')";
        logger.info(query);
        const retObj = await knex.raw(query)
        // Postgres
        return retObj;
        // MySql
        // return retObj[0];
    } catch(err) {
        throw err;
    }
};

const removeByYyyymm = async (yyyymm) => {
    try {
        const query = "delete from yyyymmdds where yyyymm = '" + yyyymm + "';"
        logger.info(query);
        const retObj = await knex.raw(query)
        // Postgres
        return retObj;
        // MySql
        // return retObj[0];
    } catch(err) {
        throw err;
    }
};

module.exports = {
    findPKey,
    findByYyyymm,
    findByYyyymmAndUserid,
    insert,
    removeByYyyymm,
};