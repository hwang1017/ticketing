import { OrderCreatedEvent, OrderStatus } from '@hw_tickets/common'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../../models/ticket'
import { natsWrapper } from '../../../nats-wrapper'
import { OrderCreatedListener } from '../order-created-listener'

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client)

  // create and save a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 99,
    userId: mongoose.Types.ObjectId().toHexString(),
  })

  await ticket.save()

  // create a fake event
  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: mongoose.Types.ObjectId().toHexString(),
    expireAt: '',
    status: OrderStatus.Created,
    ticket: {
        id: ticket.id,
        price: ticket.price
    }
  }

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return {listener, data, msg}
}


it('sets the orderId of the ticket', async () => {
  const { listener, data, msg} = await setup()
  
  await listener.onMessage(data, msg)

  const ticket = await Ticket.findById(data.ticket.id)

  expect(ticket!.orderId).toEqual(data.id)
})

it('msg.ack() is called', async () => {
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)
  expect(msg.ack).toHaveBeenCalled()
})


it('publishes a ticket updated event', async () => {
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)
  expect(natsWrapper.client.publish).toHaveBeenCalled()

  const ticketupdatedData =
    JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
  
  expect(data.id).toEqual(ticketupdatedData.orderId)
})