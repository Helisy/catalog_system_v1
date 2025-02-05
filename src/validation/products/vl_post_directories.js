module.exports = {
    path: {
        in: ['body'],
        isLength: {
            options: { min: 4, max: 255 },
            errorMessage: 'The value path must be at max 255 characters.',
        },
        custom: {
            options: (field) => { return field.includes("\\") },
            errorMessage: "Field path must be an directory.",
        },
    },
    label: {
        in: ['body'],
        isString: {
            errorMessage: 'Label must be a string',
            options: { min: 1, max: 64 },
        }
    },
    directory_type_id: {
        in: ['body'],
        isInt: {
            errorMessage: 'Part type id must be a number',
            options: { min: 1, max: 10 },
        }
    }
}