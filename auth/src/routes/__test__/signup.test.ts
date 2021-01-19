import request from 'supertest'
import { app } from '../../app'

it('returns a 201 on successful signup', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: '123456'
    })
    .expect(201)
})


it('returns a 400 with an invalid email', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test.test.com',
      password: '123456'
    })
    .expect(400)
})


it('returns a 400 with an invalid password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: '12'
    })
    .expect(400)
})


it('returns a 400 with missing email and password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: ''
    })
    .expect(400)
  
    await request(app)
    .post('/api/users/signup')
    .send({
      email: '',
      password: '123456'
    })
    .expect(400)
})


it('returns a 400 with an existing email', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: '123456'
    })
    .expect(201)

  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: '123456'
    })
    .expect(400)
})


it('it sets a cookie after successful signup', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: '123456'
    })
    .expect(201)
  
  expect(response.get('Set-Cookie')).toBeDefined()
})


