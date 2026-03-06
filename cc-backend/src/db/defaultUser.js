const bcrypt = require('bcrypt');
const User = require('@api/modules/user/user.model.js');
const config = require('../config');


async function createUser() {
  try {
    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
      console.log('✅ Admin user already exists. Skipping admin creation.');
      return;
    }

    const hashedPassword = await bcrypt.hash(config.admin.password, config.bcrypt.saltRounds);

    const user = new User({
      name: 'CC Admin',
      email: config.admin.email,
      password: hashedPassword,
      role: "admin",
      phone: config.admin.phone
    });

    await user.save();
    console.log('✅ User created successfully:', user.email);
  } catch (err) {
    console.error('Error:', err);
  }
}

module.exports = createUser;