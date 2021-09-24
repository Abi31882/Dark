const Cart = require('../models/cartModel');
// const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.setProductId = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  next();
};

exports.getAllCarts = factory.getAll(Cart);
exports.getCart = factory.getOne(Cart);
exports.createCart = factory.createOne(Cart);
exports.updateCart = factory.updateOne(Cart);
exports.deleteCart = factory.deleteOne(Cart);
