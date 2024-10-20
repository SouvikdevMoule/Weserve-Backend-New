const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { jwtkey } = require('../keys');
const requireToken = require('../middleware/requireToken');
const router = express.Router();
const User = mongoose.model('User');
const Volunteer = mongoose.model('Volunteer')
const Doner = mongoose.model('Doner')

router.post('/signup', async (req, res) => {
    const { email, password, address, company, type } = req.body;

    if (!email || !password || !address || !company || !type) {
        return res.status(422).send({ error: "All fields are required" });
    }

    try {
        const user = new User({ email, password, address, company, type });
        await user.save();
        const token = jwt.sign({ userId: user._id }, jwtkey);
        res.status(200).send({ token });
    } catch (err) {
        return res.status(422).send({ error: err.message });
    }
});

// router.post('/signin', async (req, res) => {
//     const { email, password } = req.body;

//     if (!email || !password) {
//         return res.status(422).send({ error: "Must provide email and password" });
//     }

//     const user = await User.findOne({ email });

//     if (!user) {
//         return res.status(422).send({ error: "Invalid email or password" });
//     }

//     try {
//         await user.comparePassword(password);
//         const token = jwt.sign({ userId: user._id }, jwtkey);
        
//         // Decode token to verify payload
//         const decoded = jwt.verify(token, jwtkey);
//         console.log('Decoded Token:', decoded);
        
//         res.status(200).send({ token ,decoded });
//     } catch (err) {
//         return res.status(422).send({ error: "Invalid email or password" });
//     }
// });

router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(422).send({ error: "Must provide email and password" });
    }

    try {
        // Try to find and authenticate as a User
        let user = await User.findOne({ email });

        if (user) {
            try {
                await user.comparePassword(password);
                const token = jwt.sign({ id: user._id, userType: 'user' }, jwtkey);

                // Optionally decode token to verify payload
                const decoded = jwt.verify(token, jwtkey);
                console.log('Decoded Token:', decoded);

                return res.status(200).send({ token, userType: decoded.userType, user });
            } catch (err) {
                // Password comparison failed
                return res.status(422).send({error: "Invalid email or password" });
            }
        }

        // Try to find and authenticate as a Volunteer
        let volunteer = await Volunteer.findOne({ email });

        if (volunteer) {
            try {
                await volunteer.comparePassword(password);
                const token = jwt.sign({ id: volunteer._id, userType: 'volunteer' }, jwtkey);

                // Optionally decode token to verify payload
                const decoded = jwt.verify(token, jwtkey);
                console.log('Decoded Token:', decoded);

                return res.status(200).send({ token, userType: decoded.userType, volunteer });
            } catch (err) {
                // Password comparison failed
                return res.status(422).send({ error: "Invalid email or password" });
            }
        }

        //  Try to find and authenticate as a Volunteer
        let doner = await Doner.findOne({ email });

        if (doner) {
            try {
                await doner.comparePassword(password);
                const token = jwt.sign({ id: doner._id, userType: "doner" }, jwtkey);
                
                const decoded = jwt.verify(token, jwtkey);
                console.log('Decoded', decoded);

                return res.status(200).send({ token, userType: decoded.userType, doner });
                
            } catch (error) {
                return res.status(422).send({error: "Invaild email or password" });
            }
        }

        // If no user or volunteer is found
        return res.status(422).send({ error: "Invalid email or password" });
    } catch (err) {
        console.error("Error during sign-in process:", err);
        return res.status(500).send({ error: "Internal server error" });
    }
});


router.get('/user/:userId', requireToken, async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }
        console.log(user);
        res.status(200).send(user);
    } catch (err) {
        console.error("err", err);
        res.status(500).send({ error: "Error fetching user details" });
    }
});

module.exports = router;
