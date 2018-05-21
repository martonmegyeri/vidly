const { Rental } = require('../../models/rental');
const { Movie } = require('../../models/movie');
const { User } = require('../../models/user');
const request = require('supertest');
const mongoose = require('mongoose');
let server;


describe('/api/returns', () => {
  beforeEach(() => { server = require('../../index'); });
  afterEach( async () => {
    await Rental.remove();
    await Movie.remove();
    await server.close();
  });

  test('should return 401 if client is not logged in', async () => {
    /* const rental = new Rental({
      customer: {
        _id: mongoose.Types.ObjectId().toHexString(),
        name: '12345',
        phone: '12345'
      },
      movie: {
        _id: mongoose.Types.ObjectId().toHexString(),
        title: '12345',
        dailyRentalRate: 2
      }
    }); */
    const customerId = mongoose.Types.ObjectId().toHexString();
    const movieId = mongoose.Types.ObjectId().toHexString();

    const res = await request(server)
      .post('/api/returns')
      .send({ customerId, movieId });

    expect(res.status).toBe(401);
  });

  test('should return 400 if no customerId provided', async () => {
    const token = new User().generateAuthToken();
    const movieId = mongoose.Types.ObjectId().toHexString();

    const res = await request(server)
      .post('/api/returns')
      .set('x-auth-token', token)
      .send({ movieId });

    expect(res.status).toBe(400);
  });

  test('should return 400 if no movieId provided', async () => {
    const token = new User().generateAuthToken();
    const customerId = mongoose.Types.ObjectId().toHexString();

    const res = await request(server)
      .post('/api/returns')
      .set('x-auth-token', token)
      .send({ customerId });

    expect(res.status).toBe(400);
  });

  test('should return 404 if no rental found for this customer/movie', async () => {
    const token = new User().generateAuthToken();
    const customerId = mongoose.Types.ObjectId().toHexString();
    const movieId = mongoose.Types.ObjectId().toHexString();

    const res = await request(server)
      .post('/api/returns')
      .set('x-auth-token', token)
      .send({ customerId, movieId });

    expect(res.status).toBe(404);
  });

  test('should return 400 if return is already processed', async () => {
    const token = new User().generateAuthToken();
    const customerId = mongoose.Types.ObjectId().toHexString();
    const movieId = mongoose.Types.ObjectId().toHexString();

    const rental = new Rental({
      customer: {
        _id: customerId,
        name: '12345',
        phone: '12345'
      },
      movie: {
        _id: movieId,
        title: '12345',
        dailyRentalRate: 2
      },
      dateReturned: new Date(),
      rentalFee: 1
    });
    await rental.save();

    const res = await request(server)
      .post('/api/returns')
      .set('x-auth-token', token)
      .send({ customerId, movieId });

    expect(res.status).toBe(404);
  });

  test('should return 200 if we have a valid request', async () => {
    const token = new User().generateAuthToken();
    const customerId = mongoose.Types.ObjectId().toHexString();
    const movieId = mongoose.Types.ObjectId().toHexString();

    const rental = new Rental({
      customer: {
        _id: customerId,
        name: '12345',
        phone: '12345'
      },
      movie: {
        _id: movieId,
        title: '12345',
        dailyRentalRate: 2
      }
    });
    await rental.save();

    const res = await request(server)
      .post('/api/returns')
      .set('x-auth-token', token)
      .send({ customerId, movieId });

    expect(res.status).toBe(200);
  });

  test('should set the return date if input is valid', async () => {
    const token = new User().generateAuthToken();
    const customerId = mongoose.Types.ObjectId().toHexString();
    const movieId = mongoose.Types.ObjectId().toHexString();

    const rental = new Rental({
      customer: {
        _id: customerId,
        name: '12345',
        phone: '12345'
      },
      movie: {
        _id: movieId,
        title: '12345',
        dailyRentalRate: 2
      }
    });
    await rental.save();

    const res = await request(server)
      .post('/api/returns')
      .set('x-auth-token', token)
      .send({ customerId, movieId });

    const diff = new Date() - new Date(res.body.dateReturned);

    expect(diff).toBeLessThan(10 * 1000);
  });

  test('should set the rental fee if input is valid', async () => {
    const token = new User().generateAuthToken();
    const customerId = mongoose.Types.ObjectId().toHexString();
    const movieId = mongoose.Types.ObjectId().toHexString();

    const rental = new Rental({
      customer: {
        _id: customerId,
        name: '12345',
        phone: '12345'
      },
      movie: {
        _id: movieId,
        title: '12345',
        dailyRentalRate: 2
      },
      dateOut: new Date('2018-05-15')
    });
    await rental.save();

    const res = await request(server)
      .post('/api/returns')
      .set('x-auth-token', token)
      .send({ customerId, movieId });

    expect(res.body.rentalFee).toBe(12);
  });

  test('should increase the movie in stock if input is valid', async () => {
    const token = new User().generateAuthToken();
    const customerId = mongoose.Types.ObjectId().toHexString();

    const movie = new Movie({
      title: '12345',
      genre: { name: '12345' },
      numberInStock: 7,
      dailyRentalRate: 2
    });
    await movie.save();

    const rental = new Rental({
      customer: {
        _id: customerId,
        name: '12345',
        phone: '12345'
      },
      movie: {
        _id: movie._id.toHexString(),
        title: '12345',
        dailyRentalRate: 2
      },
      dateOut: new Date('2018-05-15')
    });
    await rental.save();

    const res = await request(server)
      .post('/api/returns')
      .set('x-auth-token', token)
      .send({ customerId, movieId: movie._id.toHexString() });

    const movieInDb = await Movie.findById(movie._id.toHexString());

    expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
  });

  test('should return the rental if input is valid', async () => {
    const token = new User().generateAuthToken();
    const customerId = mongoose.Types.ObjectId().toHexString();
    const movieId = mongoose.Types.ObjectId().toHexString();

    const rental = new Rental({
      customer: {
        _id: customerId,
        name: '12345',
        phone: '12345'
      },
      movie: {
        _id: movieId,
        title: '12345',
        dailyRentalRate: 2
      },
      dateOut: new Date('2018-05-15')
    });
    await rental.save();

    const res = await request(server)
      .post('/api/returns')
      .set('x-auth-token', token)
      .send({ customerId, movieId });

    expect(res.status).toBe(200);
    expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['dateOut', 'dateReturned', 'rentalFee', 'customer', 'movie']));
  });
});
