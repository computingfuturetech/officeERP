async function respondSuccess(res, statusCode, message, data, meta) {
  res.status(statusCode).json({
    status: true,
    message,
    data,
    meta,
  });
}

async function respondFailure(res, error) {
  console.error("Error:", error);
  res.status(error.statusCode || 500).json({
    status: false,
    message: error.message || "Something went wrong",
  });
}

module.exports = {
  respondSuccess,
  respondFailure,
};