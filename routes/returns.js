const Joi = require('joi');
const { Rental } = require('../models/rental');
const { Movie } = require('../models/movie');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();


router.post('/', auth, async (req, res) => {
  const { error } = validateReturn(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let rental = await Rental.findOne({
    'customer._id': req.body.customerId,
    'movie._id': req.body.movieId
  });

  if (!rental) res.status(404).send('No rental found with the given customerId/movieId');

  if (rental.dateReturned) res.status(404).send('Rental is already processed');

  // Set dateReturned and rentalFee
  rental.return();
  rental = await rental.save();

  // Increase the movie in stock
  /* const movie = await Movie.findById(rental.movie._id);
  if (movie) {
    movie.numberInStock = movie.numberInStock + 1;
    await movie.save();
  } */

  await Movie.update({ _id: rental.movie._id }, {
    $inc: { numberInStock: 1 }
  });

  res.send(rental);
});


function validateReturn(rental) {
  const schema = {
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required()
  };

  return Joi.validate(rental, schema);
}


module.exports = router;
