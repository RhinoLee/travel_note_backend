const fs = require('fs')

function getRandomRange(min, max) {
  return Math.random() * (max - min) + min
}

function createRandomPlaces() {
  return {
    lat: getRandomRange(24.5, 25.1),
    lng: getRandomRange(121.0, 121.5)
  }
}

function createRandomPlacesJSON() {
  const data = []
  for (let i = 0; i < 60000; i++) {
    data.push(createRandomPlaces())
  }

  fs.writeFileSync('../files/coordinates.json', JSON.stringify(data, null, 2))
}

createRandomPlacesJSON()
