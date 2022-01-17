import express from 'express';
import AccountController from '../app/Controllers/accountController';
const { verifyToken } = require('../Middleware/auth.middleware');
const AccountApiRouter = express.Router();

const {
  registerValidationRules,
  loginValidationRules,
  validate,
} = require('../app/Validators/validators');

// Account Signup
AccountApiRouter.post('/account/signup', registerValidationRules(), validate, (req, res) => {
  const accountController = new AccountController(res);
  accountController.registerAccount(req);
});

// Account Signin
AccountApiRouter.post('/account/signin', loginValidationRules(), validate, (req, res) => {
  const accountController = new AccountController(res);
  accountController.loginAccount(req);
});

// Update User Information of Account
AccountApiRouter.patch('/account/update', verifyToken, (req, res) => {
  const accountController = new AccountController(res);
  accountController.updateAccount(req);
});

// follow a creator
AccountApiRouter.put('/follow/:followeeId', verifyToken, (req, res) => {
  const accountController = new AccountController(res);
  accountController.followUnfollowUser(req);
});

// Get the information of Account
AccountApiRouter.get('/account/:id', verifyToken, (req, res) => {
  const accountController = new AccountController(res);
  accountController.getAccount(req);
});

export default AccountApiRouter;
