import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../../app'
import { Order, OrderStatus } from '../../models/order'
import { Payment } from '../../models/payment'
import { stripe } from '../../stripe'



// jest.mock('../../stripe')


it('return 404 whe pay for an order does not exsit', async () => [
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup())
    .send({
      token: 'asd',
      orderId: mongoose.Types.ObjectId().toHexString()
    })
    .expect(404)
])


it('return 401 when apy for an order does not belong to the current user', async () => {
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: mongoose.Types.ObjectId().toHexString(),
    price: 50,
    version: 0,
    status: OrderStatus.Created
  })

  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup())
    .send({
      token: 'asd',
      orderId: order.id
    })
    .expect(401)
})

it('return 400 when pay for a cancelled order', async () => {
  const userId = mongoose.Types.ObjectId().toHexString()

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId,
    price: 50,
    version: 0,
    status: OrderStatus.Cancelled
  })

  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup(userId))
    .send({
      token: 'asd',
      orderId: order.id
    })
    .expect(400)

})


it('return 201 with valid inputs', async () => {
  const userId = mongoose.Types.ObjectId().toHexString()

  const price = Math.floor(Math.random() * 100000)

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId,
    price,
    version: 0,
    status: OrderStatus.Created
  })

  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id
    })
    .expect(201)
  
  // ===== realistic test : connect with stripe api =====

  // retrieve 10 most recent charges from stripe api
  const { data } = await stripe.charges.list({ limit: 10 })

  const testCharge = data.find(charge => {
    return charge.amount === price * 100
  })



  expect(testCharge).toBeDefined()
  expect(testCharge!.currency).toEqual('usd')
  
  // ===== local test : not connect with stripe api =====
  // const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0]

  // expect(chargeOptions.source).toEqual('tok_visa')
  // expect(chargeOptions.amount).toEqual(50 * 100)
  // expect(chargeOptions.currency).toEqual('usd')

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: testCharge!.id
  })

  expect(payment).not.toBeNull()

})