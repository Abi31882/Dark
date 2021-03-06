const express = require('express');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');
const cartRouter = require('./cartRoutes');

const router = express.Router({ mergeParams: true });

router.use('/:productId/cart/:cartId', cartRouter);
router.use('/:productId/reviews', reviewRouter);

router
  .route('/top-cheap')
  .get(
    productController.aliasTopProducts,
    productController.getAllProductsByCategory
  );

router
  .route('/')
  .get(productController.getAllProductsByCategory)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'retailor'),
    productController.setProductCustomerIds,
    productController.createProduct
  );
router
  .route('/:id')
  .get(productController.getProduct)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'retailor'),
    productController.uploadProductImages,
    productController.resizeProductImages,
    productController.updateProduct
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'retailor'),
    productController.deleteProduct
  );

module.exports = router;
