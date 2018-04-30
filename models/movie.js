const { genreSchema } = require('./genre');
const mongoose = require('mongoose');
const Joi = require('joi');


const Movie = mongoose.model('Movie', new mongoose.Schema({
  title: {
    type: String,
    minlength: 5,
    maxlength: 255,
    trim: true,
    required: true
  },
  genre: {
    type: genreSchema,
    required: true
  },
  numberInStock: {
    type: Number,
    min: 0,
    max: 255,
    required: true
  },
  dailyRentalRate: {
    type: Number,
    min: 0,
    max: 255,
    required: true
  }
}));


function validateMovie(movie) {
  const schema = {
    title: Joi.string().min(5).max(255).required(),
    genreId: Joi.objectId().required(),
    numberInStock: Joi.number().min(0).max(255).required(),
    dailyRentalRate: Joi.number().min(0).max(255).required()
  };

  return Joi.validate(movie, schema);
}


module.exports.Movie = Movie;
module.exports.validate = validateMovie;
