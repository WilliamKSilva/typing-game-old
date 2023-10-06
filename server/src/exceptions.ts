

class NotFoundError extends Error {
  public status_code = 404
  constructor() {
    super("Not found")
  }
}

class InternalServerError extends Error {
  public status_code = 500;
  constructor() {
    super("Internal server error");
  }
}

export { InternalServerError, NotFoundError };
