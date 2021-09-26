const Cart = require('../models/cartModel');
// const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Product = require('../models/productModel');

exports.setCustomerId = (req, res, next) => {
  if (!req.body.customer) req.body.customer = req.params.customerId;
  next();
};

exports.addToCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findById(req.params.cartId);
  const product = await Product.findById(req.params.productId);
  if (!cart) {
    return next(
      new AppError(
        'Sorry, there is no cart created, please create a cart first',
        404
      )
    );
  }

  if (!product) {
    return next(new AppError('Sorry, we have got nothing to show you', 404));
  }

  cart.product = product;
  await cart.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    cart,
  });
  next();
});

exports.deleteFromCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(new AppError('there is no cart, please create one first', 404));
  }
  if (!req.body.product) req.body.product = req.params.productId;

  cart.product = undefined;
  await cart.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
  });
  next();
});

exports.getAllCarts = factory.getAll(Cart);
exports.getCart = factory.getOne(Cart, { path: 'categories' });
exports.createCart = factory.createOne(Cart);
exports.updateCart = factory.updateOne(Cart);
exports.deleteCart = factory.deleteOne(Cart);
