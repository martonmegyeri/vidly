const { Customer, validate } = require('../models/customer');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();


router.get('/', async (req, res) => {
  const customers = await Customer.find().sort('name');
  res.send(customers);
});


router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) res.status(400).send(error.details[0].message);

  let customer = new Customer({
    name: req.body.name,
    isGold: req.body.isGold,
    phone: req.body.phone
  });
  customer = await customer.save();
  res.send(customer);
});


router.put('/:id', auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) res.status(400).send(error.details[0].message);

  const customer = Customer.findByIdAndUpdate(req.params.id, {
    name: req.body.name,
    isGold: req.body.isGold,
    phone: req.body.phone
  }, { new: true });

  if (!customer) return res.status(404).send('The user with the given id is not found');

  res.send(customer);
});


router.delete('/:id', auth, async (req, res) => {
  const customer = await Customer.findByIdAndRemove(req.params.id);

  if (!customer) return res.status(404).send('The user with the given id is not found');

  res.send(customer);
});


router.get('/:id', async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) return res.status(404).send('The user with the given id is not found');

  res.send(customer);
});


module.exports = router;
