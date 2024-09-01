const express = require("express");
const routes = express();
const UserController = require("../controller/UserController");
const AuthController = require("../controller/AuthController");
const {
  isAuthorized,
  isAuthorizedUser,
} = require("../middleware/authValidationJWT");
const { userValidator } = require("../middleware/validation");

// gets all user data
// routes.get("/", isAuthorized, UserController.getAll);
routes.get("/", UserController.getAll);

// get one user data
routes.get("/:id", UserController.getOne);

// adds balance to user
routes.patch("/add-balance/:id", isAuthorizedUser, UserController.addBalance);

// updates user data
routes.patch(
  "/auth/update/:id",
  isAuthorizedUser,
  userValidator.update,
  UserController.update
);

// updates user data
routes.patch(
  "/auth/update-user-by-admin/:id",
  isAuthorized,
  userValidator.update,
  UserController.updateUserByAdmin
);

// for signing up
// routes.post('/signup', AuthController.signup)

// for logging in
// routes.post('/login', AuthController.login)

module.exports = routes;
