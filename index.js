require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require("cookie-parser");

const upload = require('./src/upload');

// const database = require('./src/database');
// const db = database();

const app = express();

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use('/public', express.static('public'));

app.set('view engine', 'ejs');

const PORT = process.env.PORT;
const HOST_IP = process.env.HOST_IP;


// Routers
app.get('/', async (req, res) => {
    res.redirect("/products")
});

app.use("/api", require('./src/routes/api/api'));
app.use("/products", require('./src/routes/products'));


/***/


app.listen(PORT, HOST_IP, () => {
    console.log(`Server listening on ${HOST_IP}:${PORT}.`);
});
