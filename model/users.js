const knex = require('../db/knex.js').connect();
const log4js = require("log4js");
const logger = log4js.configure("./config/log4js-config.json").getLogger();

const findPKey = async (id) => {
    try {
        const retObj = await knex.from("users").where({id: id})
        return retObj;
    } catch(err) {
        throw err;
    }
};

const find = async () => {
    try {
        const retObj = await knex.from("users").orderBy("id","asc")
        return retObj;
    } catch(err) {
        throw err;
    }
};

const insert = async (inObj) => {
    try {
        const query = "insert into users values ('" + inObj.id + "','" + inObj.name + "','" + inObj.password + "','" + inObj.role + "','" + inObj.ymd_add + "','" + inObj.id_add + "','" + inObj.ymd_upd + "','" + inObj.id_upd + "')";
        logger.info(query);
        const retObj = await knex.raw(query)
        return retObj;
        // return retObj[0];
    } catch(err) {
        throw err;
    }
};

const update = async (inObj) => {
    try {
        let query;
        if (inObj.password) {
            query = "update users set name = '" + inObj.name + "', password = '" + inObj.password + "', role = '" + inObj.role + "', ymd_add = '" + inObj.ymd_add + "', id_add = '" + inObj.id_add + "', ymd_upd = '" + inObj.ymd_upd + "', id_upd = '" + inObj.id_upd + "' where id = '" + inObj.id + "'";
        } else {
            query = "update users set name = '" + inObj.name + "', role = '" + inObj.role + "', ymd_add = '" + inObj.ymd_add + "', id_add = '" + inObj.id_add + "', ymd_upd = '" + inObj.ymd_upd + "', id_upd = '" + inObj.id_upd + "' where id = '" + inObj.id + "'";
        }
        logger.info(query);
        const retObj = await knex.raw(query)
        return retObj;
        // return retObj[0];
    } catch(err) {
        throw err;
    }
};

const remove = async (id) => {
    try {
        const query = "delete from users where id = '" + id + "'";
        const retObj = await knex.raw(query)
        return retObj;
        // return retObj[0];
    } catch(err) {
        throw err;
    }
};

module.exports = {
    find: find,
    findPKey: findPKey,
    insert: insert,
    update: update,
    remove: remove,
};