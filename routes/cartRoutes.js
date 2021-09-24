const express = require('express');
const cartController = require('../controllers/cartController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(cartController.getAllCarts)
  .post(
    authController.restrictTo('customer'),
    cartController.setProductId,
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
