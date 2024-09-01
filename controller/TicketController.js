const HTTP_STATUS = require("../constants/statusCodes");
const { validationResult } = require("express-validator");
const { success, failure } = require("../utilities/common");
const StationModel = require("../model/StationModel");
const TicketModel = require("../model/TicketModel");
const TrainModel = require("../model/TrainModel");

class TicketController {
  async getAll(req, res) {
    try {
      const { sortParam, sortOrder, search, name, page, limit } = req.query;
      if (page < 1 || limit < 0) {
        return res
          .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
          .send(failure("Page and limit values must be at least 1"));
      }
      if (
        (sortOrder && !sortParam) ||
        (!sortOrder && sortParam) ||
        (sortParam && sortParam !== "name") ||
        (sortOrder && sortOrder !== "asc" && sortOrder !== "desc")
      ) {
        return res
          .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
          .send(failure("Invalid sort parameters provided"));
      }
      const filter = {};

      if (name) {
        filter.name = { $regex: name, $options: "i" };
      }
      if (search) {
        filter["$or"] = [
          { name: { $regex: search, $options: "i" } },
          { author: { $regex: search, $options: "i" } },
        ];
      }
      console.log(filter.$or);
      // console.log(typeof Object.keys(JSON.parse(JSON.stringify(filter)))[0]);
      const stationCount = await StationModel.find({}).count();
      const stations = await StationModel.find(filter)
        .sort({
          [sortParam]: sortOrder === "asc" ? 1 : -1,
        })
        .skip((page - 1) * limit)
        .limit(limit ? limit : 10);
      // console.log(products)
      if (stations.length === 0) {
        return res.status(HTTP_STATUS.NOT_FOUND).send(
          success("No stations were found", {
            total: stationCount,
            totalPages: null,
            count: 0,
            page: 0,
            limit: 0,
            stations: [],
          })
        );
      }

      console.log(stations);

      return res.status(HTTP_STATUS.OK).send(
        success("Successfully got all stations", {
          total: stationCount,
          totalPages: limit ? Math.ceil(stationCount / limit) : null,
          count: stations.length,
          page: parseInt(page),
          limit: parseInt(limit),
          stations: stations,
        })
      );
    } catch (error) {
      console.log(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }

  // gets only one product
  async getOne(req, res) {
    try {
      const validation = validationResult(req).array();
      console.log(validation);
      if (validation.length > 0) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Failed to get the station", validation[0].msg));
      }

      const { id } = req.params;

      const station = await StationModel.find({ _id: id });
      console.log("station", station);
      if (station.length) {
        return res.status(HTTP_STATUS.OK).send(station[0]);
      } else {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(failure("Failed to get the station", "Station not found"));
      }
    } catch (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).send(`internal server error`);
    }
  }

  // adds
  async addOne(req, res) {
    try {
      //   const validation = validationResult(req).array();
      //   // console.log(validation);
      //   if (validation.length > 0) {
      //     return res
      //       .status(HTTP_STATUS.NOT_ACCEPTABLE)
      //       .send(failure("Failed to add station", validation[0].msg));
      //   }
      const { trainId, originStationId, destinationStationId, fare, qty } =
        req.body;
      const train = await TrainModel.findById(trainId);
      if (!train) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Train not found"));
      }

      const originStation = await StationModel.findById(originStationId);
      const destinationStation = await StationModel.findById(
        destinationStationId
      );
      if (!originStation || !destinationStation) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Origin or destination station not found"));
      }
      const originStop = train.stops.find(
        (stop) => stop.station._id.toString() === originStationId
      );
      const destinationStop = train.stops.find(
        (stop) => stop.station._id.toString() === destinationStationId
      );

      if (!originStop || !destinationStop) {
        return res.status(400).json({
          message: "One or both stations not part of the train route",
        });
      }

      // Calculate the duration between the origin and destination
      const durationInMilliseconds =
        destinationStop.arrivalTime - originStop.departureTime;
      const durationInHours = durationInMilliseconds / (1000 * 60 * 60); // Convert milliseconds to hours

      // Define a rate per hour (this is an example, you can define your own rate)
      const ratePerHour = 10; // Example rate: $10 per hour

      // Calculate the fare based on the duration and rate
      const fareBasedOnDuration = durationInHours * ratePerHour;
      const ticket = new TicketModel({
        name: `${train.name} ticket`,
        train: train._id,
        origin: originStation._id,
        destination: destinationStation._id,
        fare: fare ? fare : fareBasedOnDuration,
        qty,
      });

      // Save the ticket to the database
      await ticket.save();

      return res
        .status(HTTP_STATUS.CREATED)
        .send(success("ticket Added Successfully", ticket));
    } catch (error) {
      console.log(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }

  async delete(req, res) {
    try {
      const validation = validationResult(req).array();
      // console.log(validation);
      if (validation.length > 0) {
        return res
          .status(HTTP_STATUS.OK)
          .send(failure("Failed to delete station", validation[0].msg));
      }
      const stationId = req.params.id;
      console.log("stationId", stationId);
      // Find the item by ID and delete it
      const deletedStation = await StationModel.findByIdAndDelete(stationId);
      console.log("deleted item", deletedStation);

      if (!deletedStation) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Station not found" });
      }

      return res
        .status(HTTP_STATUS.ACCEPTED)
        .send(success("Station deleted successfully", deletedStation));
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }

  // updates
  async update(req, res) {
    try {
      const stationId = req.params.id;
      const updatedStationData = req.body;

      const validation = validationResult(req).array();

      if (validation.length > 0) {
        return res
          .status(HTTP_STATUS.OK)
          .send(failure("Failed to update station data", validation[0].msg));
      }

      const updatedStation = await StationModel.findByIdAndUpdate(
        stationId,
        updatedStationData,
        // Returns the updated document
        { new: true }
      );

      if (!updatedStation) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "station not found" });
      }
      console.log(updatedStation);

      return res
        .status(HTTP_STATUS.ACCEPTED)
        .send(success("Station updated successfully", updatedStation));
    } catch (error) {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "INTERNAL SERVER ERROR" });
    }
  }
}

const ticketController = new TicketController();

module.exports = ticketController;
