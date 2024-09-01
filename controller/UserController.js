const { success, failure } = require("../utilities/common");
const { validationResult } = require("express-validator");
const HTTP_STATUS = require("../constants/statusCodes");
const UserModel = require("../model/UserModel");
const AuthModel = require("../model/AuthModel");
const WalletModel = require("../model/WalletModel");

class UserController {
  async getAll(request, response) {
    let user;
    try {
      user = await UserModel.find({}).select("-__v");

      // console.log(transaction[0].products);
      if (user) {
        return response.status(HTTP_STATUS.OK).send(
          success("Successfully received all users", {
            result: user,
          })
        );
      } else {
        return response
          .status(HTTP_STATUS.OK)
          .send("data could not be fetched");
      }
    } catch (error) {
      return response.status(400).send(`internal server error`);
    }
  }

  // gets only one product
  async getOne(req, res) {
    try {
      const { id } = req.params;

      const user = await UserModel.find({ _id: id });

      if (user) {
        return res.status(HTTP_STATUS.OK).send(user[0]);
      } else {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(`failed to recieve product`);
      }
    } catch (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).send(`internal server error`);
    }
  }

  // updates
  async update(req, res) {
    try {
      const validation = validationResult(req).array();

      if (validation.length > 0) {
        return res
          .status(HTTP_STATUS.OK)
          .send(failure("Failed to update data", validation[0].msg));
      }

      const authId = req.params.id;
      const userAuth = await AuthModel.find({ _id: authId }).populate("user");
      const userId = userAuth[0].user._id;
      console.log("user id", userId);

      const updatedUserData = req.body;

      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        updatedUserData,
        // Returns the updated document
        { new: true }
      );

      if (!updatedUser) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "User not found" });
      }
      console.log(updatedUser);
      updatedUser.__v = undefined;
      return res
        .status(HTTP_STATUS.ACCEPTED)
        .send(success("Product updated successfully", updatedUser));
    } catch (error) {
      console.log(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "INTERNAL SERVER ERROR" });
    }
  }

  // updates
  async updateUserByAdmin(req, res) {
    try {
      const validation = validationResult(req).array();

      if (validation.length > 0) {
        return res
          .status(HTTP_STATUS.OK)
          .send(failure("Failed to update data", validation[0].msg));
      }

      const userId = req.params.id;
      console.log("user id", userId);

      const updatedUserData = req.body;

      console.log("updatedUser", updatedUserData);

      let updatedUser;

      updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        updatedUserData,
        // Returns the updated document
        { new: true }
      );

      if (!updatedUser) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "property cannot be updated" });
      }
      console.log(updatedUser);
      updatedUser.__v = undefined;
      return res
        .status(HTTP_STATUS.ACCEPTED)
        .send(success("user data updated successfully", updatedUser));
    } catch (error) {
      console.log(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "INTERNAL SERVER ERROR" });
    }
  }

  async addBalance(req, res) {
    try {
      const authId = req.params.id;
      const { balance } = req.body;

      const userAuth = await AuthModel.find({ _id: authId }).populate("user");

      if (!userAuth) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("User was not found"));
      }

      const user = await UserModel.findOne({ _id: userAuth[0].user });
      const wallet = await WalletModel.findOne({
        user: userAuth[0].user,
      }).populate("user");

      if (!user) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("User was not found"));
      }

      if (!wallet) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Wallet was not found"));
      }

      wallet.balance += balance;

      const balanceUpdated = await wallet.save();

      if (balanceUpdated) {
        return res
          .status(HTTP_STATUS.OK)
          .send(success("Successfully updated balance!", balanceUpdated));
      }
    } catch (error) {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }
}

module.exports = new UserController();
