module.exports = {
    width: {
        in: ['body'],
        isFloat: {
            errorMessage: 'Width must be a number',
            options: { min: 1, max: 100000 },
        }
    },
    height: {
        in: ['body'],
        isFloat: {
            errorMessage: 'Height must be a number',
            options: { min: 1, max: 100000 },
        }
    },
    depth: {
        in: ['body'],
        isFloat: {
            errorMessage: 'Depth must be a number',
            options: { min: 1, max: 100000 },
        }
    },
    part_type_id: {
        in: ['body'],
        isInt: {
            errorMessage: 'Part type id must be a number',
            options: { min: 1, max: 10 },
        }
    },
}