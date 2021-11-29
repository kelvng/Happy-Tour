const express = require('express');
const viewController = require('../controllers/viewController');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
//
router.get(
  '/',
  bookingController.createBookingCheckOut,
  authController.checkLoggedIn,
  viewController.getOverview
);

router.get('/tour/:slug', authController.checkLoggedIn, viewController.getTour);
router.get('/login', authController.checkLoggedIn, viewController.getLogin);
router.get('/signup', viewController.getSignUpForm);
router.post('/signup', viewController.signup);
router.get('/me', authController.protect, viewController.getAccount);

router.get('/my-tours', authController.protect, viewController.getMyTours);

// update in profile
router.post(
  '/submit-user-data',
  authController.protect,
  viewController.updateUserData
);

// Review
// Review
router.get(
  '/create/:bookingId',
  authController.protect,
  authController.restrictTo('user'),
  viewController.getCreateReviewForm
);
router.post(
  '/create/:bookingId',
  authController.protect,
  authController.restrictTo('user'),
  reviewController.setTourAndUserId,
  viewController.createReview
);
module.exports = router;
