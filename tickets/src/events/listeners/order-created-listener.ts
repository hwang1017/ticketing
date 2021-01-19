import { Listener, OrderCreatedEvent, Subjects } from '@hw_tickets/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';
import { queueGroupName } from './queue-group-name';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated
  queueGroupName = queueGroupName

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // find the ticket in the order
    const ticket = await Ticket.findById(data.ticket.id)

    // mark the ticket as reserved by settting its orderId props
    if (!ticket) {
      throw new Error('Ticket not found')
    }

    // save the ticket
    ticket.set({ orderId: data.id })
    await ticket.save()

    // publish a order created event to other services
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId,
    })

    //ack the msg
    msg.ack()
  }
}