// generate-password-hash.js
const crypto = require('crypto');
const password = 'RealHakuba@Admin2024#test!'; 
const hash = crypto.createHash('sha256').update(password).digest('hex');
console.log('Password hash:', hash);
console.log('Password:', password);