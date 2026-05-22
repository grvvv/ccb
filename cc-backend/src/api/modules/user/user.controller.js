const User = require('./user.model');
const config = require('@config');

exports.userProfile = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email }).select('-password');
        if (!user) return res.status(401).json({ message: 'Access denied' });
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// admin only
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
        return res.status(500).json({ message: 'Internal server error' });
    }
}

exports.addAddress = async (req, res) => {
    try {
        const { name, phone, address, locality, city, state, pincode, type } = req.body;
        const addressObj = { name, phone, address, locality, city, state, pincode, type };
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                $push: {
                    addresses: addressObj
                }
            },
            {
                new: true,
                runValidators: true
            }
        ).select('-password');

        return res.status(200).json({
            message: 'Address added successfully',
            user
        });

    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        await User.findByIdAndUpdate(
            req.user.id,
            {
                $pull: {
                    addresses: {
                        _id: addressId
                    }
                }
            }
        );
        return res.status(200).json({
            message: 'Address has been removed'
        });
    } catch (err) {
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};