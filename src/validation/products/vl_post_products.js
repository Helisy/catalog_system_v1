module.exports = {
    sku: {
        in: ['body'],
        isString: true,
        isLength: {
            errorMessage: 'SKU must be at least 2 chars long',
            options: { min: 2, max: 128  }
        }
    },
    old_sku: {
        in: ['body'],
        isString: true,
        optional: {
            options: {
             nullable: true,
            }
        },
    },
    description: {
        in: ['body'],
        isString: true,
        optional: {
            options: {
             nullable: true,
            }
        },
        isLength: {
            errorMessage: 'Description must be at least 6 chars long',
            options: { min: 6, max: 256 }
        }
    },
    observation: {
        in: ['body'],
        optional: {
            options: {
             nullable: true,
            }
        },
        isString: true,
        isLength: {
            errorMessage: 'Observation must be at least 6 chars long',
            options: { min: 6, max: 5000 }
        }
    },
    gross_weight: {
        in: ['body'],
        optional: {
            options: {
             nullable: true,
            }
        },
        isFloat: {
            errorMessage: 'Gross weight must be a number'
        }
    },
    net_weight: {
        in: ['body'],
        optional: {
            options: {
             nullable: true,
            }
        },
        isFloat: {
            errorMessage: 'Net weight must be a number',
            options: { min: 1, max: 100000 },
        }
    }
}