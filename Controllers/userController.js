const { isValidObjectId } = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { promisify } = require("util");

const User = require("../Models/userModel");
const CustomError = require("../utils/customError");

const jwtSign = promisify(jwt.sign);

const getAllUsers = async (req, res) => {
  console.log("req.user", req.user);
  const { page, limit } = req.query;

  const skip = (page - 1) * limit;

  const query = { isActive: true };

  const usersPromise = User.find(query, { password: 0 })
    .skip(Number(skip))
    .limit(Number(limit))
    .sort({ createdAt: -1 });
  const totalPromise = User.countDocuments(query);

  const [users, total] = await Promise.all([usersPromise, totalPromise]);

  res.status(200).json({
    status: "success",
    message: "Users fetched successfully",
    data: users,
    pagenation: {
      page: Number(page),
      total,
      totalPages: Math.ceil(total / Number(limit)),
      limit: Number(limit),
    },
  });
};

const getUserById = async (req, res) => {
  const { id } = req.params;

  const user = await User.findOne({ _id: id }, { password: 0 });

  if (!user) {
    throw new CustomError("User not found", 404);
  }
  res.status(200).json({
    status: "success",
    message: "User fetched successfully",
    data: user,
  });
};

const signUp = async (req, res) => {
  const { name, email, password, profilePicture } = req.body;

  // hash password
  const saltRounds = +process.env.SALT_ROUNDS;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const savedUser = newUser.toObject();
  delete savedUser.password;

  res.status(201).json({
    status: "success",
    message: "User created successfully",
    data: savedUser,
  });
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    throw new CustomError("Invalid id", 400);
  }

  const { name, email } = req.body;

  const user = await User.findOneAndUpdate(
    { _id: id },
    { name, email: email },
    {
      new: true,
    }
  );

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  const savedUser = user.toObject();
  delete savedUser.password;

  return res.status(200).json({
    ststus: "success",
    message: "User updated successfully",
    data: savedUser,
  });
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    throw new CustomError("Invalid id", 400);
  }

  const user = await User.findOneAndDelete({ _id: id });

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  return res.status(204).send();
};

const logIn = async (req, res) => {
  const { email, password } = req.body;

  // 1- check user with the given email exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError("Invalid Email and Password combination", 400);
  }
  // 2- compare hashed password from db with the given password
  const isPasswordMached = await bcrypt.compare(password, user.password);

  if (!isPasswordMached) {
    throw new CustomError("Invalid Email and Password combination", 400);
  }
  // 3- matched ? generate JWT token
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };
  const secretKey = process.env.JWT_SECRET_KEY;

  const token = await jwtSign(payload, secretKey, { expiresIn: "1h" });

  return res.status(200).json({
    status: "success",
    message: "User logged in successfully",
    data: { token },
  });
};

module.exports = {
  getAllUsers,
  getUserById,
  signUp,
  updateUser,
  deleteUser,
  logIn,
};
