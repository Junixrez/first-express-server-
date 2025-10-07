const express = require("express");
const router = express.Router();

const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} = require("../Controllers/postController");

// Get all posts
router.get("/", getAllPosts);

// Get single post by ID
router.get("/:id", getPostById);

// Create a post
router.post("/", createPost);

// Update post
router.put("/:id", updatePost);

// Delete post
router.delete("/:id", deletePost);

module.exports = router;
