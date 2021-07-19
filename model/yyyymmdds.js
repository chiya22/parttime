const knex = require('../db/knex.js').connect();
const log4js = require("log4js");
const logger = log4js.configure("./config/log4js-config.json").getLogger();

const findPKey = async (id_users, yyyymmdd) => {
    try {
        const retObj = await knex.from("yms").where({id_user: id_users, yyyymmdd: yyyymmdd })
        return retObj;
    } catch(err) {
        throw err;
    }
};

const findByYyyymmAndUserid = async (yyyymm, id_users ) => {
    try {
        const query = 'SELECT * FROM yyyymmdds WHERE yyyymm = "' + yyyymm + '" and id_users = "' + id_users + '" ORDER BY yyyymmdd ASC;'
        logger.info(query);
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const findByYyyymmGroupByUser = async (yyyymm) => {
    try {
        const query = 'SELECT a.id_users, b.name AS name_users FROM yyyymmdds a LEFT OUTER JOIN users b ON a.id_users = b.id  WHERE a.yyyymm = "' + yyyymm + '" GROUP BY id_users ORDER BY a.id_users asc;'
        logger.info(query);
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
}

const findByYyyymmForDownload = async (yyyymm) => {
    try {
        const query = 'SELECT a.id_users, b.name AS name_users, a.yyyymmdd, a.kubun FROM yyyymmdds a LEFT OUTER JOIN users b ON a.id_users = b.id  WHERE a.yyyymm = "' + yyyymm + '" ORDER BY a.id_users asc, a.yyyymmdd asc;'
        logger.info(query);
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
}

const insert = async (inObj) => {
    try {
        const query = 'insert into yyyymmdds values ("' + inObj.id_users + '","' + inObj.yyyymm + '","' + inObj.yyyymmdd + '","' + inObj.kubun + '","' + inObj.ymd_add + '", "' + inObj.id_add + '", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '")';
        logger.info(query);
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const removeByYyyymmAndUserid = async (yyyymm, id_users) => {
    try {
        const query = 'delete from yyyymmdds where yyyymm = "' + yyyymm + '" and id_users = "' + id_users + '";'
        logger.info(query);
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

module.exports = {
    findPKey: findPKey,
    findByYyyymmAndUserid: findByYyyymmAndUserid,
    findByYyyymmGroupByUser:findByYyyymmGroupByUser,
    findByYyyymmForDownload: findByYyyymmForDownload,
    insert: insert,
    removeByYyyymmAndUserid: removeByYyyymmAndUserid,
};