import { TicketCreatedEvent } from '@hw_tickets/common'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../../models/ticket'
import { natsWrapper } from '../../../nats-wrapper'
import { TicketCreatedListener } from '../ticket-created-listener'

const setup = async () => {
  // create a listener instance
  const listener = new TicketCreatedListener(natsWrapper.client)

  // create a fake data
  const data: TicketCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
    userId: new mongoose.Types.ObjectId().toHexString()
  }

  //create a fake message object
  //@ts-ignore
  const msg: Message = {ack: jest.fn()}

  return {listener, data, msg}
}

it('creates and saves a ticket', async () => {
  const { listener, data, msg } = await setup()
  
  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)

  const ticket = await Ticket.findById(data.id)

  expect(ticket).toBeDefined()
  expect(ticket!.title).toEqual(data.title)
  expect(ticket!.price).toEqual(data.price)

})

it('acks the message', async () => {
  const { listener, data, msg } = await setup()

  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})