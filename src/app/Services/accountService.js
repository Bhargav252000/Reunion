import AccountRepository from '../Repository/accountRepository.js';
// import ArticleRepository from '../Repository/articleRepository.js';
import * as Exceptions from '../Exceptions/Exceptions';
import bycrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default class AccountService {
  constructor() {
    // this.articleRepository = new ArticleRepository();
    this.accountRepository = new AccountRepository();
  }

  /**
   * This method is used to create a new account
   * @param {object} args - all the required parameters to create a new account
   * @returns {object} - returns the newly created account
   */
  async addAccount(args) {
    const { email, userName } = args;
    console.log('args: ', args);
    /*
      Check if there is already an account with the same email or same username 
    */

    const verifyUserName = await this.accountRepository.getUserByUserName(userName);
    if (verifyUserName) {
      throw new Exceptions.ConflictException('Username already exist');
    }

    const verifyEmail = await this.accountRepository.getUserByEmail(email);
    if (verifyEmail) {
      throw new Exceptions.ConflictException('Email already exist');
    }
    /*
      Hash the password before saving it to the database
    */
    const salt = await bycrypt.genSalt(10);
    const hashedPassword = await bycrypt.hash(args.password, salt);
    args.password = hashedPassword;
    const resUser = await this.accountRepository.addUser(args);

    return resUser;
  }

  /**
   * This method is to login an existing user
   * @param {object} args - all the required parameters to login an existing user
   * @returns returns the user that has logged in with token
   * @throws throws an error if the user does not exist or password is incorrect
   */
  async loginAccount(args) {
    const { userName } = args;
    const verifyUserByUserName = await this.accountRepository.getUserByUserName(userName);
    const verifyUserByEmail = await this.accountRepository.getUserByEmail(userName);

    if (!verifyUserByUserName && !verifyUserByEmail) {
      throw new Exceptions.NotFoundException('User not found');
    }

    const validUser = verifyUserByUserName || verifyUserByEmail;

    let correctPassword = validUser.password;

    const verifyPassword = await bycrypt.compare(args.password, correctPassword);

    if (!verifyPassword) {
      throw new Exceptions.ValidationException('Password is incorrect');
    }

    const payload = {
      userId: validUser.id,
      email: validUser.email,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: '5d',
      },
      { algorithm: 'HS256' }
    );

    return {
      message: 'Login successful',
      success: true,
      userId: payload.userId,
      email: validUser.email,
      token: token,
    };
  }

  /**
   * method to get the account details by their id
   * @param {string} username - the username of the account
   * @returns {object} account
   */
  async getAccount(id) {
    const account = await this.accountRepository.getAccountDetails(id);

    if (!account) {
      throw new Exceptions.NotFoundException('User not found');
    }

    return account;
    // return {
    //   id: account.id,
    //   email: account.email,
    //   userName: account.userName,
    //   followers: account.follower,
    //   followings: account.following,
    //   followersCount: account.follower.length,
    //   followingsCount: account.following.length,
    // }
  }

  /**
   * method to update the account details
   * @param {object} args - all the required parameters to update the account
   * @returns returns the updated account
   * @throws throws an error if the user does not exist
   */
  async updateAccount(id, args) {
    // Common for both user and creator
    const { userName, password } = args;
    const currentAccount = await this.accountRepository.getUserById(id);
    if (!currentAccount) {
      throw new Exceptions.NotFoundException('User not found');
    }
    // if some account with new userName already exist
    const present = await this.accountRepository.getUserByUserName(userName);

    if (present) {
      throw new Exceptions.ConflictException(
        'This username is already taken, take another username'
      );
    }
    currentAccount.userName = (userName ? userName : currentAccount.userName);
    
    const salt = await bycrypt.genSalt(10);
    const hashedPassword = await bycrypt.hash(password, salt);
    currentAccount.password = (password ? hashedPassword : currentAccount.password);

    // if (userName !== undefined || userName !== null) {
    //   currentAccount.userName = userName;
    // }
    // if (password !== undefined || password !== null) {
    //   const salt = await bycrypt.genSalt(10);
    //   const hashedPassword = await bycrypt.hash(password, salt);
    //   currentAccount.password = hashedPassword;
    // }

    const resUser = await this.accountRepository.updateUser(currentAccount);

    return resUser;
  }

  /**
   * method to follow/unfollow ucreator
   * @param {string} followerId - id of the user who follows/unfollows the creator
   * @param {string} followeeId - id of the creator that is followed/unfollowed
   */
  async followUnfollowUser(followerId, followeeId) {
    const followee = await this.accountRepository.getUserById(followeeId);

    if (followerId === followeeId) {
      throw new Exceptions.NotFoundException('You cannot follow yourself');
    }

    // check if the followerId is already following the followeeId
    const isFollowing = await this.accountRepository.isFollowing(followerId, followeeId);

    if (isFollowing) {
      // unfollow the relationship
      const unfollow = await this.accountRepository.unfollowUser(followerId, followeeId);
      if (!unfollow) {
        throw new Exceptions.GeneralException('Could not unfollow the User');
      }
      return {
        success: true,
        message: `You have unfollowed the User ${followee.userName}`,
      };
    }
    // follow the relationship
    const follow = await this.accountRepository.followUser(followerId, followeeId);

    if (!follow) {
      throw new Exceptions.GeneralException('Could not follow the user');
    }

    return {
      success: true,
      message: `You have followed the user ${followee.userName}`,
    };
  }
}
