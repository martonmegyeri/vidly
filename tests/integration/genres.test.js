const request = require('supertest');
const { Genre } = require('../../models/genre');
const { User } = require('../../models/user');
const mongoose = require('mongoose');
let server;


describe('/api/genres', () => {

  beforeEach(() => { server = require('../../index'); });
  afterEach( async () => {
    await Genre.remove();
    await server.close();
  });


  describe('GET /', () => {
    test('should return all genres', async () => {
      await Genre.collection.insertMany([
        { name: 'genre1' },
        { name: 'genre2' }
      ]);

      const res = await request(server).get('/api/genres');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(a => a.name === 'genre1')).toBeTruthy();
      expect(res.body.some(a => a.name === 'genre2')).toBeTruthy();
    });
  });


  describe('GET /:id', () => {
    test('should return a genre with the given id', async () => {
      const genre = new Genre({ name: 'genre1' });
      await genre.save();

      const res = await request(server).get('/api/genres/' + genre._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', genre.name);
    });

    test('should return 404 if an invalid id is given', async () => {
      const res = await request(server).get('/api/genres/1');

      expect(res.status).toBe(404);
    });

    test('should return 404 if the genre  with the given id is not exists', async () => {
      const id = mongoose.Types.ObjectId().toHexString();

      const res = await request(server).get('/api/genres/' + id);

      expect(res.status).toBe(404);
    });
  });


  describe('POST /', () => {
    test('should return 401 if user is not logged in', async () => {
      const res = await request(server)
        .post('/api/genres')
        .send({ name: 'genre1' });

      expect(res.status).toBe(401);
    });

    test('should return 400 if genre is less than 5 characters', async () => {
      const token = new User().generateAuthToken();

      const res = await request(server)
        .post('/api/genres')
        .set('x-auth-token', token)
        .send({ name: '1234' });

      expect(res.status).toBe(400);
    });

    test('should return 400 if genre is more than 50 characters', async () => {
      const token = new User().generateAuthToken();
      const name = new Array(52).join('a');

      const res = await request(server)
        .post('/api/genres')
        .set('x-auth-token', token)
        .send({ name: name });

      expect(res.status).toBe(400);
    });

    test('should save the genre if it is valid', async () => {
      const token = new User().generateAuthToken();

      const res = await request(server)
        .post('/api/genres')
        .set('x-auth-token', token)
        .send({ name: 'genre1' });

      const genre = Genre.find({ name: 'genre1' });

      expect(res.status).toBe(200);
      expect(genre).not.toBeNull();
    });

    test('should return the genre if it is valid', async () => {
      const token = new User().generateAuthToken();

      const res = await request(server)
        .post('/api/genres')
        .set('x-auth-token', token)
        .send({ name: 'genre1' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'genre1');
    });
  });


  describe('PUT /', () => {
    test('should return 400 if the given genre is invalid', async () => {
      const token = new User().generateAuthToken();
      const id = mongoose.Types.ObjectId().toHexString();

      const res = await request(server)
        .put('/api/genres/' + id)
        .set('x-auth-token', token)
        .send({ name: '1234' });

      expect(res.status).toBe(400);
    });

    test('should return 404 if the genre with the given id is not found', async () => {
      const token = new User().generateAuthToken();
      const id = mongoose.Types.ObjectId().toHexString();

      const res = await request(server)
        .put('/api/genres/' + id)
        .set('x-auth-token', token)
        .send({ name: 'genre1' });

      expect(res.status).toBe(404);
    });

    test('should change the given genre\'s name', async () => {
      const genre = new Genre({ name: 'genre1' });
      await genre.save();

      const token = new User().generateAuthToken();

      const res = await request(server)
        .put('/api/genres/' + genre._id)
        .set('x-auth-token', token)
        .send({ name: 'genre2' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id', genre._id.toHexString());
      expect(res.body).toHaveProperty('name', 'genre2');
    });
  });


  describe('DELETE /', () => {
    test('should return 404 if the genre with the given id is not found', async () => {
      const user = new User({
        _id: mongoose.Types.ObjectId(),
        isAdmin: true
      });
      const token = user.generateAuthToken();
      const id = mongoose.Types.ObjectId().toHexString();

      const res = await request(server)
        .delete('/api/genres/' + id)
        .set('x-auth-token', token);

      expect(res.status).toBe(404);
    });

    test('should delete the given genre', async () => {
      const user = new User({
        _id: mongoose.Types.ObjectId(),
        isAdmin: true
      });
      const token = user.generateAuthToken();
      const genre = new Genre({ name: 'genre1' });
      genre.save();

      const res = await request(server)
        .delete('/api/genres/' + genre._id)
        .set('x-auth-token', token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id', genre._id.toHexString());
      expect(res.body).toHaveProperty('name', genre.name);
    });
  });
});
