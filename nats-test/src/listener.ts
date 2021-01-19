import { randomBytes } from 'crypto'
import nats from 'node-nats-streaming'
import { TicketCreatedListener } from './events/ticket-created-listener'

console.clear()

// create a instance of 'nats.connect'
const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222'
})

// setup the instance's props/params and behavior 
stan.on('connect', () => {
  console.log('Listener connected to NATS')

  // setup behavior when 'close'
  stan.on('close', () => {
    console.log("NATS connection closed!")
    process.exit()
  })

  new TicketCreatedListener(stan).listen()

  // define options instance for subscription
  // const options = stan
  //   .subscriptionOptions()
  //   .setManualAckMode(true)
  //   .setDeliverAllAvailable()
  //   .setDurableName('account-service')

  // define subscription for 'listener'
  // const subscription = stan.subscribe(
  //   'ticket:created',
  //   'queue-group-name',
  //   options
  // )

  //setup subscription behavior when recieved 'message'
  // subscription.on('message', (msg: Message) => {
  //   const data = msg.getData()
    
  //   if (typeof data === 'string') {
  //     console.log(`Recieved event #${msg.getSequence()}, with data: ${data}`)
  //   }

  //   msg.ack()
  // })
})

process.on('SIGINT', () => stan.close()) // when process is interrupted, close
process.on('SIGTERM', () => stan.close()) // when process is terminated, close
