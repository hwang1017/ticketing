import { OrderStatus } from '@hw_tickets/common'
import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../../app'
import { Order } from '../../models/order'
import { Ticket } from '../../models/ticket'
import { natsWrapper } from '../../nats-wrapper'


it('marks an order as cancelled', async () => {
  // create a ticket
  const ticket = Ticket.build({
    title: 'football',
    price: 20,
    id: mongoose.Types.ObjectId().toHexString()
  })

  await ticket.save()

  // make a request to build an order with this ticket
  const user = global.signup()

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201)
  
  //make request to fetch the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204)
  
  const updatedOrder = await Order.findById(order.id)

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('publish an order cancelled event', async () => {
  // create a ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'football',
    price: 20
  })

  await ticket.save()

  // make a request to build an order with this ticket
  const user = global.signup()

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201)
  
  //make request to fetch the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204)
  
  expect(natsWrapper.client.publish).toHaveBeenCalled()
})