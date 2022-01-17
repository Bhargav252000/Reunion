import Controller from './controller';
import * as Exceptions from '../Exceptions/Exceptions';
import PostService from '../Services/postService';

export default class PostController extends Controller {
  constructor(response) {
    super(response);
    this.postService = new PostService();
  }

  /**
   * This method is used to create a new post
   * @param {object} req - the request object
   * @returns {object} - returns the newly created post
   */
  async createPost(request) {
    const { userId } = request.user;

    try {
      const resPost = await this.postService.addPost(userId, request.body);

      if (!resPost) {
        throw new Exceptions.NotFoundException('Post not created');
      }
      this.sendResponse(resPost);
    } catch (error) {
      this.handleException(error);
    }
  }

  async deletePost(request) {
    try {
      const response = await this.postService.deletePost(request);
      // if(!post) {
      //   throw new Exceptions.NotFoundException('Post not deleted');
      // }
      this.sendResponse(response);
    } catch (error) {
      this.handleException(error);
    }
  }

  async likePost(request) {
    try {
      const response = await this.postService.likePost(request);

      this.sendResponse(response);
    } catch (error) {
      this.handleException(error);
    }
  }

  async unlikePost(request) {
    try {
      const response = await this.postService.unlikePost(request);

      this.sendResponse(response);
    } catch (error) {
      this.handleException(error);
    }
  }

  async commentPost(request) {
    try {
      const comment = await this.postService.commentPost(request);

      if (!comment) {
        throw new Exceptions.NotFoundException('Comment not created');
      }
      this.sendResponse(comment);
    } catch (error) {
      this.handleException(error);
    }
  }

  async getPostDetails(request) {
    try {
      const post = await this.postService.getPostDetails(request);

      if (!post) {
        throw new Exceptions.NotFoundException('Post not found');
      }
      this.sendResponse(post);
    } catch (error) {
      this.handleException(error);
    }
  }

  async getAllPosts(request) {
    try {
      const posts = await this.postService.getAllPosts(request);

      if (!posts) {
        throw new Exceptions.NotFoundException('Posts not found');
      }
      this.sendResponse(posts);
    } catch (error) {
      this.handleException(error);
    }
  }
}
