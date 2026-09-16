"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params
            });
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                res.status(400).json({
                    success: false,
                    message: 'Error de validación en los datos enviados',
                    errors: error.errors.map(e => ({
                        field: e.path.join('.').replace('body.', '').replace('query.', '').replace('params.', ''),
                        message: e.message
                    }))
                });
                return;
            }
            res.status(500).json({ success: false, message: 'Error interno de validación' });
        }
    };
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=validate.js.map