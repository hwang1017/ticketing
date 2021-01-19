import { Publisher, Subjects, TicketUpdatedEvent } from '@hw_tickets/common'

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated
}


