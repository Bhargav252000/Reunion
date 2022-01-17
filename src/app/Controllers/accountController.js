import Controller from './controller';
import * as Exceptions from '../Exceptions/Exceptions';
import AccountService from '../Services/accountService';

export default class AccountController extends Controller {
  constructor(response) {
    super(response);
    this.accountService = new AccountService();
  }

  /**
   * method to register a new user
   * @param {object} request
   * @returns {object}
   */
  async registerAccount(request) {
    const args = request.body;
    try {
      const addUser = await this.accountService.addAccount(args);

      if (!addUser) {
        this.handleException('User already exists');
      } else {
        this.sendResponse(addUser);
      }
    } catch (error) {
      this.handleException(error);
    }
  }

  async loginAccount(request) {
    const args = request.body;
    try {
      const addUser = await this.accountService.loginAccount(args);

      if (!addUser) {
        this.handleException('User does not exist');
      } else {
        this.sendResponseWithHeaders(addUser);
      }
    } catch (error) {
      this.handleException(error);
    }
  }

  //TODO: the account must contain all the information of followers and followings
  async getAccount(request) {
    const { id } = request.params;
    try {
      const user = await this.accountService.getAccount(id);

      if (!user) {
        this.handleException('User does not exist');
      }
      this.sendResponse(user);
    } catch (error) {
      this.handleException(error);
    }
  }

  async updateAccount(request) {
    const { userId } = request.user;
    try {
      const res = await this.accountService.updateAccount(userId, request.body);
      if (!res) {
        throw new Exceptions.NotFoundException('User does not exist/does not be updated');
      }
      this.sendResponse(res);
    } catch (error) {
      this.handleException(error);
    }
  }

  async followUnfollowUser(request) {
    const { userId } = request.user;
    const { followeeId } = request.params;
    try {
      const res = await this.accountService.followUnfollowUser(userId, followeeId);

      if (!res) {
        this.handleException('Cannot follow user/Internal Error');
      }

      this.sendResponse(res);
    } catch (error) {
      this.handleException(error);
    }
  }
}
