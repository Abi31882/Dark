const multer = require('multer');
const sharp = require('sharp');
const Category = require('../models/categoryModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadCategoryPhoto = upload.single('photo');

exports.resizeCategoryPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `category-${req.customer.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(150, 150)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/categories/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateCategory = catchAsync(async (req, res, next) => {
  // console.log(req.file);
  // console.log(req.body);

  // 1) Create error if customer POSTs password data
  if (req.body.maker) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'maker');
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update customer document
  const updatedCategory = await Category.findByIdAndUpdate(
    req.category.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      category: updatedCategory,
    },
  });
});

exports.setMakerIds = (req, res, next) => {
  if (!req.body.maker) req.body.maker = req.params.Id;
  next();
};

exports.aliasTopCategories = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllCategories = factory.getAll(Category);
exports.getCategory = factory.getOne(Category, {
  path: 'maker',
  select: 'name role',
});
exports.createCategory = factory.createOne(Category);
exports.updateCategory = factory.updateOne(Category);
exports.deleteCategory = factory.deleteOne(Category);

exports.getCategoryStats = catchAsync(async (req, res, next) => {
  const stats = await Category.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$ratingsQuantity' },
        numCategories: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { averagePrice: 1 },
    },
    {
      $match: { _id: { $ne: 'EASY' } },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

// exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
//   const year = req.params.year * 1;

//   const plan = await Category.aggregate([
//     {
//       $unwind: '$startDates',
//     },
//     {
//       $match: {
//         startDates: {
//           $gte: new Date(`${year}-01-01`),
//           $lte: new Date(`${year}-12-31`),
//         },
//       },
//     },
//     {
//       $group: {
//         _id: { $month: '$startDates' },
//         numCategoriesStarts: { $sum: 1 },
//         Categories: { $push: '$name' },
//       },
//     },
//     {
//       $addFields: { month: '$_id' },
//     },
//     {
//       $project: {
//         _id: 0,
//       },
//     },
//     {
//       $sort: { numCategoriesStarts: -1 },
//     },
//     {
//       $limit: 12,
//     },
//   ]);

//   res.status(200).json({
//     status: 'success',
//     data: {
//       plan,
//     },
//   });
// });

// exports.getCategoriesWithin = catchAsync(async (req, res, next) => {
//   const { distance, latlng, unit } = req.params;
//   const [lat, lng] = latlng.split(', ');

//   const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

//   if (!lat || !lng) {
//     next(
//       new AppError(
//         'please provide latitude and longitude in the format lat,lng',
//         400
//       )
//     );
//   }

//   const categories = await Category.find({
//     startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
//   });

//   console.log(distance, lat, lng, unit);

//   res.status(200).json({
//     status: 'success',
//     results: categories.length,
//     data: {
//       data: categories,
//     },
//   });
// });

// 29.033861, 77.678846

// exports.getDistances = catchAsync(async (req, res, next) => {
//   const { latlng, unit } = req.params;
//   const [lat, lng] = latlng.split(', ');

//   const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

//   if (!lat || !lng) {
//     next(
//       new AppError(
//         'please provide latitude and longitude in the format lat,lng',
//         400
//       )
//     );
//   }

//   const distances = await Category.aggregate([
//     {
//       $geoNear: {
//         near: {
//           type: 'Point',
//           coordinates: [lng * 1, lat * 1],
//         },
//         distanceField: 'distance',
//         distanceMultiplier: multiplier,
//       },
//     },
//     {
//       $project: {
//         distance: 1,
//         name: 1,
//       },
//     },
//   ]);

//   res.status(200).json({
//     status: 'success',
//     data: {
//       data: distances,
//     },
//   });
// });
