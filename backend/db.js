const mongoose = require('mongoose')
const dns = require('dns');

dns.setServers(['1.1.1.1','8.8.8.8']);
require('dotenv').config();

if (!process.env.MONGO_URL) {
    console.error('Error: MONGO_URL is not defined in .env file');
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URL).then(
    () => {
        console.log('Connected to database successfully');
    }
).catch((err) => {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
})