const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        enum: [
            'pain-relief',
            'antibiotics',
            'allergy',
            'digestive',
            'respiratory',
            'cardiovascular',
            'other'
        ],
        default: 'other'
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
        min: [0, 'Price must be at least 0']
    },
    stock: {
        type: Number,
        required: [true, 'Please add stock quantity'],
        min: [0, 'Stock cannot be negative']
    },
    expiry: {
        type: Date,
        required: [true, 'Please add an expiry date']
    },
    barcode: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    image: {
        type: String,
        default: 'https://via.placeholder.com/150'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Ensure barcode is unique if provided
medicineSchema.index({ barcode: 1 }, { unique: true, sparse: true });

// Add text index for search
medicineSchema.index({ 
    name: 'text', 
    description: 'text' 
});

module.exports = mongoose.model('Medicine', medicineSchema);