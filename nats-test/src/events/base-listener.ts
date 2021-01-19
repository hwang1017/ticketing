import { Message, Stan } from 'node-nats-streaming'
import { Subjects } from './subjects'

interface Event {
  subject: Subjects,
  data: any
}


export abstract class Listener<T extends Event> {
  abstract subject: T['subject']
  abstract queueGroupName: string
  abstract onMessage(data: T['data'], msg: Message): void
  private client: Stan
  protected ackWait = 5 * 1000

  constructor(client: Stan) {
    this.client = client
  }

  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable()
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName)
  }

  listen() {
    // create a subscription
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    )
    
    // start to listen to 'message'
    subscription.on('message', (msg: Message) => {
      console.log(
        `Message Recieved: ${this.subject} / ${this.queueGroupName}`
      )

      const parseData = this.parseMessage(msg)

      this.onMessage(parseData, msg) // response action when recieved message
    })
  }

  parseMessage(msg: Message) {
    const data = msg.getData()

    return typeof data === 'string' ?
      JSON.parse(data)
      : JSON.parse(data.toString('utf8'))
  }
}
