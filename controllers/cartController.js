const Cart = require('../models/cartModel');
// const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Product = require('../models/productModel');

exports.setCustomerId = (req, res, next) => {
  if (!req.body.customer) req.body.customer = req.customer.id;
  next();
};

exports.addToCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findById(req.params.cartId);
  const products = await Product.findById(req.params.productId);
  if (!cart) {
    return next(
      new AppError(
        'Sorry, there is no cart created, please create a cart first',
        404
      )
    );
  }

  if (!products) {
    return next(
      new AppError(
        'Sorry, there is no such product, please specify correctly',
        404
      )
    );
  }

  const product = cart.product.map((el) => el.id === req.params.productId);

  if (product) {
    return next(
      new AppError(
        'this product is already in the cart, please increase the quantity manually',
        404
      )
    );
  }

  res.status(200).json({
    status: 'success',
    results: cart.product.length,
    data: cart,
  });
});

exports.updateQuantity = catchAsync(async (req, res, next) => {
  const cart = await Cart.findById(req.params.cartId);

  if (!cart) {
    return next(new AppError('there is no cart', 404));
  }

  const product = cart.product.map((el) => el.id === req.params.productId);

  if (!product) {
    return next(
      new AppError(
        'Sorry, there is no such product, please specify correctly',
        404
      )
    );
  }

  if (product) {
    product.quantity = req.body.quantity;

    await cart.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      data: {
        quantity: product.quantity,
      },
    });
  } else {
    next();
  }
});

exports.deleteFromCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findById(req.params.cartId);
  const products = await Product.findById(req.params.productId);

  const index = cart.product.indexOf(products);

  if (products) {
    cart.product.splice(index, 1);
  }

  await cart.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    cart,
  });
});

exports.getAllCarts = factory.getAll(Cart);
exports.createCart = factory.createOne(Cart);
exports.updateCart = factory.updateOne(Cart);
exports.deleteCart = factory.deleteOne(Cart);

exports.getCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findById(req.params.id);

  if (!cart) {
    return next(new AppError('No Cart found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    results: cart.product.length,
    data: {
      data: cart,
    },
  });
});
