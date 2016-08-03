const express = require('express');
const bodyParser = require("body-parser");
const moment = require('moment');

const calculateDistance = require('./util/distance');
const pokemon_data = require('./data/pokemon.json');
const config = require('./config');

const hipchat = require('./hipchat');
const Hipchat = new hipchat(config);

const app = express();
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

const server = require('http').Server(app);
const port = process.env.PORT || 9876;

server.listen(port, err => {
  console.log('Running server on port ' + port);
});

app.post('/', (req, res) => {

  const {type, message} = req.body;
  const {encounter_id, spawnpoint_id, pokemon_id, latitude, longitude, disappear_time} = message;
  const { rarity, name } = pokemon_data[pokemon_id];
  const radius = config.radius[rarity];
  const distance = calculateDistance(config.latitude, config.longitude, latitude, longitude);

  if (type === 'pokemon' && radius && distance < radius) {
    Hipchat.send(message, {
      distance,
      rarity,
      name,
      expiry: moment(disappear_time * 1000)
    });
    console.log(`Sent notification for ${name} ${rarity} (${distance}m)`);
    res.send(`Sent notification for ${name} ${rarity} (${distance}m)`);
  }
  else {
    console.log(`Sent notification for ${name} ${rarity} (${distance}m)`);
    res.send(`Ignoring ${name} ${rarity} (${distance}m)`);
  }
});