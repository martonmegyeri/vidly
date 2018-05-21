const { User } = require('../../../models/user');
const auth = require('../../../middleware/auth');
const mongoose = require('mongoose');


describe('auth middleware', () => {

  test('should populate req.user with the payload of a valid JWT', async () => {
    const user = {
      _id: mongoose.Types.ObjectId().toHexString(),
      isAdmin: false
    };

    const token = new User(user).generateAuthToken();

    const req = {
      header: jest.fn().mockReturnValue(token)
    };
    const res = {};
    const next = jest.fn();

    auth(req, res, next);

    expect(req.user).toMatchObject(user);
  });

});
