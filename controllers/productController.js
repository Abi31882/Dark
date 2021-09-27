const multer = require('multer');
const sharp = require('sharp');
const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Not an image! Please upload only images of jpg format.',
        400
      ),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadProductImages = upload.fields([
  { name: 'imageFront', maxCount: 1 },
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 5 },
]);

exports.resizeProductImages = catchAsync(async (req, res, next) => {
  // console.log(req.files);

  if (!req.files.imageCover || !req.files.imageFront || !req.files.images)
    return next();

  // 1) Front image
  req.body.imageFront = `product-${req.params.id}-${Date.now()}-front.jpeg`;
  await sharp(req.files.imageFront[0].buffer)
    .resize(150, 150)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/products/${req.body.imageFront}`);

  // 2) cover image
  req.body.imageCover = `product-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(640, 640)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/products/${req.body.imageCover}`);

  // 3) images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `product-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(640, 640)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/products/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

exports.aliasTopProducts = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.setProductCustomerIds = (req, res, next) => {
  if (!req.body.productCategory)
    req.body.productCategory = req.params.categoryId;
  if (!req.body.customer) req.body.customer = req.customer.id;
  next();
};

exports.getAllProducts = factory.getAll(Product);
exports.getProduct = factory.getOne(Product, { path: 'reviews' });
exports.createProduct = factory.createOne(Product);
exports.updateProduct = factory.updateOne(Product);
exports.deleteProduct = factory.deleteOne(Product);

exports.getProductStats = catchAsync(async (req, res, next) => {
  const stats = await Product.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$ratingsQuantity' },
        numProducts: { $sum: 1 },
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

//   const plan = await Product.aggregate([
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
//         numProductsStarts: { $sum: 1 },
//         products: { $push: '$name' },
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
//       $sort: { numProductsStarts: -1 },
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

// exports.getProductsWithin = catchAsync(async (req, res, next) => {
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

//   const products = await Product.find({
//     startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
//   });

//   console.log(distance, lat, lng, unit);

//   res.status(200).json({
//     status: 'success',
//     results: products.length,
//     data: {
//       data: products,
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

//   const distances = await Product.aggregate([
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
