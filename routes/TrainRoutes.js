const express = require("express");
const routes = express();
const TrainController = require("../controller/TrainController");
const {
  commonValidator,
  stationValidator,
} = require("../middleware/validation");

// const createValidation = require("../middleware/validation");
// const createValidationPartial = require("../middleware/validationPartial");

const { isAuthorized } = require("../middleware/authValidationJWT");

// routes.get("/getall", ProductController.getAllProducts);

// gets all data
routes.get("/all", TrainController.getAll);

// get one data
// routes.get("/:id", productValidator.delete, ProductController.getOne);
routes.get("/:id", commonValidator.mongoId, TrainController.getOne);

// deletes
routes.delete(
  "/:id",
  // isAuthorized,
  commonValidator.mongoId,
  TrainController.delete
);

// add
routes.post(
  "/add",
  // isAuthorized,
  //   stationValidator.create,
  TrainController.addOne
);

// partial update
routes.patch(
  "/:id",
  // isAuthorized,
  stationValidator.update,
  TrainController.update
);

// update
// routes.put('/:id', createValidation, ProductController.update)

module.exports = routes;
