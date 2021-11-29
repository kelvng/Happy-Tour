const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('./../utils/email');
const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');
exports.getOverview = catchAsync(async (req, res) => {
  // 1) get tour data
  const tours = await Tour.find();

  // 2) render
  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) get data , the request tour (include rv and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }

  // 2) render template
  res.status(200).render('tour', {
    title: `${tour.name}`,
    tour,
  });
});

exports.getLogin = (req, res) => {
  res.status(200).render('login', {
    title: 'Login into your account',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // // 2) Find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('mytours', {
    title: 'My Tours',
    tours,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updateUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render('account', {
    title: 'Your account',
    user: updateUser,
  });
});

exports.getSignUpForm = (req, res, next) => {
  res.status(200).render('signup', {
    title: 'Sign Up',
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  if (req.body.password !== req.body.passwordConfirm)
    return next(new AppError('Password is incorrect', 400));
  else if (await User.findOne({ email: req.body.email }))
    return next(new AppError('Email is already in use', 400));
  else {
    const newUser = await User.create({ ...req.body });

    res.redirect('/login');
    const url = `${req.protocol}://${req.get('host')}/me`;
    console.log(url);
    await new Email(newUser, url).sendWelcome();
  }
});

// [GET] /create-reviews
exports.getCreateReviewForm = catchAsync(async (req, res, next) => {
  res.render('review', {
    title: 'Create Review',
    bookingId: req.params.bookingId,
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.bookingId);
  if (!tour) {
    return res.status(404).json({
      message: 'Error, NOT FOUND',
    });
  }
  await Review.create({
    tour: req.params.bookingId,
    user: req.user.id,
    review: req.body.review,
    rating: req.body.rating,
  });
  res.redirect('/my-tours');
});
