const Joi = require('joi');
const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  customer: {
    type: new mongoose.Schema({
      name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
      },
      isGold: {
        type: Boolean,
        default: false
      },
      phone: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
      }
    }),
    required: true
  },
  movie: {
    type: new mongoose.Schema({
      title: {
        type: String,
        minlength: 5,
        maxlength: 255,
        trim: true,
        required: true
      },
      dailyRentalRate: {
        type: Number,
        min: 0,
        max: 255,
        required: true
      }
    }),
    required: true
  },
  dateOut: {
    type: Date,
    required: true,
    default: Date.now()
  },
  dateReturned: {
    type: Date
  },
  rentalFee: {
    type: Number,
    min: 0
  }
});


rentalSchema.methods.return = function() {
  this.dateReturned = new Date();

  const rentingDays = Math.ceil((new Date(this.dateReturned) - new Date(this.dateOut)) / 1000 / 60 / 60 / 24);
  this.rentalFee = rentingDays * this.movie.dailyRentalRate;
};


const Rental = mongoose.model('Rental', rentalSchema);


function validateRental(rental) {
  const schema = {
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required()
  };

  return Joi.validate(rental, schema);
}


module.exports.Rental = Rental;
module.exports.validate = validateRental;
