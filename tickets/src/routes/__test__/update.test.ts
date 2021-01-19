import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../../app'
import { Ticket } from '../../models/ticket'
import { natsWrapper } from '../../nats-wrapper'


it('return a 404 if the provided id does not exist', async () => {
  const fakeId = new mongoose.Types.ObjectId().toHexString()

  await request(app)
    .put(`/api/tickets/${fakeId}`)
    .set('Cookie', global.signup())
    .send({
      title: 'aaa',
      price: 20
    })
    .expect(404)
})

it('return a 401 if the user is not authenticated', async () => {
  const fakeId = new mongoose.Types.ObjectId().toHexString()
  
  await request(app)
    .put(`/api/tickets/${fakeId}`)
    .send({
      title: 'aaa',
      price: 20
    })
    .expect(401)
})

it('return a 401 if the user does not own the ticket', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signup())
    .send({
      title: 'aaa',
      price: 20
    })
  
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signup())
    .send({
      title: 'bbb',
      price: 30
    })
    .expect(401)
})

it('return a 400 if the user provided an invalid title or price', async () => {
  const cookie = global.signup()

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'aaa',
      price: 20
    })
  
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 10
    })
    .expect(400)
  
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'aaa',
      price: -10
    })
    .expect(400)
})

it('updates the ticket provided valid inputs', async () => {
  const cookie = global.signup()

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'aaa',
      price: 20
    })
  
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'bbb',
      price: 100
    })
    .expect(200)
  
  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
  
  expect(ticketResponse.body.title).toEqual('bbb')
  expect(ticketResponse.body.price).toEqual(100)
})

it('publishes an event', async () => {
  const cookie = global.signup()

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'aaa',
      price: 20
    })
  
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'bbb',
      price: 100
    })
    .expect(200)
  
  expect(natsWrapper.client.publish).toHaveBeenCalled()
})

it('rejects updates if the ticket is reserved', async () => {
  const cookie = global.signup()

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'aaa',
      price: 20
    })
  
  const ticket = await Ticket.findById(response.body.id)
  ticket?.set({ orderId: mongoose.Types.ObjectId().toHexString() })
  await ticket!.save()


  
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'bbb',
      price: 100
    })
    .expect(400)
})