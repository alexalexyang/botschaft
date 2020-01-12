require("dotenv").config();
const {
  getCurrentLocation,
  saveNextLocation,
  savePossibleLocations
} = require("./DBHandlers/locationHandlers");
const axios = require("axios");

function getQueryTerms() {
  let poiKey = `amenity`;
  let poiValue = `restaurant`;
  return [poiKey, poiValue];
}

async function getPOIs(radius, lat, lng, poiKey, poiValue) {
  // If no entries, get from OSM
  let query = `https://overpass.kumi.systems/api/interpreter?data=
        [out:json][timeout:25];
        (
        node(around: ${radius}, ${lat}, ${lng})[${poiKey}=${poiValue}];
        way(around: ${radius}, ${lat}, ${lng})[${poiKey}=${poiValue}];
        rel(around: ${radius}, ${lat}, ${lng})[${poiKey}=${poiValue}];
        );
        out center;`;
  console.log("Sending request");
  let POIs = await axios
    .get(query)
    .then(res => {
      return res.data.elements;
    })
    .catch(err => console.log(err));
  return POIs;
}

function decideNextLocation(botID, POIs) {
  // Fetch POIs from MongoDB
  // Make decision about next location
  if (!POIs) {
    console.log("POIs undefined: ", botID);
    // Get previous location
    return;
  }
  let index = Math.floor(Math.random() * POIs.length);
  let POI = POIs[index];

  // Check if it's been there before, remove and redo if yes

  return [index, POI];
}

async function movementCycle(conn, botID) {
  setInterval(async () => {
    // console.log("Connected to MongoDB: ", conn.isConnected())
    const [poiKey, poiValue] = getQueryTerms();
    const [radius, lat, lng] = await getCurrentLocation(
      conn,
      botID
    ).catch(err => console.log(err));
    // console.log("Got rll: ", radius, lat, lng)
    const POIs = await getPOIs(radius, lat, lng, poiKey, poiValue)
      .then(POIs => {
        return POIs;
      })
      .catch(err => console.log(err));
    // console.log("Got the POIs")
    let [indexNextLocation, nextLocation] = decideNextLocation(botID, POIs);
    // console.log("Got the next loc.")
    saveNextLocation(conn, botID, nextLocation);
    // console.log("Created history!")
    savePossibleLocations(conn, botID, POIs);
    // console.log("Saved locations")
    console.log("Successful cycle: ", botID, nextLocation.id);
  }, 8000);
}

module.exports = {
  movementCycle
};
