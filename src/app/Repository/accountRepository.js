const { User, sequelize, Sequelize } = require('../../models');
import jwt from 'jsonwebtoken';
const { Op } = require('sequelize');

export default class AccountRepository {
  /**
   * Add new user to the Database
   * @param {object} user
   * @returns {object} user
   */
  async addUser(obj) {
    const { email, userName, password } = obj;

    const user = User.build({
      email,
      userName,
      password,
    });

    const userDetails = await user.save();
    if (!userDetails) {
      throw new Error('Error while saving user');
    }

    const token = this.generateToken(userDetails);

    return {
      success: true,
      userId: userDetails.id,
      email: userDetails.email,
      token: token,
    };
  }

  generateToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
    };

    /* Generate a Token */
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: '5d',
      },
      { algorithm: 'HS256' }
    );
    return token;
  }

  /**
   * method to update an account
   * @param parameters to update
   * @returns updated account
   */
  async updateUser(updatedUser) {
    const updatedUserDetails = await User.update(
      {
        email: updatedUser.email,
        userName: updatedUser.userName,
        password: updatedUser.password,
      },
      {
        where: {
          id: updatedUser.id,
        },
      }
    );
    if (!updatedUserDetails) {
      throw new Error('Error while updating user');
    }
    return {
      success: true,
      message: 'User updated successfully',
    };
  }

  async getAccountDetails(id) {
    const followeeIdCol = '"following->UserFollow"."followeeId"';
    const followerIdCol = '"follower->UserFollow"."followerId"';
    const userIdCol = '"User"."id"';
    const user = await User.findOne({
      where: {
        id,
      },
      includeIgnoreAttributes : false,
      attributes: [
        'id',
        'userName',
        'email',
        [Sequelize.literal(`COUNT(${followeeIdCol}) OVER (PARTITION BY ${userIdCol}, ${followerIdCol})`), 'followingCount'],
        [Sequelize.literal(`COUNT(${followerIdCol}) OVER (PARTITION BY ${userIdCol}, ${followeeIdCol})`), 'followerCount'],
      ],
      include: [
        {
          model: User,
          as: 'following',
          attributes: ['id', 'userName', 'email'],
          through: {
            attributes: [],
          },
        },
        {
          model: User,
          as: 'follower',
          attributes: ['id', 'userName', 'email'],
          through: {
            attributes: [],
          }
        }
      ],
      // distinct : true,
    });

    return user;
  }

  /**
   * Get user by id
   * @param {string} id
   * @returns {object} user
   */
  async getUserById(id) {
    const user = await User.findOne({
      where: {
        id,
      },
    });
    return user;
  }
  /**
   * Get user by userName
   * @param {string} userName
   * @returns {object} user
   */
  async getUserByUserName(userName) {
    const user = await User.findOne({
      where: {
        userName,
      },
    });
    return user;
  }

  /**
   * Get user by email
   * @param {string} email
   * @returns {object} user
   */
  async getUserByEmail(email) {
    const user = await User.findOne({
      where: {
        email,
      },
    });
    return user;
  }

  /**
   * method to check if user/creator is following a creator
   */
  async isFollowing(followerId, followeeId) {
    const follower = await this.getUserById(followerId);
    const isFollowing = await follower.hasFollowing(followeeId);
    return isFollowing;
  }

  /**
   * follow a creator
   * @param {string} followerId,
   * @param {string} followeeId
   */
  async followUser(followerId, followeeId) {
    const follower = await this.getUserById(followerId);
    const res = await follower.addFollowing(followeeId);
    if (!res) {
      throw new Error('Error while following');
    }
    return res;
  }

  /**
   * unfollow a creator
   * @param {string} followerId,
   * @param {string} followeeId
   */
  async unfollowUser(followerId, followeeId) {
    const follower = await this.getUserById(followerId);
    const res = await follower.removeFollowing(followeeId);
    if (!res) {
      throw new Error('Error while unfollowing');
    }
    return res;
  }
}
