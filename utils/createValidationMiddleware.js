function createValidationMiddleware(schema) {
  return async (ctx, next) => {
    try {
      const validatedBody = await schema.validate(ctx.request.body)
      ctx.request.body = validatedBody
      await next()
    } catch (err) {
      ctx.body = {
        success: false,
        message: err.message
      }
    }
  }
}

module.exports = createValidationMiddleware
