const bcrypt = require('bcrypt');

const password = 'yourpassword'; // Replace with your actual password
const hash = '$2b$10$eLMX/DXqeyrecNLf1HZo8u8a3KwG/7X34LvUdt1UlewmAP1/FZGD'; // Replace with your hash

bcrypt.compare(password, hash, (err, result) => {
    if (err) throw err;
    console.log('Password match:', result);
});
