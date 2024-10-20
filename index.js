const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const app = express();
const PORT = 4000;
const { mongoUrl } = require('./keys');

// Import models
require('./models/User');
require('./models/Volunteer');
require('./models/Doner');

// Import middleware and routes
const requireToken = require('./middleware/requireToken');
const authRoutes = require('./routes/authRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes'); 
const donerRoutes = require('./routes/donerRoutes'); 

app.use(bodyParser.json());

// Use routes
app.use(authRoutes);
app.use(volunteerRoutes); 
app.use(donerRoutes); 

app.get('/', requireToken, (req, res) => {
    res.send("Your email: " + req.user.email);
});

mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
    console.log("Connected to MongoDB");
});

mongoose.connection.on('error', (err) => {
    console.log("Error connecting to MongoDB", err);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
