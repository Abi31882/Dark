const path = require('path');
const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const productRouter = require('./routes/productRoutes');
const customerRouter = require('./routes/customerRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const categoryRouter = require('./routes/categoryRoutes');
const cartRouter = require('./routes/cartRoutes');

dotenv.config();

const app = express({ path: './config.env' });

app.use(express.json());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log('development');
}

// production logging
if (process.env.NODE_ENV === 'production') {
  // console.log('production');
  console.log('production');
}

app.use(express.json());
// START EXPRESS APP

// 2) Routes
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/customers', customerRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/cart', cartRouter);

// app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`));
});

app.use(globalErrorHandler);

module.exports = app;
