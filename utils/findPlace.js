const { Client } = require('@googlemaps/google-maps-services-js')
const { GOOGLE_MAPS_API_KEY } = require('../config/secret')

const client = new Client({})

async function findPlace(item) {
  const obj = {
    params: {
      input: item.name,
      inputtype: 'textquery',
      language: 'zh-TW',
      fields: ['place_id', 'formatted_address', 'name', 'geometry'],
      key: GOOGLE_MAPS_API_KEY
    }
  }

  try {
    const result = await client.findPlaceFromText(obj)
    if (result.data.candidates && result.data.candidates.length) {
      const { place_id, formatted_address, name, geometry } = result.data.candidates[0]
      item.place_id = place_id
      item.address = formatted_address
      item.name = name
      item.lat = geometry.location.lat
      item.lng = geometry.location.lng
    } else {
      item.isDelete = true
    }
  } catch (err) {
    console.log('findPlace err', err)
    throw err
  }
}

module.exports = findPlace
