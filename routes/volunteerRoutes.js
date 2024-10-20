// Backend (Express Router) - Ensure that this is correctly set up
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { jwtkey } = require('../keys');
const requireToken = require('../middleware/requireToken');
const router = express.Router();
const Volunteer = mongoose.model('Volunteer');

// Volunteer Signup Route
router.post('/volunteer/signup', async (req, res) => {
    const { email, password, address, fname, lname } = req.body;

    if (!email || !password || !address || !fname || !lname) {
        return res.status(422).send({ error: "All fields are required" });
    }

    try {
        const volunteer = new Volunteer({ email, password, address, fname, lname });
        await volunteer.save();
        const token = jwt.sign({ volunteerId: volunteer._id }, jwtkey); // Correctly sign the token with volunteerId
        res.status(200).send({ token, volunteerId: volunteer._id}); // Send volunteerId back in response
    } catch (err) {
        return res.status(422).send({ error: err.message });
    }
});

router.get('/volunteer/:id', requireToken, async (req, res) => {
    const { id } = req.params;

    try {
        const volunteer = await Volunteer.findById(id);
        if (!volunteer) {
            return res.status(404).send({ error: "Volunteer not found." });
        }
        console.log(volunteer)
        res.status(200).send(volunteer);
    } catch (err) {
        console.error("err", err);
        res.status(500).send({ error: "An error occurred while fetching the volunteer." });
    }
});

module.exports = router;
