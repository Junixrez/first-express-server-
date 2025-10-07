const Post = require("../Models/postModel");

// Get all posts
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("userId", "name email");
    res.status(200).json({ status: "success", data: posts });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// get post by ID
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "userId",
      "username email"
    );
    if (!post) {
      return res
        .status(404)
        .json({ status: "fail", message: "Post not found" });
    }
    res.status(200).json({ status: "success", data: post });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// create new post
const createPost = async (req, res) => {
  try {
    const newPost = await Post.create(req.body);
    res.status(201).json({ status: "success", data: newPost });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

// update post by ID
const updatePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!post) {
      return res
        .status(404)
        .json({ status: "fail", message: "Post not found" });
    }
    res.status(200).json({ status: "success", data: post });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

// delete post by ID
const deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res
        .status(404)
        .json({ status: "fail", message: "Post not found" });
    }
    res.status(204).json({ status: "success", data: null });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
};
