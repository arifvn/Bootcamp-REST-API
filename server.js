require('colors');
const dotenv = require('dotenv');
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const connectToDB = require('./src/config/db');
const bootcamps = require('./src/routes/bootcamps');
const courses = require('./src/routes/courses');
const auth = require('./src/routes/auth');
const users = require('./src/routes/users');
const reviews = require('./src/routes/reviews');
const errorHandler = require('./src/middlewares/errorHandler');

// config
dotenv.config({ path: './src/config/config.env' });
connectToDB();
const app = express();

// Read body/form as json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// FileUpload
app.use(express.static(path.join(__dirname, 'src/public')));
app.use(fileUpload());

// CookieParser
app.use(cookieParser());

// Sanitize req.query, req.params, req.body
app.use(mongoSanitize());

// Add more security headers
app.use(helmet());

// Prevent xss attack
app.use(xss());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Ratelimit
const rateOptions = {
  windowMs: 10 * 60 * 1000,
  max: 100,
  handler: (_, res, __, options) => {
    res.status(options.statusCode).send({
      success: false,
      message:
        'Too many requests created from this IP, please try again after 10 minutes',
    });
  },
};
app.use(rateLimit(rateOptions));

// Enable cors
app.use(cors());

// * Routes
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/auth/users', users);
app.use('/api/v1/reviews', reviews);
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
