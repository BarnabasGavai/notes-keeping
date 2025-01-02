class ApiError extends Error {
  success = false; // Always false for errors

  constructor(
    statusCode = 500, // Default statusCode to 500 (Server Error)
    message = "Something went wrong",
    errors = [],
    data = null
  ) {
    if (typeof statusCode !== "number") {
      throw new Error("A valid statusCode is required for ApiError");
    }

    if (!Array.isArray(errors)) {
      throw new Error("The 'errors' field must be an array");
    }

    super(message);

    this.statusCode = statusCode;
    this.errors = errors;
    this.data = data;

    Error.captureStackTrace(this, this.constructor);

    Object.freeze(this); // Make the error object immutable
  }
}

export { ApiError };
