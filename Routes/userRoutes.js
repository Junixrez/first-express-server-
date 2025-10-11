const { Router } = require("express");
const {
  getAllUsers,
  getUserById,
  signUp,
  updateUser,
  deleteUser,
  logIn,
} = require("../Controllers/userController");

const validator = require("../middlewares/validator");
const { signUpSchema, loginSchema } = require("../utils/schemas");
const auth = require("../middlewares/auth");
const restrictTo = require("../middlewares/restrictTo");

const router = Router();
// /users

// auth routes

router.post("/signup", validator(signUpSchema), signUp);

router.post("/login", validator(loginSchema), logIn);

// get all users
router.get("/", auth, restrictTo(["admin", "user"]), getAllUsers);

// get user by id
router.get("/:id", getUserById);

// update user
router.patch("/:id", updateUser);

// delete user
router.delete("/:id", deleteUser);

module.exports = router;
