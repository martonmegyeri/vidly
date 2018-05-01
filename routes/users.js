const { User, validate } = require('../models/user');
const _ = require('lodash');
const express = require('express');
const router = express.Router();


router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send('User already registered');

  /* user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  }); */
  user = new User(_.pick(req.body, ['name', 'email', 'password'])); // maybe it's more elegant

  await user.save();

  res.send(_.pick(user, ['_id', 'name', 'email']));
});


module.exports = router;
