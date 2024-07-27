const bcrypt = require('bcrypt');

const password = 'rocky2121'; // Replace with the same password you used to generate the hash
const hash = '$2b$10$dlM66V/Ipf8vhLrm30i4Z.gzeI5MOt6uKDHnf3G4oM13fWzgyjZpG'; // Replace with the new generated hash

bcrypt.compare(password, hash, (err, result) => {
    if (err) throw err;
    console.log('Password match:', result);
});
