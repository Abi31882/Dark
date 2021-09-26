const express = require('express');
const cartController = require('../controllers/cartController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .post(authController.restrictTo('customer'), cartController.addToCart)
  .delete(authController.restrictTo('customer'), cartController.deleteFromCart);

router
  .route('/all')
  .get(authController.restrictTo('admin'), cartController.getAllCarts);

// router.route('/').get(cartController.getAllCarts).post(
//   authController.restrictTo('customer'),
//   // cartController.setProductId,
//   cartController.createCart
// );

router.use(cartController.setCustomerId);

router.route('/customer/:customerId').post(
  authController.restrictTo('customer', 'retailor'),

  cartController.createCart
);

router
  .route('/:id')
  .get(cartController.getCart)
  .patch(
    authController.restrictTo('customer', 'admin'),
    cartController.updateCart
  )
  .delete(
    authController.restrictTo('customer', 'admin'),
    cartController.deleteCart
  );

module.exports = router;
