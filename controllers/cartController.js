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
  // let product = [];
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

  cart.product.push(products);
  await cart.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    cart,
  });
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
exports.getCart = factory.getOne(Cart);
exports.createCart = factory.createOne(Cart);
exports.updateCart = factory.updateOne(Cart);
exports.deleteCart = factory.deleteOne(Cart);

// exports.forgotPassword = catchAsync(async (req, res, next) => {
//   //1) get customer based on posted email
//   const customer = await Customer.findOne({ email: req.body.email });
//   if (!customer) {
//     return next(
//       new AppError('there is no customer with this email address', 404)
//     );
//   }

//   // 2) generate the random reset token
//   const resetToken = customer.createPasswordResetToken();
//   await customer.save({ validateBeforeSave: false });

//   // 3) send it to customer's email
//   try {
//     const resetURL = `${req.protocol}://${req.get(
//       'host'
//     )}/api/v1/customers/resetPassword/${resetToken}`;
//     await new Email(customer, resetURL).sendPasswordReset();

//     res.status(200).json({
//       status: 'success',
//       message: 'token sent to email',
//     });
//   } catch (err) {
//     customer.passwordResetToken = undefined;
//     customer.passwordResetExpires = undefined;
//     await customer.save({ validateBeforeSave: false });

//     return next(
//       new AppError('there was an error sending the email, try again later', 500)
//     );
//   }
// });
