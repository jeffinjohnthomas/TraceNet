const mongoose = require('mongoose');
const Case = require('./models').Case;

const geoMap = {
  'Bangalore Urban': { lat: 12.9716, lng: 77.5946 },
  'Bangalore Rural': { lat: 13.2000, lng: 77.6000 },
  'Mysore': { lat: 12.2958, lng: 76.6394 },
  'Mangalore': { lat: 12.9141, lng: 74.8560 },
  'Hubli-Dharwad': { lat: 15.3647, lng: 75.1240 },
  'Delhi Central': { lat: 28.6139, lng: 77.2090 },
  'Mumbai Metropolitan': { lat: 19.0760, lng: 72.8777 },
  'Chennai': { lat: 13.0827, lng: 80.2707 }
};

mongoose.connect('mongodb://localhost:27017/cis_db')
  .then(async () => {
    const cases = await Case.find({ latitude: null });
    let updated = 0;
    for (let c of cases) {
      if (geoMap[c.location]) {
        c.latitude = geoMap[c.location].lat + (Math.random() - 0.5) * 0.05;
        c.longitude = geoMap[c.location].lng + (Math.random() - 0.5) * 0.05;
        await c.save();
        updated++;
      }
    }
    console.log(`Updated ${updated} legacy cases with missing coordinates.`);
    process.exit(0);
  }).catch(console.error);
