const express = require('express');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');
const cartRouter = require('./cartRoutes');

const router = express.Router({ mergeParams: true });

router.use('/:productId/cart', cartRouter);

router.use('/:productId/reviews', reviewRouter);

router.route('/top-5-cheap').get(productController.getAllProducts);

router.route('/product-stats').get(productController.getProductStats);

router
  .route('/')
  .get(productController.getAllProducts)
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
