require('dotenv').config();

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.status(400).json(
        {
            method: "GET",
            error: false,
            code: 400,
            message: "API version 1.0.0.",
            data: [],
            // links: [
            // ]
        }
    );
});


// const authRouter = require('./auth.js');
// router.use("/auth", authRouter);

const productsRouter = require('./products.js');
router.use("/products", productsRouter);

module.exports = router;