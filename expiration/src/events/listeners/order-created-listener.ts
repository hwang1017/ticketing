import { Listener, OrderCreatedEvent, Subjects } from '@hw_tickets/common';
import { Message } from 'node-nats-streaming';
import { expirationQueue } from '../../queues/expiration-queue';
import { queueGroupName } from './queue-group-name';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated
  queueGroupName = queueGroupName

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {

    const delay = new Date(data.expireAt).getTime() - new Date().getTime()
    console.log('*** You can hold the ticket for: ', delay, ' milliseconds ***')

    await expirationQueue.add({
      orderId: data.id
    }, {
      delay, 
    })

    msg.ack()
  }
}