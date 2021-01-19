import jwt from 'jsonwebtoken'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

declare global {
  namespace NodeJS {
    interface Global {
      signup(id?: string): string[]
    }
  }
}

jest.mock('../nats-wrapper')

process.env.STRIPE_KEY = 'sk_test_51IBG7yFdpAVJvMwjkeWJNPOlc3kHGFXXIaVjdj3w3de00r538CxtfzUoPXuoJaDkc29NjbJatYHRLiDxcwBmirop00Yflq6XCA'

let mongo: any
beforeAll(async () => {
  process.env.JWT_KEY = 'asdf'
  
  mongo = new MongoMemoryServer()
  const mongoUri = await mongo.getUri()

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
})


beforeEach(async () => {
  jest.clearAllMocks()
  const collections = await mongoose.connection.db.collections()
  for (let collection of collections) {
    await collection.deleteMany({})
  }
})


afterAll(async () => {
  await mongo.stop()
  await mongoose.connection.close()
})



global.signup = (id?: string) => {
  // Since in tickets srv, we can not sign up any user,
  // we make a fake cookie for testing

  // build a JWT payload. {id, email}

  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com'
  }

  // Create the JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY!)

  // Build session object. {jwt: MY_JWT}
  const session = {jwt: token}

  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session)

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64')

  // return a string like a cookie with the encoded data
  return [`express:sess=${base64}`]
}

