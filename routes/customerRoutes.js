const express = require('express');
const customerController = require('../controllers/customerController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// protect all routes after this middleware
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', customerController.getMe, customerController.getCustomer);
router.patch(
  '/updateMe',
  customerController.uploadCustomerPhoto,
  customerController.resizeCustomerPhoto,
  customerController.updateMe
);
router.delete('/deleteMe', customerController.deleteMe);

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(customerController.getAllCustomers)
  .post(customerController.createCustomer);

router
  .route('/:id')
  .get(customerController.getCustomer)
  .patch(customerController.updateCustomer)
  .delete(customerController.deleteCustomer);

module.exports = router;

//   .post(customerController.createCustomer);
