const knex = require('../db/knex.js').connect();
const log4js = require("log4js");
const logger = log4js.configure("./config/log4js-config.json").getLogger();

const findPKey = async (id_users, yyyymmdd) => {
    try {
        const retObj = await knex.from("yyyymmdds").where({id_user: id_users, yyyymmdd: yyyymmdd })
        return retObj;
    } catch(err) {
        throw err;
    }
};

const findByYyyymmAndUserid = async (yyyymm, id_users ) => {
    try {
        const query = "SELECT * FROM yyyymmdds WHERE yyyymm = '" + yyyymm + "' and id_users = '" + id_users + "' ORDER BY yyyymmdd ASC;"
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

const findByYyyymmGroupByUser = async (yyyymm) => {
    try {
        const query = "SELECT a.id_users, b.name AS name_users FROM yyyymmdds a LEFT OUTER JOIN users b ON a.id_users = b.id  WHERE a.yyyymm = '" + yyyymm + "' GROUP BY id_users, b.name ORDER BY a.id_users asc;"
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
const findByYyyymmGroupByNoUser = async (yyyymm) => {
    try {
        const query = "SELECT u.id as id_users, u.name as name_users FROM users u WHERE LEFT(u.ymd_add,6) <= '" + yyyymm + "' AND LEFT(u.ymd_end,6) >= '" + yyyymm + "' AND u.id NOT IN (SELECT ymd.id_users FROM yyyymmdds ymd WHERE ymd.yyyymm = '" + yyyymm + "') AND u.role != 'admin' ORDER BY u.id asc;"
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

const findByYyyymmForDownload = async (yyyymm) => {
    try {
        // const query = "(SELECT a.id_users AS id_users, b.name AS name_users, a.yyyymmdd AS yyyymmdd, a.kubun FROM yyyymmdds a LEFT OUTER JOIN users b ON a.id_users = b.id  WHERE a.yyyymm = '" + yyyymm + "') UNION ALL (SELECT a.id_users AS id_users, b.name AS name_users,'MEMO' as yyyyymmdd, REGEXP_REPLACE(a.memo,'\r|\n|\r\n', '　','g') as kubun FROM memos a LEFT OUTER JOIN users b ON a.id_users = b.id  WHERE a.yyyymm = '" + yyyymm + "') ORDER BY id_users ASC, yyyymmdd ASC"
        const query = "SELECT * FROM ((SELECT a.id_users AS id_users, b.name AS name_users, a.yyyymmdd AS yyyymmdd, a.kubun FROM yyyymmdds a LEFT OUTER JOIN users b ON a.id_users = b.id  WHERE a.yyyymm = '" + yyyymm + "') UNION ALL (SELECT a.id_users AS id_users, b.name AS name_users,'MEMO' as yyyyymmdd, replace(replace(REPLACE(a.memo, '\r\n', ' '), '\r', ' '), '\n', ' ') as kubun FROM memos a LEFT OUTER JOIN users b ON a.id_users = b.id  WHERE a.yyyymm = '" + yyyymm + "')) c ORDER BY c.id_users ASC, c.yyyymmdd ASC"
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
        const query = "insert into yyyymmdds values ('" + inObj.id_users + "','" + inObj.yyyymm + "','" + inObj.yyyymmdd + "','" + inObj.kubun + "','" + inObj.ymd_add + "','" + inObj.id_add + "','" + inObj.ymd_upd + "','" + inObj.id_upd + "')";
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

const removeByYyyymmAndUserid = async (yyyymm, id_users) => {
    try {
        const query = "delete from yyyymmdds where yyyymm = '" + yyyymm + "' and id_users = '" + id_users + "';"
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
    findByYyyymmAndUserid,
    findByYyyymmGroupByUser,
    findByYyyymmGroupByNoUser,
    findByYyyymmForDownload,
    insert,
    removeByYyyymmAndUserid,
};