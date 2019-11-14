require('dotenv').config();
const PORT = process.env.PORT;

const axios = require('axios');
const express = require("express");
const app = express();

let currentLocation = []

function getQueryTerms() {
    let poiKey = `amenity`;
    let poiValue = `restaurant`;
    return [poiKey, poiValue]
}

function getCurrentLocation() {
    // Get from last known location or default
    if (currentLocation.length > 0) {
        let location = currentLocation[currentLocation.length - 1]
        let radius = 250;
        let lat = location.lat ? location.lat : location.center.lat;
        let lon = location.lon ? location.lon : location.center.lon;
        return [radius, lat, lon]
    }
    let radius = 250;
    let lat = 41.636946;
    let lon = 41.609722;
    return [radius, lat, lon]
}

function getPOIs(radius, lat, lon, poiKey, poiValue) {
    // If no entries, get from OSM
    let query = `https://overpass-api.de/api/interpreter?data=
        [out:json][timeout:25];
        (
        node(around: ${radius}, ${lat}, ${lon})[${poiKey}=${poiValue}];
        way(around: ${radius}, ${lat}, ${lon})[${poiKey}=${poiValue}];
        rel(around: ${radius}, ${lat}, ${lon})[${poiKey}=${poiValue}];
        );
        out center;`

    let POIs = axios.get(query)
        .then(res => {
            return res.data.elements
        })
        .catch(err => console.log(err))

    return POIs
}


function decideNextLocation(POIs) {
    // Fetch POIs from MongoDB
    // Make decision about next location
    let index = Math.floor(Math.random() * POIs.length)
    let POI = POIs[index]

    // Check if it's been there before, remove and redo if yes

    return [index, POI]
}

function savePOIs(POIs, nextLocation, indexNextLocation) {
    // Delete nextLocation from POIs
    POIs[indexNextLocation] = POIs[POIs.length - 1]
    POIs.pop()

    // Save [1] POIs and [2] nextLocation to MongoDB
    currentLocation.push(nextLocation)
}

async function movementCycle() {
    const [poiKey, poiValue] = getQueryTerms()
    const [radius, lat, lon] = getCurrentLocation()
    const POIs = await getPOIs(radius, lat, lon, poiKey, poiValue)
        .then(POIs => {
            return POIs
        })
        .catch(err => console.log(err))
    let [indexNextLocation, nextLocation] = decideNextLocation(POIs)
    savePOIs(POIs, nextLocation, indexNextLocation)

    return nextLocation
}



app.get("/", (req, res) => {
    setInterval(async () => {
        const nextLocation = await movementCycle()
            .then(location => {
                return location
            })
            .catch(err => console.log(err))
        console.log(nextLocation.id)
    }, 5000)
    res.send("test")
});


app.listen(PORT, () => {
    console.log(`Server listening at :${PORT}`);
});