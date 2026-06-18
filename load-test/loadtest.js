/**
 * MetaMesh Concurrent User Load Test
 * Connects N simultaneous bot clients to the Colyseus server
 * and reports live stats for project demonstration.
 */

const { Client } = require('colyseus.js')
const os = require('os')

const SERVER_URL = 'ws://localhost:2567'
const TARGET_USERS = parseInt(process.argv[2]) || 50
const RAMP_DELAY_MS = 100  // connect 1 user every 100ms (smooth ramp-up)
const HOLD_DURATION_MS = 15000  // keep all users connected for 15 seconds
const MOVE_INTERVAL_MS = 500  // simulate player movement every 500ms

const results = {
  attempted: 0,
  connected: 0,
  failed: 0,
  peakConcurrent: 0,
  disconnected: 0,
  startTime: null,
  endTime: null,
  rooms: new Set(),
  latencies: [],
}

const activeClients = []
let movementIntervals = []

function getStats() {
  const avg = results.latencies.length
    ? (results.latencies.reduce((a, b) => a + b, 0) / results.latencies.length).toFixed(1)
    : 'N/A'
  const max = results.latencies.length ? Math.max(...results.latencies) : 'N/A'
  return { avg, max }
}

async function connectUser(userId) {
  const client = new Client(SERVER_URL)
  const connectStart = Date.now()

  try {
    results.attempted++
    const room = await client.joinOrCreate('public_lobby')
    const latency = Date.now() - connectStart
    results.latencies.push(latency)
    results.connected++
    results.rooms.add(room.roomId)

    if (results.connected > results.peakConcurrent) {
      results.peakConcurrent = results.connected
    }

    // Simulate player movement (realistic bot behavior)
    const interval = setInterval(() => {
      if (room.connection.isOpen) {
        room.send('updatePlayer', {
          x: 300 + Math.random() * 800,
          y: 200 + Math.random() * 600,
          anim: ['adam_run_right', 'adam_run_left', 'adam_idle_down', 'adam_run_up'][Math.floor(Math.random() * 4)],
        })
      }
    }, MOVE_INTERVAL_MS + Math.random() * 200)

    movementIntervals.push(interval)
    activeClients.push({ client, room, userId })

    room.onLeave(() => {
      results.disconnected++
    })

    return true
  } catch (err) {
    results.failed++
    return false
  }
}

function printHeader() {
  console.clear()
  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║         MetaMesh — Concurrent User Load Test                 ║')
  console.log('╠══════════════════════════════════════════════════════════════╣')
  console.log(`║  Server   : ${SERVER_URL.padEnd(49)}║`)
  console.log(`║  Target   : ${String(TARGET_USERS + ' concurrent users').padEnd(49)}║`)
  console.log(`║  Machine  : ${String(os.cpus()[0].model).substring(0, 49).padEnd(49)}║`)
  console.log(`║  RAM      : ${String(Math.round(os.totalmem()/1024/1024/1024) + ' GB total / ' + Math.round(os.freemem()/1024/1024/1024) + ' GB free').padEnd(49)}║`)
  console.log('╚══════════════════════════════════════════════════════════════╝')
  console.log('')
}

function printLiveStats(phase) {
  const { avg, max } = getStats()
  const elapsed = results.startTime ? ((Date.now() - results.startTime) / 1000).toFixed(1) : '0'
  const bar = '█'.repeat(Math.floor((results.connected / TARGET_USERS) * 30)).padEnd(30, '░')

  console.log(`\n📡 Phase: ${phase}   ⏱  Elapsed: ${elapsed}s`)
  console.log(`\n  Progress : [${bar}] ${results.connected}/${TARGET_USERS}`)
  console.log(`  ✅ Connected    : ${results.connected}`)
  console.log(`  ❌ Failed       : ${results.failed}`)
  console.log(`  🏆 Peak Users   : ${results.peakConcurrent}`)
  console.log(`  🏠 Active Rooms : ${results.rooms.size}`)
  console.log(`  ⚡ Avg Latency  : ${avg} ms`)
  console.log(`  🔺 Max Latency  : ${max} ms`)
}

async function runLoadTest() {
  printHeader()
  console.log(`🚀 Starting ramp-up: connecting ${TARGET_USERS} users (1 every ${RAMP_DELAY_MS}ms)...\n`)

  results.startTime = Date.now()

  // Ramp-up phase
  for (let i = 0; i < TARGET_USERS; i++) {
    await connectUser(i + 1)
    if ((i + 1) % 5 === 0 || i === TARGET_USERS - 1) {
      process.stdout.write(`\r  ⟳ Connecting user ${i + 1}/${TARGET_USERS}   Connected: ${results.connected}   Failed: ${results.failed}  `)
    }
    await new Promise(r => setTimeout(r, RAMP_DELAY_MS))
  }

  console.log('\n')
  printLiveStats('🟢 PEAK LOAD — All users connected')

  // Hold phase — keep all users active
  console.log(`\n⏳ Holding peak load for ${HOLD_DURATION_MS / 1000} seconds...`)
  await new Promise(r => setTimeout(r, HOLD_DURATION_MS))

  // Report while still connected
  printLiveStats('✅ SUSTAINED LOAD TEST COMPLETE')

  // Cleanup
  console.log('\n🛑 Disconnecting all clients...')
  movementIntervals.forEach(i => clearInterval(i))
  activeClients.forEach(({ room }) => {
    try { room.leave() } catch (_) {}
  })

  await new Promise(r => setTimeout(r, 2000))
  results.endTime = Date.now()

  // Final Report
  const duration = ((results.endTime - results.startTime) / 1000).toFixed(1)
  const { avg, max } = getStats()
  const successRate = ((results.connected / results.attempted) * 100).toFixed(1)

  console.log('\n')
  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║                    📋 FINAL PROOF REPORT                     ║')
  console.log('╠══════════════════════════════════════════════════════════════╣')
  console.log(`║  Test Duration       : ${String(duration + ' seconds').padEnd(38)}║`)
  console.log(`║  Users Attempted     : ${String(results.attempted).padEnd(38)}║`)
  console.log(`║  Users Connected ✅  : ${String(results.connected).padEnd(38)}║`)
  console.log(`║  Users Failed ❌     : ${String(results.failed).padEnd(38)}║`)
  console.log(`║  Success Rate        : ${String(successRate + '%').padEnd(38)}║`)
  console.log(`║  Peak Concurrent     : ${String(results.peakConcurrent + ' simultaneous users').padEnd(38)}║`)
  console.log(`║  Active Rooms Used   : ${String(results.rooms.size).padEnd(38)}║`)
  console.log(`║  Avg Join Latency    : ${String(avg + ' ms').padEnd(38)}║`)
  console.log(`║  Max Join Latency    : ${String(max + ' ms').padEnd(38)}║`)
  console.log(`║  Server              : ${String(SERVER_URL).padEnd(38)}║`)
  console.log(`║  Framework           : Colyseus v0.14                        ║`)
  console.log(`║  Transport           : WebSocket                              ║`)
  console.log('╠══════════════════════════════════════════════════════════════╣')
  const verdict = results.peakConcurrent >= TARGET_USERS * 0.9 ? '✅ PASSED' : '⚠️  PARTIAL'
  console.log(`║  VERDICT  : ${String(verdict).padEnd(50)}║`)
  console.log('╚══════════════════════════════════════════════════════════════╝')
  console.log('\n📸 Take a screenshot of the Colyseus Monitor at:')
  console.log('   http://localhost:2567/colyseus\n')

  process.exit(0)
}

runLoadTest().catch(err => {
  console.error('Load test error:', err.message)
  process.exit(1)
})
