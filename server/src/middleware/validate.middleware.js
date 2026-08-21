const { error } = require('../utils/apiResponse');

/**
 * Validates req.body against a Zod schema.
 * Usage: validate(myZodSchema)
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return error(res, 'Validation failed', 422, errors);
    }
    req.body = result.data;
    next();
  };
}

module.exports = validate;
