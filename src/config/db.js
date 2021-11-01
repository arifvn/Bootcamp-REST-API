const mongoose = require('mongoose');

const connectToDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`Connected to ${conn.connection.host}`.cyan.bold);
  } catch (error) {
    console.log(`Error Mongodb: ${error}`.red.bold);
  }

  mongoose.connection.on('error', error =>
    console.log(`Error Mongodb: ${error}`.red.bold)
  );

  mongoose.connection.on('disconnected', () =>
    console.log(`Mongodb disconnected`.red.bold)
  );
};

module.exports = { connectToDB };
