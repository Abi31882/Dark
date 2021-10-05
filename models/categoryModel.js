const mongoose = require('mongoose');
const slugify = require('slugify');
// const Customer = require('./customerModel');

const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: [true, 'A category must have a categoryName'],
      unique: true,
      trim: true,
      maxlength: [
        40,
        'A category name can have less or equal to 40 characters',
      ],
      minlength: [
        2,
        'A category must have greater than or equal to 2 characters',
      ],
      // validate: [validator.isAlpha, 'Category name must only contain characters'],
    },
    maker: {
      type: mongoose.Schema.ObjectId,
      ref: 'Customer',
      required: [true, 'it is required'],
    },

    slug: String,
    description: {
      type: String,
      trim: true,
    },
    photo: {
      type: String,
      default: 'defaultCategory.jpg',
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Document Middlewares
categorySchema.pre('save', function (next) {
  this.slug = slugify(this.categoryName, { lower: true });
  next();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
