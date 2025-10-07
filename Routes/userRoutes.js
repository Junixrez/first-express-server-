const express = require("express");

const router = express.Router();

const {
  updateUser,
  createUser,
  getUserById,
  getAllUsers,
  deleteUser,
} = require("../Controllers/userController");
// get all
router.get("/", getAllUsers);

// get by id
router.get("/:id", getUserById);

// create one
router.post("/", createUser);

// update
router.put("/:id", updateUser);

// delete
router.delete("/:id", deleteUser);

module.exports = router;
