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
        const retObj = await knex.from("users").orderBy([{column: 'ymd_end', order:'desc'},{column: 'role', order:'asc'},{column:'ymd_add',order:'asc'}])
        return retObj;
    } catch(err) {
        throw err;
    }
};

const insert = async (inObj) => {
    try {
        const query = "insert into users ( id, name, password, role, ymd_add, id_add, ymd_end, id_end, ymd_upd, id_upd ) values ('" + inObj.id + "','" + inObj.name + "','" + inObj.password + "','" + inObj.role + "','" + inObj.ymd_add + "','" + inObj.id_add + "','" + inObj.ymd_end + "','" + inObj.id_end + "','" + inObj.ymd_upd + "','" + inObj.id_upd + "')";
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

const update = async (inObj) => {
    try {
        let query;
        if (inObj.password) {
            query = "update users set name = '" + inObj.name + "', password = '" + inObj.password + "', role = '" + inObj.role + "', ymd_add = '" + inObj.ymd_add + "', id_add = '" + inObj.id_add + "', ymd_end = '" + inObj.ymd_end + "', id_end = '" + inObj.id_end + "', ymd_upd = '" + inObj.ymd_upd + "', id_upd = '" + inObj.id_upd + "' where id = '" + inObj.id + "'";
        } else {
            query = "update users set name = '" + inObj.name + "', role = '" + inObj.role + "', ymd_add = '" + inObj.ymd_add + "', id_add = '" + inObj.id_add + "', ymd_end = '" + inObj.ymd_end + "', id_end = '" + inObj.id_end + "', ymd_upd = '" + inObj.ymd_upd + "', id_upd = '" + inObj.id_upd + "' where id = '" + inObj.id + "'";
        }
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

const remove = async (id) => {
    try {
        const query = "delete from users where id = '" + id + "'";
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
    find,
    findPKey,
    insert,
    update,
    remove,
};