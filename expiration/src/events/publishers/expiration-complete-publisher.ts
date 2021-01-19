import { ExpirationCompleteEvent, Publisher, Subjects } from '@hw_tickets/common'

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete
}