require('colors');
require('dotenv').config({ path: './src/config/config.env' });
require('./src/config/db').connectToDB();

const fs = require('fs');
const Bootcamp = require('./src/models/Bootcamp');
const Course = require('./src/models/Course');

// load dummy data
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
);
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8')
);

const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);

    console.log('Data imported ...'.green.inverse);
  } catch (error) {
    console.log('Error Seeder', error.message.red.bold);
  } finally {
    process.exit();
  }
};

const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();

    console.log('Data deleted ...'.red.inverse);
  } catch (error) {
    console.log('Error Seeder', error.message.red);
  } finally {
    process.exit();
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
