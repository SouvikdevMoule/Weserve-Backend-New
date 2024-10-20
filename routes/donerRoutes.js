const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');
const { jwtkey } = require('../keys');
const requireToken = require('../middleware/requireToken');
const router = express.Router();
const Doner = mongoose.model('Doner')

router.post('/doner/signup', async (req, res) => {
    const { email, password, address, type, company } = req.body;

    if ( !email || !password || !address || !company || !type ){
        return res.status(422).send({ error: "All fields are required"});
    }

    try {
        const doner = new Doner({ email, password, address, company, type  });
        await doner.save();
        const token = jwt.sign({ donerId : doner._id }, jwtkey);
        res.status(200).send({ token, donerId: doner._id});

    } catch (err) {
        return res.status(422).send({ error: err.messasge });
    }

});

router.get('/doner/:id', requireToken, async (req, res) => {
    const { id } = req.params;

    try {
        const doner = await Doner.findById(id);
        if (!doner) {
            return res.status(404).send({ error: "Doner not found." });
        }
        console.log(doner)
        res.status(200).send(doner);
    } catch (err) {
        console.error("err", err);
        res.status(500).send({ error: "An error occurred while fetching the volunteer." });
    }
});

module.exports = router