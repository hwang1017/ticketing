import { OrderCreatedEvent, Publisher, Subjects } from '@hw_tickets/common'

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated
}
