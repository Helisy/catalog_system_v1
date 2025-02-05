require('dotenv').config();

const express = require('express');
const router = express.Router();

const database = require('../../../database');
const db = database();

const upload = require('../../../upload');

const { buildMySqlFilter, buildMySqlInsert, msySqlUpdateConstructor, checkExistence } = require('../../../utils/SQL_Contructors');
const { apiClientError, apiServerError } = require('../../../utils/api_error_handler');
const { checkSchema, validationResult, param, query, matchedData } = require('express-validator');
const { validateObject } = require('../../../utils/functions');

// const axios = require("axios");   
// const https = require("https");
// axios.defaults.timeout = 30000;
// axios.defaults.httpsAgent = new https.Agent({ keepAlive: true });

router.get('/part-types', async (req, res) => {

    let data = [];
    try {
        const [rows_1] = await db.query(`SELECT id, label FROM part_type where deleted_at is null`);  
        data = rows_1;
    } catch (error) {
        return apiServerError(req, res, error);
    }


    res.status(200).json(
        {
            method: req.method,
            error: false,
            code: 200,
            message: "Success",
            data: data,
        }
    );
});

router.get('/directory-types', async (req, res) => {

    let data = [];
    try {
        const [rows_1] = await db.query(`SELECT id, label FROM directory_type where deleted_at is null`);  
        data = rows_1;
    } catch (error) {
        return apiServerError(req, res, error);
    }


    res.status(200).json(
        {
            method: req.method,
            error: false,
            code: 200,
            message: "Success",
            data: data,
        }
    );
});

const search_query =
[
    "(sku LIKE '%#QUERY_STRING#%' OR old_sku LIKE '%#QUERY_STRING#%' OR description LIKE '%#QUERY_STRING#%')",
    "sku REGEXP '^#QUERY_STRING#' OR old_sku REGEXP '^#QUERY_STRING#' OR description REGEXP '^#QUERY_STRING#'",
    "MATCH (sku,old_sku,description) AGAINST ('#QUERY_STRING#*' IN BOOLEAN MODE)",
];

router.get('/', async (req, res) => {
    let data = [];
    let products = [];

    // let sqlFilter;
    // try {
    //     sqlFilter = buildMySqlFilter(req.query, 'deleted_at is null', ["sku", "old_sku", "description"]);
    // } catch (error) {
    //     return apiClientError(req, res, error, error.message, 400);
    // }

    try {
        if(!req.query.query){
            sqlFilter = buildMySqlFilter(req.query, 'deleted_at is null');
            const [rows_1] = await db.query(`SELECT * FROM products ${sqlFilter}`);
            products = rows_1;
        }else{
            for (const sql of search_query) {
                cur_sql = sql;
                cur_sql = cur_sql.replaceAll("#QUERY_STRING#", req.query.query);

                sqlFilter = buildMySqlFilter(req.query, 'deleted_at is null');
                sqlFilter = sqlFilter.replaceAll("#QUERY#", cur_sql);

                try {
                    const [rows_1] = await db.query(`SELECT * FROM products ${sqlFilter}`);
                    if(rows_1.length > 0){
                        console.log(sqlFilter)
                        products = rows_1;
                        break;
                    }
                } catch (error) {
                    continue;
                }
            }
        }
    } catch (error) {
        return apiServerError(req, res, error);
    }
    
    for (let i = 0; i < products.length; i++) {
        let product = { ...products[i] };

        try {
            const [parts] = await db.query(
                `
                select 
                    parts.id,
                    parts.width,
                    parts.height,
                    parts.depth,
                    parts.part_type_id,
                    part_type.label as part_type,
                    part_type.created_at,
                    part_type.updated_at,
                    part_type.deleted_at
                from 
                parts 
                join part_type on part_type.id = parts.part_type_id
                where 
                    parts.product_id = ? and parts.deleted_at is null;
                `, [product.id]);
                
            const [images] = await db.query('SELECT * FROM images where product_id = ? and deleted_at is null', [product.id]);
    
            const [directories] = await db.query(
                `
                select 
                    directories.id,
                    directories.path,
                    directories.label,
                    directories.directory_type_id,
                    directory_type.label as directory_type,
                    directory_type.created_at,
                    directory_type.updated_at,
                    directory_type.deleted_at
                from directories
                join directory_type on directory_type.id = directories.directory_type_id
                where
                    directories.product_id = ? and 
                    directories.deleted_at is null;
                `, [product.id]);
    
    
            product.parts = parts;
            product.images = images;
            product.directories = directories;
    
            data.push(product);
        } catch (error) {
            return apiServerError(req, res, error);
        }
    }

    res.status(200).json(
        {
            method: req.method,
            error: false,
            code: 200,
            message: "",
            data: data,
        }
    );
});

router.get('/:id', async (req, res) => {
    const id = req.params.id;

    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({
            method: req.method,
            error: true,
            code: 400,
            message: "Incorrect entry.",
            data: result.array()
        })
    }

    let product = {};

    try {

        if(!isNaN(Number(id)) && id !== "" && id !== null){
            const [rows_1] = await db.query(`SELECT * FROM products where deleted_at is null and id = ?`, [id]);
            product = rows_1[0];
        }else{
            const [rows_1] = await db.query(`SELECT * FROM products where deleted_at is null and sku like(?)`, [id + "%"]);
            product = rows_1[0];
        }

        const [parts] = await db.query(
            `
            select 
                parts.id,
                parts.width,
                parts.height,
                parts.depth,
                parts.part_type_id,
                part_type.label as part_type,
                part_type.created_at,
                part_type.updated_at,
                part_type.deleted_at
            from 
            parts 
            join part_type on part_type.id = parts.part_type_id
            where 
                parts.product_id = ? and parts.deleted_at is null;
            `, [product.id]);
            
        const [images] = await db.query('SELECT * FROM images where product_id = ? and deleted_at is null', [product.id]);

        const [directories] = await db.query(
            `
            select 
                directories.id,
                directories.path,
                directories.label,
                directories.directory_type_id,
                directory_type.label as directory_type,
                directory_type.created_at,
                directory_type.updated_at,
                directory_type.deleted_at
            from directories
            join directory_type on directory_type.id = directories.directory_type_id
            where
                directories.product_id = ? and 
                directories.deleted_at is null;
            `, [product.id]);


        product.parts = parts;
        product.images = images;
        product.directories = directories;
    } catch (error) {
        return apiServerError(req, res, error);
    }
    
    res.status(200).json(
        {
            method: req.method,
            error: false,
            code: 200,
            message: "",
            data: product,
        }
    );
});

const postProductsValidation = require("../../../validation/products/vl_post_products"); 
router.post('/', checkSchema(postProductsValidation), async (req, res) => {
    const id = req.params.id;

    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({
            method: req.method,
            error: true,
            code: 400,
            message: "Incorrect entry.",
            data: result.array()
        })
    }

    try {
        await checkExistence([
            {
                id: id,
                table: "products",
                field: "params 'id'"
            },
        ])
    } catch (error) {
        return apiClientError(req, res, error, error.message, 400)
    }

    const validationData = matchedData(req, { locations: ['body'], includeOptionals: true });
    validateObject(req.body, validationData);

    const sql = buildMySqlInsert("products", req.body);

    let data = [];
    try {

        const [rows] = await db.query(`select * from products where sku = ?`, [req.body.sku.trim()]);

        if(rows.length > 0){
            return apiClientError(req, res, [], `O SKU ${req.body.sku} já foi criado.`, 400)
        }
    
        await db.query(sql, Object.values(req.body));
        const [rows_1] = await db.query(`SELECT * FROM products order by id desc limit 1`);  
        data = rows_1[0];
    } catch (error) {
        return apiServerError(req, res, error);
    }

    res.status(201).json(
        {
            method: req.method,
            error: false,
            code: 201,
            message: "Product updated successfully",
            data: data,
        }
    );
});

const putProductsValidation = require("../../../validation/products/vl_put_products"); 
router.put('/:id', checkSchema(putProductsValidation), async (req, res) => {
    const id = req.params.id;

    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({
            method: req.method,
            error: true,
            code: 400,
            message: "Incorrect entry.",
            data: result.array()
        })
    }

    try {
        await checkExistence([
            {
                id: id,
                table: "products",
                field: "params 'id'"
            },
        ])
    } catch (error) {
        return apiClientError(req, res, error, error.message, 400)
    }

    let data = [];

    const validationData = matchedData(req, { locations: ['body'], includeOptionals: true });
    validateObject(req.body, validationData);

    const sqlUpdate = msySqlUpdateConstructor("products", id, req.body);

    try {
        await db.execute(sqlUpdate.sql, sqlUpdate.values);
        let [rows_1] = await db.execute(`select * from products where id = ${id};`);
        data = rows_1;
    } catch (error) {
        return apiServerError(req, res, error)
    }

    res.status(200).json(
        {
            method: req.method,
            error: false,
            code: 200,
            message: "Product updated successfully",
            data: data,
        }
    );
});

router.post('/:id/image', param('id').isInt(), upload.single('file'), async (req, res) => {
    const id = req.params.id;

    if (!req.file) {
        return res.status(400).json({
            method: req.method,
            error: true,
            code: 400,
            message: "No image file uploaded.",
            data: []
        })
    }

    try {
        await checkExistence([
            {
                id: id,
                table: "products",
                field: "params 'id'"
            },
        ])
    } catch (error) {
        return apiClientError(req, res, error, error.message, 400)
    }

    try {
        const [rows_1] = await db.query(`select * from images where product_id = ? and deleted_at is null`, [id]);

       await db.query(`insert into images(product_id, path, is_main) values(?, ?, ?);`, [id, `/public/image_storage/${req.file.filename}`, rows_1.length < 1 ? true : false]);
    } catch (error) {
        return apiServerError(req, res, error);
    }

    res.status(201).json(
        {
            method: req.method,
            error: false,
            code: 201,
            message: "File uploaded successfully",
            data: [],
        }
    );
});

router.put('/:id/image/:image_id', param('id').isInt(), param('image_id').isInt(), async (req, res) => {
    const id = req.params.id;
    const image_id = req.params.image_id;

    try {
        await checkExistence([
            {
                id: id,
                table: "products",
                field: "params 'id'"
            },
            {
                id: image_id,
                table: "images",
                field: "params 'image_id'"
            },
        ])
    } catch (error) {
        return apiClientError(req, res, error, error.message, 400)
    }

    try {
        await db.query(`update images set is_main = 0 where product_id = ?;`, [id]);
        await db.query(`update images set is_main = 1 where product_id = ? and id = ?;`, [id, image_id]);
        
    } catch (error) {
        return apiServerError(req, res, error);
    }

    res.status(200).json(
        {
            method: req.method,
            error: false,
            code: 200,
            message: "File upadted successfully",
            data: [],
        }
    );
});

router.delete('/:id/image/:image_id', param('id').isInt(), param('image_id').isInt(), async (req, res) => {
    const id = req.params.id;
    const image_id = req.params.image_id;

    try {
        await checkExistence([
            {
                id: id,
                table: "products",
                field: "params 'id'"
            },
            {
                id: image_id,
                table: "images",
                field: "params 'image_id'"
            },
        ])
    } catch (error) {
        return apiClientError(req, res, error, error.message, 400)
    }

    try {
        await db.query(`update images set deleted_at = now() where product_id = ? and id = ?`, [id, image_id]);

        const [rows_1] = await db.query(`select * from images where product_id = ? and deleted_at is null and is_main = 1`, [id]);
        if(rows_1.length < 1) {
            await db.query(`update images set is_main = 1 where product_id = ? and deleted_at is null order by id limit 1;`, [id]);
        }

    } catch (error) {
        return apiServerError(req, res, error);
    }

    res.status(200).json(
        {
            method: req.method,
            error: false,
            code: 200,
            message: "File deleted successfully",
            data: [],
        }
    );
});

const postProductsParts = require("../../../validation/products/vl_post_parts"); 
router.post('/:id/parts', param('id').isInt(), checkSchema(postProductsParts), async (req, res) => {
    const id = req.params.id;

    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({
            method: req.method,
            error: true,
            code: 400,
            message: "Incorrect entry.",
            data: result.array()
        })
    }
    const validationData = matchedData(req, { locations: ['body'], includeOptionals: true });
    validateObject(req.body, validationData);

    try {
        await checkExistence([
            {
                id: id,
                table: "products",
                field: "params 'id'"
            },
            {
                id: req.body.part_type_id,
                table: "part_type",
                field: "part_type_id"
            },
        ])
    } catch (error) {
        return apiClientError(req, res, error, error.message, 400)
    }

    const sql = buildMySqlInsert("parts", {...req.body, product_id: id});

    let data = [];
    try {
        await db.query(sql, Object.values({...req.body, product_id: id}));
        const [rows_1] = await db.query(`SELECT * FROM parts order by id desc limit 1`);  
        data = rows_1[0];
    } catch (error) {
        return apiServerError(req, res, error);
    }

    res.status(201).json(
        {
            method: req.method,
            error: false,
            code: 201,
            message: "Part created successfully",
            data: data,
        }
    );
});

router.delete('/:id/parts/:part_id', param('id').isInt(), param('part_id').isInt(), async (req, res) => {
    const id = req.params.id;
    const part_id = req.params.part_id;

    try {
        await checkExistence([
            {
                id: id,
                table: "products",
                field: "params 'id'"
            },
            {
                id: part_id,
                table: "parts",
                field: "params 'part_id'"
            },
        ])
    } catch (error) {
        return apiClientError(req, res, error, error.message, 400)
    }

    try {
        await db.query(`update parts set deleted_at = now() where product_id = ? and id = ?`, [id, part_id]);
    } catch (error) {
        return apiServerError(req, res, error);
    }

    res.status(200).json(
        {
            method: req.method,
            error: false,
            code: 200,
            message: "Part deleted successfully",
            data: [],
        }
    );
});

const postProductsDirectories = require("../../../validation/products/vl_post_directories"); 
router.post('/:id/directories', param('id').isInt(), checkSchema(postProductsDirectories), async (req, res) => {
    const id = req.params.id;

    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({
            method: req.method,
            error: true,
            code: 400,
            message: "Incorrect entry.",
            data: result.array()
        })
    }
    const validationData = matchedData(req, { locations: ['body'], includeOptionals: true });
    validateObject(req.body, validationData);

    try {
        await checkExistence([
            {
                id: id,
                table: "products",
                field: "params 'id'"
            },
            {
                id: req.body.directory_type_id,
                table: "directory_type",
                field: "part_type_id"
            },
        ])
    } catch (error) {
        return apiClientError(req, res, error, error.message, 400)
    }

    const sql = buildMySqlInsert("directories", {...req.body, product_id: id});

    let data = [];
    try {
        await db.query(sql, Object.values({...req.body, product_id: id}));
        const [rows_1] = await db.query(`SELECT * FROM directories order by id desc limit 1`);  
        data = rows_1[0];
    } catch (error) {
        return apiServerError(req, res, error);
    }

    res.status(201).json(
        {
            method: req.method,
            error: false,
            code: 201,
            message: "Directory created successfully",
            data: data,
        }
    );
});

const putProductsDirectories = require("../../../validation/products/vl_put_directories"); 
router.put('/:id/directories/:directory_id', param('id').isInt(), param('directory_id').isInt(), checkSchema(putProductsDirectories), async (req, res) => {
    const id = req.params.id;
    const directory_id = req.params.directory_id;

    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({
            method: req.method,
            error: true,
            code: 400,
            message: "Incorrect entry.",
            data: result.array()
        })
    }

    try {
        await checkExistence([
            {
                id: id,
                table: "products",
                field: "params 'id'"
            },
            {
                id: directory_id,
                table: "directories",
                field: "params 'directory_id'"
            },
        ])
    } catch (error) {
        return apiClientError(req, res, error, error.message, 400)
    }

    let data = [];

    const validationData = matchedData(req, { locations: ['body'], includeOptionals: true });
    validateObject(req.body, validationData);

    const sqlUpdate = msySqlUpdateConstructor("directories", directory_id, req.body);

    try {
        await db.execute(sqlUpdate.sql + ` and product_id = ${id}`, sqlUpdate.values);
        let [rows_1] = await db.execute(`select * from directories where product_id = ${id} and id = ${directory_id};`);
        data = rows_1;
    } catch (error) {
        return apiServerError(req, res, error)
    }

    res.status(200).json(
        {
            method: req.method,
            error: false,
            code: 200,
            message: "Directory updated successfully",
            data: data,
        }
    );
});

router.delete('/:id/directories/:directory_id', param('id').isInt(), param('directory_id').isInt(), async (req, res) => {
    const id = req.params.id;
    const directory_id = req.params.directory_id;

    try {
        await checkExistence([
            {
                id: id,
                table: "products",
                field: "params 'id'"
            },
            {
                id: directory_id,
                table: "directories",
                field: "params 'directory_id'"
            },
        ])
    } catch (error) {
        return apiClientError(req, res, error, error.message, 400)
    }

    try {
        await db.query(`update directories set deleted_at = now() where product_id = ? and id = ?`, [id, directory_id]);
    } catch (error) {
        return apiServerError(req, res, error);
    }

    res.status(200).json(
        {
            method: req.method,
            error: false,
            code: 200,
            message: "Directory deleted successfully",
            data: [],
        }
    );
});

module.exports = router;