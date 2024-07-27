const bcrypt = require('bcrypt');

const password = 'rocky2121'; // Replace with your desired password
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) throw err;
    console.log('Generated hash:', hash);
});
