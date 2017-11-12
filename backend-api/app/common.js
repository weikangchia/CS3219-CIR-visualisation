module.exports = {
  errorResponse: {
    invalidField: {
      error: {
        code: 400,
        message: "Missing field/invalid field."
      }
    },
    invalidDomain: {
      error: {
        code: 400,
        message: "Invalid domain."
      }
    }
  }
};
