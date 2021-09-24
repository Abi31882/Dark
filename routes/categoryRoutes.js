const express = require('express');
const categoryController = require('../controllers/categoryController');
const authController = require('../controllers/authController');
const productRouter = require('./productRoutes');

const router = express.Router();

// router.param('id', categoryController.checkID);

router.use('/:categoryId/products', productRouter);

router
  .route('/top-5-cheap')
  .get(
    categoryController.aliasTopCategories,
    categoryController.getAllCategories
  );

router.route('/category-stats').get(categoryController.getCategoryStats);
// router
//   .route('/monthly-plan/:year')
//   .get(
//     authController.protect,
//     authController.restrictTo('admin', 'lead-guide', 'guide'),
//     categoryController.getMonthlyPlan
//   );

// router
//   .route('/tours-within/:distance/center/:latlng/unit/:unit')
//   .get(categoryController.getToursWithin);
// /tour-distance?distance=233&center=-40,45&unit=mi

// router
//   .route('/distances/:latlng/unit/:unit')
//   .get(categoryController.getDistances);

router
  .route('/')
  .get(categoryController.getAllCategories)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'retailor'),
    categoryController.createCategory
  );
router
  .route('/:id')
  .get(categoryController.getCategory)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'retailor'),
    categoryController.uploadCategoryImages,
    categoryController.resizeCategoryImages,
    categoryController.updateCategory
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'retailor'),
    categoryController.deleteCategory
  );

module.exports = router;
