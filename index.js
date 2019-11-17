require('dotenv').config();
const { client } = require('./DBHandlers/DBClient')
const { getAllBots, createBots } = require('./DBHandlers/botHandlers')
const { movementCycle } = require('./movement')
const PORT = process.env.PORT;

const express = require("express");
const app = express();

async function initApp() {
    const conn = await client
    // await createBots(conn)
    let bots = await getAllBots(conn).then(bots => { return bots }).catch(err => console.error(err))
    bots.map(bot => movementCycle(conn, bot.botID))
}

initApp()

app.get("/", async (req, res) => {

    res.send("Cycle started")
});



app.listen(PORT, () => {
    console.log(`Server listening at :${PORT}`);
});

process.on('SIGINT', async () => {
    console.log("Cleaning up.")
    console.log("Dropping collections.")
    const conn = await client
    const db = conn.db('botschaft')
    // db.dropCollection('bots', res => console.log(res))
    // db.dropCollection('travel_history', res => console.log(res))
    // db.dropCollection('possible_locations', res => console.log(res))
    console.log("Closing client.")
    conn.close()
    console.log("Done.")
    process.exit(22)
});