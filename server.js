require('colors');
// * Config
require('dotenv').config({ path: './src/config/config.env' });
// * DB
require('./src/config/db').connectToDB();

const express = require('express');
const path = require('path');
const fileUpload = require('express-fileupload');

const bootcamps = require('./src/routes/bootcamps');
const courses = require('./src/routes/courses');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// FileUpload
app.use(express.static(path.join(__dirname, 'src/public')));
app.use(fileUpload());

// * Routes
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);

// * Not found route
app.use('*', (req, res) =>
  res.status(404).json({
    success: false,
    error: `Address with path to ${req.originalUrl} not found`,
  })
);

// * ErrorHandler
app.use(errorHandler);

// * Server
const PORT = process.env.PORT || 5000;
const SERVER = app.listen(PORT, () =>
  console.log(
    `Server running in ${process.env.NODE_ENV} on port ${PORT}`.yellow.bold
  )
);

// * Global Unhandle Error
process.on('unhandledRejection', err => {
  console.log(`Error: ${err.message}`.red.bold);
  SERVER.close(() => process.exit(1));
});
