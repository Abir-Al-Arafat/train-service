const express = require("express");
const routes = express();
const ProductController = require("../controller/ProductController");
const StationController = require("../controller/StationController");
const { productValidator } = require("../middleware/validation");
const {
  commonValidator,
  stationValidator,
} = require("../middleware/validation");

// const createValidation = require("../middleware/validation");
// const createValidationPartial = require("../middleware/validationPartial");

const { isAuthorized } = require("../middleware/authValidationJWT");

// routes.get("/getall", ProductController.getAllProducts);

// gets all data
routes.get("/all", StationController.getAll);

// get one data
// routes.get("/:id", productValidator.delete, ProductController.getOne);
routes.get("/:id", commonValidator.mongoId, StationController.getOne);

// deletes
routes.delete(
  "/:id",
  // isAuthorized,
  commonValidator.mongoId,
  StationController.delete
);

// add
routes.post(
  "/add",
  // isAuthorized,
  stationValidator.create,
  StationController.addOne
);

// partial update
routes.patch(
  "/:id",
  // isAuthorized,
  stationValidator.update,
  StationController.update
);

// update
// routes.put('/:id', createValidation, ProductController.update)

module.exports = routes;
