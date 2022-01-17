import express from 'express';
import PostController from '../app/Controllers/postController';
const { verifyToken } = require('../Middleware/auth.middleware');
const PostApiRouter = express.Router();

// Create a Post
PostApiRouter.post('/post', verifyToken, (req, res) => {
  const postController = new PostController(res);
  postController.createPost(req);
});

// Get a post by id
PostApiRouter.get('/posts/:id', verifyToken, (req, res) => {
  const postController = new PostController(res);
  postController.getPostDetails(req);
});

// Get all posts of registered user
PostApiRouter.get('/all-posts', verifyToken, (req, res) => {
  const postController = new PostController(res);
  postController.getAllPosts(req);
});


// Delete a post
PostApiRouter.delete('/post/:id', verifyToken, (req, res) => {
  const postController = new PostController(res);
  postController.deletePost(req);
});

// Like a post
PostApiRouter.post('/like/:id', verifyToken, (req, res) => {
  const postController = new PostController(res);
  postController.likePost(req);
});

// Unlike a post
PostApiRouter.post('/unlike/:id', verifyToken, (req, res) => {
  const postController = new PostController(res);
  postController.unlikePost(req);
});

// Comment on a post
PostApiRouter.post('/comment/:id', verifyToken, (req, res) => {
  const postController = new PostController(res);
  postController.commentPost(req);
});

export default PostApiRouter;
