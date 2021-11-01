const NodeGeocoder = require('node-geocoder');

const getLocation = async address => {
  const options = {
    provider: process.env.GEOCODER_PROVIDER,
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null,
  };

  const geocoder = NodeGeocoder(options);
  const location = await geocoder.geocode(address, { limit: 1 });

  return location[0];
};

module.exports = getLocation;
