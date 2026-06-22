import http from 'http'
import express from 'express'
import cors from 'cors'
import { Server, LobbyRoom } from 'colyseus'
import { ExpressPeerServer } from 'peer'
import { monitor } from '@colyseus/monitor'
import { RoomType } from '../types/Rooms'

// import socialRoutes from "@colyseus/social/express"

import { MetaMesh } from './rooms/MetaMesh'
import { connectDatabase } from './database'
import authRoutes from './routes/auth'

const port = Number(process.env.PORT || 2567)
const app = express()

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json())
// app.use(express.static('dist'))

// Connect to database
connectDatabase()

// Register authentication routes
app.use('/auth', authRoutes)

const server = http.createServer(app)
const gameServer = new Server({
  server,
})

// Self-hosted PeerJS signaling server.
// The WS path is: {path option} + key ('peerjs') = '/peerjs'
// Client must use path:'/' so its URL resolves to wss://host/peerjs.
// proxied:true lets PeerJS trust Railway/Render's X-Forwarded-* headers.
const peerServer = ExpressPeerServer(server, {
  path: '/',
  proxied: true,
} as any)
app.use('/peerjs', peerServer)
console.log('PeerJS signaling server mounted at /peerjs')

// register room handlers
gameServer.define(RoomType.LOBBY, LobbyRoom)
gameServer.define(RoomType.PUBLIC, MetaMesh, {
  name: 'Public Lobby',
  description: 'For making friends and familiarizing yourself with the controls',
  password: null,
  autoDispose: false,
})
gameServer.define(RoomType.CUSTOM, MetaMesh).enableRealtimeListing()

/**
 * Register @colyseus/social routes
 *
 * - uncomment if you want to use default authentication (https://docs.colyseus.io/server/authentication/)
 * - also uncomment the import statement
 */
// app.use("/", socialRoutes);

// register colyseus monitor AFTER registering your room handlers
app.use('/colyseus', monitor())

gameServer.listen(port)
console.log(`Listening on ws://localhost:${port}`)

app.get('/', (_, res) => {
  res.json({
    status: 'MetaMesh Backend Running'
  })
})
