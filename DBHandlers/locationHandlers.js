const axios = require("axios");

async function getCurrentLocation(conn, botID) {
  let collection = conn.db("botschaft").collection("travel_history");

  let bot = await collection
    .find({ botID: botID })
    .sort({ _id: -1 })
    .limit(1)
    .next()
    .then(bot => {
      return bot;
    })
    .catch(err => console.error(err));
  if (bot) {
    return [300, bot.lat, bot.lng];
  }

  collection = conn.db("botschaft").collection("bots");
  bot = await collection
    .findOne({ botID: botID })
    .then(bot => {
      return bot;
    })
    .catch(err => console.error(err));
  return [300, bot.home.lat, bot.home.lng];
}

async function saveNextLocation(conn, botID, POI) {
  const db = conn.db("botschaft");
  const collection = db.collection("travel_history");

  collection.insertOne({
    botID: botID,
    osmID: POI.id,
    lat: POI.lat ? POI.lat : POI.center.lat,
    lng: POI.lon ? POI.lon : POI.center.lon,
    name: POI.tags.name,
    name_en: POI.tags["name:en"],
    osm_tags: POI.tags,
    date: new Date()
  });
}

async function savePossibleLocations(conn, botID, POIs) {
  // const db = conn.db('botschaft')
  // const collection = db.collection('possible_locations')

  // Delete nextLocation from POIs
  // POIs[indexNextLocation] = POIs[POIs.length - 1]
  // POIs.pop()

  // Save POIs
  // collection.updateOne(
  //     { botID: botID },
  //     { $set: { pois: POIs } },
  //     { upsert: true }
  // );
  let pois = JSON.stringify(POIs).replace(/"/g, "'");
  // let parsed = JSON.parse(pois.replace(/'/g, '"'))

  let payload = `mutation {addPossibleLocations(botID: "${botID}",pois: "${pois}") {botID, pois}}`;

  axios
    .post("https://8001.notathoughtexperiment.me/graphql", {
      query: payload
    })
    .then(function(response) {
      console.log(response.status);
    })
    .catch(function(error) {
      console.log(error);
    });
}

module.exports = {
  getCurrentLocation,
  saveNextLocation,
  savePossibleLocations
};
