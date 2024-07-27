require('dotenv').config();
const bcrypt = require('bcrypt');

const password = process.env.PASSWORD;
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) throw err;
    console.log('Generated hash:', hash);
});
