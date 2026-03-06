const User = require('./user.model');
const config = require('@config');

exports.userProfile = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email }).select('-password');
    return res.status(200).json({ 
      result: user
    });
  } catch (error) {
    res.status(500).json({message: 'Internal server error'});
  }
};

exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let users = await User.find().skip(skip).limit(limit).select('-password -__v')
   
    const total = await User.countDocuments();
    return res.status(200).json({
      message: 'Successfully fetched users',
      result: users,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    return res.status(500).json({message: 'Internal server error'});
  }
}