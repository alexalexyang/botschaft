require('dotenv').config();
const mongo = require('mongodb').MongoClient
const mongoConnStr = `mongodb+srv://alexalexyang:${process.env.MONGO_PW}@cluster0-t2dfw.mongodb.net/test?retryWrites=true&w=majority`

const client = mongo.connect(mongoConnStr, { useNewUrlParser: true, useUnifiedTopology: true })

module.exports = {
    client
}