require('dotenv').config();
const bcrypt = require('bcrypt');

const password = process.env.PASSWORD;
const hash = process.env.PASSWORD_HASH;

bcrypt.compare(password, hash, (err, result) => {
    if (err) throw err;
    console.log('Password match:', result);
});
