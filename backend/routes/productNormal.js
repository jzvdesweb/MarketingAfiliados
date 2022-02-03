const express = require('express')
const router = express.Router();


const {
    getProductsNormal,
    getAdminProductsNormal,
    newProductNormal,
    getSingleProductNormal,
    updateProductNormal,
    deleteProductNormal,
    createProductNormalReview,
    getProductNormalReviews,
    deleteReview

} = require('../controllers/productNormalController')

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');


router.route('/productsn').get(getProductsNormal);
router.route('/admin/productsn').get(getAdminProductsNormal);
router.route('/productn/:id').get(getSingleProductNormal);

router.route('/admin/productn/new').post(isAuthenticatedUser, authorizeRoles('admin'), newProductNormal);

router.route('/admin/productn/:id')
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateProductNormal)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProductNormal);


router.route('/review').put(isAuthenticatedUser, createProductNormalReview)
router.route('/reviews').get(isAuthenticatedUser, getProductNormalReviews)
router.route('/reviews').delete(isAuthenticatedUser, deleteReview)

module.exports = router;