const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Volunteer = mongoose.model('Volunteer');
const Doner = mongoose.model('Doner')
const { jwtkey } = require('../keys');

module.exports = (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).send({ error: "You must be logged in" });
    }

    const token = authorization.replace("Bearer ", "");

    jwt.verify(token, jwtkey, async (err, payload) => {
        if (err) {
            return res.status(401).send({ error: "You must be logged in" });
        }

        const { id, userType } = payload;

        try {
            let user;

            if (userType === 'user') {
                user = await User.findById(id);
            } else if (userType === 'volunteer') {
                user = await Volunteer.findById(id);
            }
            else if (userType === 'doner') {
                user = await Doner.findById(id);
            }

            if (!user) {
                return res.status(404).send({ error: "User not found" });
            }

            req.user = user;
            req.userType = userType;
            next();
        } catch (err) {
            console.error("Error fetching user details:", err);
            return res.status(500).send({ error: "Error fetching user details" });
        }
    });
};
