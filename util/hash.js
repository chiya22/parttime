const crypto = require("crypto");

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const PASSWORD_SALT = process.env.HASH_SALT;
const PASSWORD_STRECH = process.env.HASH_STRECH;

const digest = function (text) {
  let hash;
  text += PASSWORD_SALT;

  for (let i = PASSWORD_STRECH; i--;) {
    hash = crypto.createHash("sha512");
    hash.update(text);
    text = hash.digest("hex");
  }
  return text;
};

module.exports = {
  digest
};