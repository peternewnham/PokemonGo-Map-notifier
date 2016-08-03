const request = require('request');


const seen = [];

class HipChatNotifier {

  constructor(config) {
    this.config = config;
  }

  mapThumbnailUrl(key, { center, location }) {
    return [
      'https://maps.googleapis.com/maps/api/staticmap?',
      'size=300x200&',
      `markers=color:red%7C${location.latitude},${location.longitude}&`,
      `markers=icon:http://goo.gl/Nd173t?1%7C${center.latitude},${center.longitude}&`,
      `key=${key}`
    ].join('');
  }

  send(data, details) {

    const { room_id, token, map_key, latitude:center_latitude, longitude:center_longitude } = this.config;
    const {encounter_id, spawnpoint_id, pokemon_id, latitude, longitude, disappear_time} = data;
    const { rarity, distance, name, expiry, key } = details;

    let lozenge, color;
    if (distance < 40) {
      color = 'green';
      lozenge = 'lozenge-success';
    }
    else if (distance < 60) {
      color = 'yellow';
      lozenge = 'lozenge-current';
    }
    else if (distance < 90) {
      color = 'red';
      lozenge = 'lozenge-error';
    }
    else {
      color = 'gray';
      lozenge = 'lozenge';
    }

    const body = {
      color: color,
      message_format: 'html',
      notify: true,
      message: `${distance}m - A wild ${name} appeared! (${rarity})`,
      card: {
        id: key,
        format: 'compact',
        style: 'application',
        title: `A wild ${name} appeared!`,
        url: `https://maps.google.com/maps?q=loc:${latitude},${longitude}`,
        icon: {
          url: `https://wrakky.github.io/pokemon-go-notifier/sprites/${pokemon_id}.png`
        },
        thumbnail: {
          url: this.mapThumbnailUrl(map_key, {
            center: {
              latitude: center_latitude,
              longitude: center_longitude
            },
            location: {
              latitude,
              longitude
            }
          })
        },
        attributes: [
          {
            value: {
              label: `${expiry.fromNow()}`,
            },
            label: 'Despawns'
          },
          {
            value: {
              label: `${distance}m`,
              style: lozenge
            },
            label: 'Distance'
          },
          {
            value: {
              label: `${rarity}`
            },
            label: 'Rarity'
          }
        ]
      }
    };

    if (seen.indexOf(key) === -1) {

      const REQUEST_OPTIONS = {
        uri: `https://api.hipchat.com/v2/room/${room_id}/notification?auth_token=${token}`,
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(body)
      };

      request.post(REQUEST_OPTIONS, (error, response, body) => {
        if (error) {
          console.error('error', error);
        }
        else if (response.statusCode !== 200 && response.statusCode !== 204) {
          console.warn('error', body);
        }
      });

      seen.push(key);

    }

  }

}

module.exports = HipChatNotifier;