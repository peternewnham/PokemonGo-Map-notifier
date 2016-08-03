// rename this file to config.js and fill in the details

module.exports = {
  // hipchat settings
  room_id: 123,
  token: 'abc',
  // location to base search
  latitude: 51,
  longitude: 0.5,
  // radius to include for notifications in meters
  radius: {
    "Common": 0,
    "Uncommon": 70,
    "Rare": 400,
    "Very Rare": 1000,
    "Ultra Rare": 1000
  },
  map_key: ''
};
