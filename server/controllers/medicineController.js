const Medicine = require('../models/Medicine');
const asyncHandler = require('express-async-handler');

// @desc    Get all medicines
// @route   GET /api/medicines
// @access  Private/Admin
const getMedicines = asyncHandler(async (req, res) => {
    const { search, category } = req.query;
    let query = {};
    
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }
    
    if (category && category !== 'all') {
        query.category = category;
    }
    
    const medicines = await Medicine.find(query).sort({ name: 1 });
    res.json(medicines);
});

// @desc    Get medicine by ID
// @route   GET /api/medicines/:id
// @access  Private/Admin
const getMedicineById = asyncHandler(async (req, res) => {
    const medicine = await Medicine.findById(req.params.id);
    
    if (medicine) {
        res.json(medicine);
    } else {
        res.status(404);
        throw new Error('Medicine not found');
    }
});

// @desc    Create a medicine
// @route   POST /api/medicines
// @access  Private/Admin
const createMedicine = asyncHandler(async (req, res) => {
    const { name, description, category, price, stock, expiry, barcode, image } = req.body;
    
    const medicine = new Medicine({
        name,
        description,
        category,
        price,
        stock,
        expiry,
        barcode,
        image,
        createdBy: req.user._id
    });
    
    const createdMedicine = await medicine.save();
    res.status(201).json(createdMedicine);
});

// @desc    Update a medicine
// @route   PUT /api/medicines/:id
// @access  Private/Admin
const updateMedicine = asyncHandler(async (req, res) => {
    const { name, description, category, price, stock, expiry, barcode, image } = req.body;
    
    const medicine = await Medicine.findById(req.params.id);
    
    if (medicine) {
        medicine.name = name || medicine.name;
        medicine.description = description || medicine.description;
        medicine.category = category || medicine.category;
        medicine.price = price || medicine.price;
        medicine.stock = stock || medicine.stock;
        medicine.expiry = expiry || medicine.expiry;
        medicine.barcode = barcode || medicine.barcode;
        medicine.image = image || medicine.image;
        
        const updatedMedicine = await medicine.save();
        res.json(updatedMedicine);
    } else {
        res.status(404);
        throw new Error('Medicine not found');
    }
});

// @desc    Delete a medicine
// @route   DELETE /api/medicines/:id
// @access  Private/Admin
const deleteMedicine = asyncHandler(async (req, res) => {
    const medicine = await Medicine.findById(req.params.id);
    
    if (medicine) {
        await medicine.remove();
        res.json({ message: 'Medicine removed' });
    } else {
        res.status(404);
        throw new Error('Medicine not found');
    }
});

// @desc    Get medicine categories
// @route   GET /api/medicines/categories
// @access  Private/Admin
const getMedicineCategories = asyncHandler(async (req, res) => {
    const categories = await Medicine.distinct('category');
    res.json(categories);
});

// @desc    Get low stock medicines
// @route   GET /api/medicines/low-stock
// @access  Private/Admin
const getLowStockMedicines = asyncHandler(async (req, res) => {
    const threshold = parseInt(req.query.threshold) || 10;
    const medicines = await Medicine.find({ stock: { $lte: threshold } });
    res.json(medicines);
});

// @desc    Import medicines
// @route   POST /api/medicines/import
// @access  Private/Admin
const importMedicines = asyncHandler(async (req, res) => {
    const { medicines } = req.body;
    
    // Add createdBy to each medicine
    const medicinesToImport = medicines.map(medicine => ({
        ...medicine,
        createdBy: req.user._id
    }));
    
    const importedMedicines = await Medicine.insertMany(medicinesToImport);
    
    res.status(201).json({
        importedCount: importedMedicines.length,
        importedMedicines
    });
});

module.exports = {
    getMedicines,
    getMedicineById,
    createMedicine,
    updateMedicine,
    deleteMedicine,
    getMedicineCategories,
    getLowStockMedicines,
    importMedicines
};