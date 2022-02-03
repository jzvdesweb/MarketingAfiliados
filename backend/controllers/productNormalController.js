const ProductNormal = require('../models/productNormal')

const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const APIFeatures = require('../utils/apiFeatures');
const cloudinary = require('cloudinary');

// Create new product => /api/v1/admin/product/new
exports.newProductNormal = catchAsyncErrors(async (req, res, next) => {

    let images = []
    if (typeof req.body.images === 'string') {
        images.push(req.body.images)
    } else {
        images = req.body.images
    }

    let imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: 'productsnormal'
        });

        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url
        })
    }

    req.body.images = imagesLinks
    req.body.user = req.user.id;

    const productNormal = await ProductNormal.create(req.body);

    res.status(201).json({
        success: true,
        productNormal
    })
})

// Get all products => /api/v1/products?keyword=apple
exports.getProductsNormal = catchAsyncErrors (async ( req, res, next ) => {
    
    const resPerPage = 10;
    const productsNormalCount = await ProductNormal.countDocuments();

    const apiFeatures = new APIFeatures(ProductNormal.find(), req.query)
    .search()
    .filter()

let productsNormal = await apiFeatures.query;
let filteredProductsNormalCount = productsNormal.length;

apiFeatures.pagination(resPerPage)
productsNormal = await apiFeatures.query.clone();


res.status(200).json({
    success: true,
    productsNormalCount,
    resPerPage,
    filteredProductsNormalCount,
    productsNormal
})
   
})


// Get all products (Admin)  =>   /api/v1/admin/productsn
exports.getAdminProductsNormal = catchAsyncErrors(async (req, res, next) => {

    const productsNormal = await ProductNormal.find();

    res.status(200).json({
        success: true,
        productsNormal
    })

})

// Get single product details => /api/v1/products/:id
exports.getSingleProductNormal = catchAsyncErrors (async ( req, res, next ) => {

    const productNormal = await ProductNormal.findById(req.params.id);

    if ( !productNormal ) {
        return next(new ErrorHandler('ProductNormal not found', 404))
    }

    res.status(200).json({
        success: true,
        productNormal
    })
})

// Update Product => /api/v1/admin/productn/:id
exports.updateProductNormal = catchAsyncErrors(async (req, res, next) => {

    let productNormal = await ProductNormal.findById(req.params.id);

    if (!productNormal) {
        return next(new ErrorHandler('Product Normal not found', 404));
    }

    let images = []
    if (typeof req.body.images === 'string') {
        images.push(req.body.images)
    } else {
        images = req.body.images
    }

    if (images !== undefined) {

        // Deleting images associated with the product
        for (let i = 0; i < productNormal.images.length; i++) {
            const result = await cloudinary.v2.uploader.destroy(productNormal.images[i].public_id)
        }

        let imagesLinks = [];

        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: 'productsNormal'
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url
            })
        }

        req.body.images = imagesLinks

    }



    productNormal = await ProductNormal.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        productNormal
    })

})


// Delete Product => /api/v1/admin/product/:id
exports.deleteProductNormal = catchAsyncErrors(async (req, res, next) => {

    const productNormal = await ProductNormal.findById(req.params.id);

    if (!productNormal) {
        return next(new ErrorHandler('ProductNormal not found', 404));
    }

    // Deleting images associated with the product
    for (let i = 0; i < productNormal.images.length; i++) {
        const result = await cloudinary.v2.uploader.destroy(productNormal.images[i].public_id)
    }

    await productNormal.remove();

    res.status(200).json({
        success: true,
        message: 'Product Normal is deleted.'
    })

})


// Create new review => /api/v1/review
exports.createProductNormalReview = catchAsyncErrors( async (req, res, next) => {

    const { rating, comment, productNormalId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }

    const productNormal = await ProductNormal.findById(productNormalId);

    const isReviewed = productNormal.reviews.find(
        r => r.user.toString() === req.user._id.toString()
    )

    if (isReviewed) {

        productNormal.reviews.forEach(review => {
            if (review.user.toString() === req.user._id.toString()) {
                review.comment = comment;
                review.rating = rating;
            }
        })

    } else {
        productNormal.reviews.push(review);
        productNormal.numOfReviews = productNormal.reviews.length
    }

    productNormal.ratings = productNormal.reviews.reduce((acc, item) => item.rating + acc, 0) / productNormal.reviews.length

    await productNormal.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true
    })

})


// Get product Reviews => /api/v1/reviews
exports.getProductNormalReviews = catchAsyncErrors( async (req, res, next) => {
    const productNormal = await ProductNormal.findById(req.query.id);

    res.status(200).json({
        success: true,
        reviews: productNormal.reviews
    })
})


// Delete product Reviews => /api/v1/reviews
exports.deleteReview = catchAsyncErrors( async (req, res, next) => {
    const productNormal = await ProductNormal.findById(req.query.productNormalId);

    const reviews = productNormal.reviews.filter(review => review._id.toString() !== req.query.id.toString())

    const numOfReviews = reviews.length;

    const ratings = productNormal.reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length

    await ProductNormal.findByIdAndUpdate(req.query.id, {
        reviews,
        ratings,
        numOfReviews
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true
    })
})