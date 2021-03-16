const mongoose = require('mongoose'); //Mongo DB ORM
require('dotenv').config(); //Use .env files

const dbServer = process.env.DB_SERVER;
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbCluster = process.env.DB_CLUSTER;

//change connectionString acording to your server connection - in this case, is Atlas Mongo DB
let connectionString =  ''+dbServer+dbUser+':'+dbPassword+dbCluster+'.mongodb.net/'+dbName+'?authSource=admin'

mongoose.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false  });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('connected to database')
});

module.exports = mongoose