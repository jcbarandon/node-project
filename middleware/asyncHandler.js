// Wraps an async route handler so rejected promises are forwarded to Express's
// error handler instead of becoming unhandled rejections (Express 4 does not
// catch async errors automatically).
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
