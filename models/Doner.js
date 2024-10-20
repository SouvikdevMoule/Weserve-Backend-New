const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const donerSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    company: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    }
});
donerSchema.pre('save', function (next) {
    const doner = this;
    if (!doner.isModified('password')) {
        return next();
    }

    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            return next(err);
        }

        bcrypt.hash(doner.password, salt, (err, hash) => {
            if (err) {
                return next(err);
            }

            doner.password = hash;
            next();
        });
    });
});

donerSchema.methods.comparePassword = function (candidatePassword) {
    const doner = this;

    return new Promise((resolve, reject) => {
        bcrypt.compare(candidatePassword, doner.password, (err, isMatch) => {
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

mongoose.model('Doner', donerSchema);