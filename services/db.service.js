const MongoClient = require('mongodb').MongoClient

const config = require('../config')

module.exports = {
    getCollection
}

// Database Name
const dbName = 'mellow'

var dbConn = null

async function getCollection(collectionName) {
    try {
        console.log('trying to get collection');
        const db = await connect()
        console.log('connected');
        const collection = await db.collection(collectionName)
        console.log('got collection');
        return collection
    } catch (err) {
        logger.error('Failed to get Mongo collection', err)
        throw err
    }
}

async function connect() {
    if (dbConn) return dbConn
    try {
        const client = await MongoClient.connect(config.dbURL, { useNewUrlParser: true, useUnifiedTopology: true })
        const db = client.db(dbName)
        dbConn = db
        return db
    } catch (err) {
        console.log('cant connect to db');
        logger.error('Cannot Connect to DB', err)
        throw err
    }
}




