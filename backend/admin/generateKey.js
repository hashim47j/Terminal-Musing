const bcrypt = require('bcrypt');
const fs = require('fs');

const plaintextKey = 'meowmeow'; // 🔒 Replace this with your real key
const saltRounds = 10;

bcrypt.hash(plaintextKey, saltRounds, (err, hash) => {
  if (err) throw err;
  fs.writeFileSync('./backend/admin/adminKey.hash', hash);
  console.log('✅ Encrypted admin key generated and saved to adminKey.hash');
});

