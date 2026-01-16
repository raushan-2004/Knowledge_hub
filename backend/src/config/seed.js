const User = require('../models/User');
const mongoose = require('mongoose');

const createDefaultAdmin = async () => {
  try {



    const adminEmail = 'admin@knowledgehub.com';
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('✅ Default admin user already exists');
      return;
    }

    // Create default admin user
    const adminUser = new User({
      email: adminEmail,
      password: 'admin123456', // Will be hashed by the pre-save hook
      name: 'Admin User',
      role: 'admin'
    });


     await adminUser.save();
    console.log('✅ Default admin user created:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: admin123456`);
    console.log(`   Role: admin`);
  } catch (error) {
    console.error('❌ Error creating default admin user:', error.message);
  }
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('⏭️  Skipping admin user creation - MongoDB not connected');
      return;
    }

    

   
};

module.exports = { createDefaultAdmin };
