const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const volunteerSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true,
    },
    lname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
});
volunteerSchema.pre('save', function (next) {
    const volunteer = this;
    if (!volunteer.isModified('password')) {
        return next();
    }

    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            return next(err);
        }

        bcrypt.hash(volunteer.password, salt, (err, hash) => {
            if (err) {
                return next(err);
            }

            volunteer.password = hash;
            next();
        });
    });
});

volunteerSchema.methods.comparePassword = function (candidatePassword) {
    const volunteer = this;

    return new Promise((resolve, reject) => {
        bcrypt.compare(candidatePassword, volunteer.password, (err, isMatch) => {
            if (err) {
                return reject(err);
            }

            if (!isMatch) {
                return reject(false);
            }

            resolve(true);
        });
    });
};

mongoose.model('Volunteer', volunteerSchema);