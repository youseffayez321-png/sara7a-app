export const validation = (schema) => {
    return async (req, res, next) => {
        const allErrors = [];

        for (const key of Object.keys(schema)) {
            const { error } = schema[key].validate(req[key], {
                abortEarly: false,
            });

            if (error) {
                error.details.forEach((err) => {
                    allErrors.push({
                        message: err.message,
                        type: err.type,
                        key,
                    });
                });
                return res.status(400).json({ message: "validation error", error:allErrors });
            }
        }
        next()
    };
};
