const knex = require('../db/knex.js').connect();
const log4js = require("log4js");
const logger = log4js.configure("./config/log4js-config.json").getLogger();
const tool = require("../util/tool");

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
        const query = "SELECT a.*, b.name as nm_users_haya_1, b.role as role_users_haya_1, c.name as nm_users_haya_2, c.role as role_users_haya_2, d.name as nm_users_oso_1, d.role as role_users_oso_1, e.name as nm_users_oso_2, e.role as role_users_oso_2 FROM (" + query1 + ") a LEFT OUTER JOIN users b ON a.id_users_haya_1 = b.id LEFT OUTER JOIN users c ON a.id_users_haya_2 = c.id LEFT OUTER JOIN users d ON a.id_users_oso_1 = d.id LEFT OUTER JOIN users e ON a.id_users_oso_2 = e.id ORDER BY a.yyyymmdd ASC;"
        logger.info(query);
        const retObj = await knex.raw(query);
        // Postgres
        // return retObj.rows;
        // MySql
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const findByYyyymmdd = async (yyyymmdd) => {
    try {
        const query1 = "SELECT aa.* from yyyymmdds_fix aa WHERE aa.yyyymmdd = '" + yyyymmdd + "'"
        const query = "SELECT a.*, b.name as nm_users_haya_1, b.role as role_users_haya_1, b.id_line_group as id_line_group_haya_1, c.name as nm_users_haya_2, c.role as role_users_haya_2, c.id_line_group as id_line_group_haya_2, d.name as nm_users_oso_1, d.role as role_users_oso_1, d.id_line_group as id_line_group_oso_1, e.name as nm_users_oso_2, e.role as role_users_oso_2, e.id_line_group as id_line_group_oso_2 FROM (" + query1 + ") a LEFT OUTER JOIN users b ON a.id_users_haya_1 = b.id LEFT OUTER JOIN users c ON a.id_users_haya_2 = c.id LEFT OUTER JOIN users d ON a.id_users_oso_1 = d.id LEFT OUTER JOIN users e ON a.id_users_oso_2 = e.id;"
        logger.info(query);
        const retObj = await knex.raw(query);
        // Postgres
        // return retObj.rows;
        // MySql
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const findByYyyymmForDownload = async (yyyymm) => {
    try {
        // const query = "SELECT a.id_users, b.name AS name_users, a.yyyymmdd, a.kubun FROM yyyymmdds a LEFT OUTER JOIN users b ON a.id_users = b.id  WHERE a.yyyymm = '" + yyyymm + "' ORDER BY a.id_users asc, a.yyyymmdd asc;"
        const query = "SELECT yyyymmdd, yyyymm, id_users_haya_1, id_users_haya_2, id_users_oso_1, id_users_oso_2 FROM yyyymmdds_fix WHERE yyyymm = '" + yyyymm + "' ORDER BY yyyymmdd ASC"
        logger.info(query);
        const retObj = await knex.raw(query);
        // Postgres
        // return retObj.rows;
        // MySql
        return retObj[0];
    } catch(err) {
        throw err;
    }
}

const insert = async (inObj) => {
    try {
        const query = "insert into yyyymmdds_fix values ('" + inObj.yyyymmdd + "','" + inObj.yyyymm + "'," + tool.returnvalue(inObj.id_users_haya_1) + "," + tool.returnvalue(inObj.id_users_haya_2) + "," + tool.returnvalue(inObj.id_users_oso_1) + "," + tool.returnvalue(inObj.id_users_oso_2) + ", '" + inObj.ymd_add + "','" + inObj.id_add + "','" + inObj.ymd_upd + "','" + inObj.id_upd + "')";
        logger.info(query);
        const retObj = await knex.raw(query)
        // Postgres
        // return retObj;
        // MySql
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const update = async (yyyymmdd, id_users_haya_1,id_users_haya_2, id_users_oso_1, id_users_oso_2, ymd_upd, id_upd) => {
    try {
        const query = "UPDATE yyyymmdds_fix SET id_users_haya_1 = '" + id_users_haya_1 + "', id_users_haya_2 = '" + id_users_haya_2 + "', id_users_oso_1 = '" + id_users_oso_1 + "', id_users_oso_2 = '" + id_users_oso_2 + "', ymd_upd = '" + ymd_upd + "', id_upd = '" + id_upd + "' WHERE yyyymmdd = '" + yyyymmdd + "';";
        logger.info(query);
        const retObj = await knex.raw(query)
        // エラー処理なし
        // Postgres
        // return retObj;
        // MySql
        return retObj[0];
    } catch(err) {
        throw err;
    }
}

const removeByYyyymm = async (yyyymm) => {
    try {
        const query = "delete from yyyymmdds_fix where yyyymm = '" + yyyymm + "';"
        logger.info(query);
        const retObj = await knex.raw(query)
        // Postgres
        // return retObj;
        // MySql
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

module.exports = {
    findPKey,
    findByYyyymm,
    findByYyyymmdd,
    findByYyyymmForDownload,
    insert,
    update,
    removeByYyyymm,
};