import { PaymentCreatedEvent, Publisher, Subjects } from '@hw_tickets/common'

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated
}