const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
mongoose.set('strictQuery', false);

// Load environment variables
dotenv.config({ path: './.env' });

// Admin credentials
const adminData = {
  username: 'admin',
  email: 'admin@healthpredict.com',
  password: 'admin123', // Change this in production!
  isAdmin: true
};

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin);
      process.exit(0);
    }

    // Create new admin
    const admin = await User.create(adminData);
    console.log('Admin user created successfully:', {
      username: admin.username,
      email: admin.email,
      isAdmin: admin.isAdmin
    });

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdmin();