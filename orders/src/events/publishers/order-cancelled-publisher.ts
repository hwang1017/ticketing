import { OrderCancelledEvent, Publisher, Subjects } from '@hw_tickets/common'

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled
}