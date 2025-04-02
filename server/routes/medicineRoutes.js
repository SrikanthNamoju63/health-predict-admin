const express = require('express');
const router = express.Router();
const {
    getMedicines,
    getMedicineById,
    createMedicine,
    updateMedicine,
    deleteMedicine,
    getMedicineCategories,
    getLowStockMedicines,
    importMedicines
} = require('../controllers/medicineController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
    .get(protect, admin, getMedicines)
    .post(protect, admin, createMedicine);

router.route('/categories')
    .get(protect, admin, getMedicineCategories);

router.route('/low-stock')
    .get(protect, admin, getLowStockMedicines);

router.route('/import')
    .post(protect, admin, importMedicines);

router.route('/:id')
    .get(protect, admin, getMedicineById)
    .put(protect, admin, updateMedicine)
    .delete(protect, admin, deleteMedicine);

module.exports = router;