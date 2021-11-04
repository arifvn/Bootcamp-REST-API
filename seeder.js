require('colors');
require('dotenv').config({ path: './src/config/config.env' });
require('./src/config/db').connectToDB();

const fs = require('fs');
const Bootcamp = require('./src/models/Bootcamp');
const Course = require('./src/models/Course');
const User = require('./src/models/User');
const Review = require('./src/models/Review');

// load dummy data
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
);
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8')
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8')
);
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8')
);

const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);
    await User.create(users);
    await Review.create(reviews);

    console.log('Data imported ...'.green.inverse);
  } catch (error) {
    console.log('Error Seeder', error.message.red.bold);
  } finally {
    process.exit();
  }
};

const deleteData = async model => {
  try {
    if (model) {
      // eslint-disable-next-line no-eval
      await eval(model).deleteMany();

      console.log(`${model} deleted ...`.red.inverse);
    } else {
      await Bootcamp.deleteMany();
      await Course.deleteMany();
      await User.deleteMany();
      await Review.deleteMany();

      console.log('Data deleted ...'.red.inverse);
    }
  } catch (error) {
    console.log('Error Seeder', error.message.red);
  } finally {
    process.exit();
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  if (process.argv[3]) {
    deleteData(process.argv[3]);
  } else {
    deleteData();
  }
}
