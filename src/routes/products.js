require('dotenv').config();

const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    res.render("products/search.ejs");
});

router.get('/:id', async (req, res) => {
    res.render("products/products.ejs");
});

module.exports = router;