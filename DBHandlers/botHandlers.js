const { client } = require('./DBClient')
const uuidv4 = require('uuid/v4');

async function createBots(conn) {
    const db = conn.db('botschaft')
    const collection = db.collection('bots')
    collection.insertMany([
        { botID: uuidv4(), name: 'weeoo', home: { lat: 51.488545, lng: 11.968298 }, owner: "olga", date: new Date() },
        { botID: uuidv4(), name: 'thething', home: { lat: 55.692446, lng: 12.551987 }, owner: "bengu", date: new Date() },
        { botID: uuidv4(), name: 'marglytta', home: { lat: 64.138809, lng: -21.952691 }, owner: "daniel", date: new Date() },
        { botID: uuidv4(), name: 'passaro', home: { lat: 38.754838, lng: -9.171525 }, owner: "lia", date: new Date() },
        { botID: uuidv4(), name: 'nontok', home: { lat: 41.644704, lng: 41.626405 }, owner: "alex", date: new Date() }])
}

async function getAllBots(conn, movementCycle) {
    const db = conn.db('botschaft')
    const collection = db.collection('bots')
    const bots = await collection.find().toArray()
        .then(bots => {
            return bots
        })
        .catch(err => console.error(err))
    return bots
}



module.exports = {
    getAllBots,
    createBots
}