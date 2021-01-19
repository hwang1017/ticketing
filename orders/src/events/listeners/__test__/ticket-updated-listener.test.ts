import { TicketUpdatedEvent } from '@hw_tickets/common'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../../models/ticket'
import { natsWrapper } from '../../../nats-wrapper'
import { TicketUpdatedListener } from '../ticket-updated-listener'

const setup = async () => {
  // create a listener instance
  const listener = new TicketUpdatedListener(natsWrapper.client)

  //create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  })

  await ticket.save()

  // create a fake update data
  const data: TicketUpdatedEvent['data'] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: 'football',
    price: 50,
    userId: new mongoose.Types.ObjectId().toHexString()
  }

  //create a fake message object
  //@ts-ignore
  const msg: Message = {ack: jest.fn()}

  return {listener, data, msg, ticket}
}

it('finds, updates and saves a ticket', async () => {
  const { listener, data, msg, ticket } = await setup()
  
  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)

  const updatedTicket = await Ticket.findById(data.id)

  expect(updatedTicket!.title).toEqual(data.title)
  expect(updatedTicket!.version).toEqual(data.version)
  expect(updatedTicket!.price).toEqual(data.price)

})

it('acks the message', async () => {
  const { listener, data, msg } = await setup()

  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})

it('does not call msg.ack() if the event has a bad version number', async () => {
  const { listener, data, msg } = await setup()

  data.version = 10

  try {
    await listener.onMessage(data, msg)
  } catch (err) { }

  expect(msg.ack).not.toHaveBeenCalled()
})