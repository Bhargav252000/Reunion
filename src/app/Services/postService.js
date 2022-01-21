import AccountRepository from '../Repository/accountRepository.js';
import PostRepository from '../Repository/postRepository.js';
import * as Exceptions from '../Exceptions/Exceptions';

export default class PostService {
  constructor() {
    this.accountRepository = new AccountRepository();
    this.postRepository = new PostRepository();
  }

  /**
   * This method is used to create a new post
   */
  async addPost(userId, body) {
    // get the user by userId
    const user = await this.accountRepository.getUserById(userId);

    if (!user) {
      throw new Exceptions.NotFoundException('User not found');
    }

    // create a new post
    const post = await this.postRepository.createPost(user, body);

    return post;
  }

  /**
   * This method is to delete the post having id as `id`
   */
  async deletePost(request) {
    const { userId } = request.user;
    const { id } = request.params;

    // get the user by userId
    const user = await this.accountRepository.getUserById(userId);

    if (!user) {
      throw new Exceptions.NotFoundException('User not found');
    }

    // get the post by id
    const post = await this.postRepository.getPostById(id);

    if (!post) {
      throw new Exceptions.NotFoundException('Post not found');
    }

    // check if the user is the owner of the post
    if (user.id !== post.userId) {
      throw new Exceptions.UnauthorizedException('You are not authorized to delete this post');
    }

    // delete the post
    const response = await this.postRepository.deletePost(post);

    if (!response) {
      throw new Exceptions.NotFoundException('Post not deleted');
    }

    return {
      success: true,
      message: 'Post deleted successfully',
    };
  }

  /**
   * This method is used to like a post
   */
  async likePost(request) {
    const { userId } = request.user;
    const { id } = request.params;

    // get the user by userId
    const user = await this.accountRepository.getUserById(userId);

    if (!user) {
      throw new Exceptions.NotFoundException('User not found');
    }

    // get the post by id
    const post = await this.postRepository.getPostById(id);

    // check if the user already liked the post
    const isLiked = await this.postRepository.isLiked(user, post);

    // console.log("isLiked:", isLiked);

    if (isLiked) {
      throw new Exceptions.ForbiddenException('You have already liked this post');
    }

    // like the post
    const response = await this.postRepository.addLike(user, post);
    // console.log("response: ", response);

    if (!response) {
      throw new Exceptions.GeneralException('Error while Liking the post');
    }

    return {
      success: true,
      message: `You liked the post with id: ${post.id}`,
    };
  }

  /**
   * This method is used to unlike a post
   */
  async unlikePost(request) {
    const { userId } = request.user;
    const { id } = request.params;

    // get the user by userId
    const user = await this.accountRepository.getUserById(userId);

    if (!user) {
      throw new Exceptions.NotFoundException('User not found');
    }

    // get the post by id
    const post = await this.postRepository.getPostById(id);

    // check if the user already liked the post
    const isLiked = await this.postRepository.isLiked(user, post);

    if (!isLiked) {
      throw new Exceptions.ForbiddenException('You have not liked this post');
    }

    // unlike the post
    const response = await this.postRepository.deleteLike(user, post);

    if (!response) {
      throw new Exceptions.GeneralException('Error while unliking the post');
    }

    return {
      success: true,
      message: `You unliked the post with id: ${post.id}`,
    };
  }

  async commentPost(request) {
    const { userId } = request.user;
    const { id } = request.params;

    // get the user by userId
    const user = await this.accountRepository.getUserById(userId);
    if (!user) {
      throw new Exceptions.NotFoundException('User not found');
    }
    // get the post by id
    const post = await this.postRepository.getPostById(id);
    if (!post) {
      throw new Exceptions.NotFoundException('Post not found');
    }

    // comment on the post
    const response = await this.postRepository.addComment(user, post, request.body);

    if (!response) {
      throw new Exceptions.GeneralException('Error while commenting the post');
    }

    return {
      success: true,
      message: `You commented on the post with id: ${post.id}`,
      commentId: response.id,
    };
  }

  async getPostDetails(request) {
    const { id } = request.params;

    const details = await this.postRepository.getPostDetails(id);

    const { comments, likes, title, description, createdAt } = details;

    if (!details) {
      throw new Exceptions.NotFoundException('Post not found/No details found');
    }

    return details;
  }

  async getAllPosts(request) {
    const { userId } = request.user;

    const posts = await this.postRepository.getAllPosts(userId);

    if (!posts) {
      throw new Exceptions.NotFoundException('No posts found');
    }

    return posts;
  }
}
