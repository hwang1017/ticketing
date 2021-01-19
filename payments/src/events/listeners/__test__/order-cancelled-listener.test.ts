import { OrderCancelledEvent, OrderStatus } from '@hw_tickets/common'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Order } from '../../../models/order'
import { natsWrapper } from '../../../nats-wrapper'
import { OrderCancelledListener } from '../order-cancelled-listener'

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client)

  // fake data
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 10,
    status: OrderStatus.Created,
    userId: mongoose.Types.ObjectId().toHexString(),
  })

  await order.save()

  // create a fake event
  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 1,
    ticket: {
        id: mongoose.Types.ObjectId().toHexString(),
    }
  }

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return {listener, data, msg, order}
}


it('updates the status of the order', async () => {
  const { listener, data, msg} = await setup()
  
  await listener.onMessage(data, msg)

  const updatedOrder = await Order.findById(data.id)

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('msg.ack() is called', async () => {
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)
  expect(msg.ack).toHaveBeenCalled()
})