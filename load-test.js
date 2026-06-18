/**
 * MetaMesh - Beta Load Test Script v2
 * -------------------------------------
 * Ramps up WebSocket bot clients against the Colyseus server to find the
 * maximum number of simultaneous participants a single room can handle.
 *
 * Usage:
 *   node load-test.js [--url ws://localhost:2567] [--max 100] [--step 5] [--delay 1000]
 *
 * Requirements:
 *   colyseus.js must be installed in node_modules (already present in this project)
 */

const Colyseus = require('colyseus.js')

function parseArgs(argv) {
  const map = {}
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2)
      map[key] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true
    }
  }
  return map
}

const args     = parseArgs(process.argv.slice(2))
const SERVER   = args['url']   || 'ws://localhost:2567'
const MAX_BOTS = parseInt(args['max']   || '100')
const STEP     = parseInt(args['step']  || '5')
const DELAY_MS = parseInt(args['delay'] || '1000')
const ROOM     = 'skyoffice'   // matches RoomType.PUBLIC in types/Rooms.ts

// ── Tracking ────────────────────────────────────────────────────────────────────
let successfulJoins = 0   // cumulative – never goes down
let failedJoins     = 0
let currentlyActive = 0   // live connected bots right now
let peakActive      = 0
const latencies     = []
const errors        = []
const activeBots    = []  // { room, interval }

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
function avg(arr)  { return arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1) : 'N/A' }

// ── Spawn one bot ───────────────────────────────────────────────────────────────
async function spawnBot(botId) {
  const client = new Colyseus.Client(SERVER)
  const t0 = Date.now()
  try {
    const room = await client.joinOrCreate(ROOM, { password: null })
    const rtt  = Date.now() - t0
    latencies.push(rtt)
    successfulJoins++
    currentlyActive++
    if (currentlyActive > peakActive) peakActive = currentlyActive

    const bot = { room, interval: null }
    activeBots.push(bot)

    // Simulate position updates
    bot.interval = setInterval(() => {
      try {
        if (room.connection && room.connection.isOpen) {
          room.send('updatePlayer', {
            x: 500 + Math.random() * 200,
            y: 400 + Math.random() * 200,
            anim: 'adam_idle_down',
          })
        }
      } catch (_) {}
    }, 1000)

    room.onLeave(() => {
      currentlyActive--
      clearInterval(bot.interval)
    })

    room.onError((code, msg) => {
      errors.push(`Bot#${botId} [${code}]: ${msg}`)
    })

    return true
  } catch (err) {
    failedJoins++
    errors.push(`Bot#${botId} join failed: ${err.message || err}`)
    return false
  }
}

// ── Cleanup ──────────────────────────────────────────────────────────────────────
async function cleanup() {
  console.log('\n── Disconnecting all bots...')
  await Promise.allSettled(activeBots.map(async (bot) => {
    clearInterval(bot.interval)
    try { await bot.room.leave() } catch (_) {}
  }))
}

// ── Report ───────────────────────────────────────────────────────────────────────
function printReport() {
  console.log('\n╔══════════════════════════════════════════════════════╗')
  console.log('║          METAMESH BETA TEST – FINAL RESULTS          ║')
  console.log('╚══════════════════════════════════════════════════════╝')
  console.log(`  Peak concurrent participants  : ${peakActive}`)
  console.log(`  Total successful joins        : ${successfulJoins}`)
  console.log(`  Total failed joins            : ${failedJoins}`)
  console.log(`  Join success rate             : ${successfulJoins + failedJoins > 0 ? ((successfulJoins / (successfulJoins + failedJoins)) * 100).toFixed(1) : 0}%`)
  console.log(`  Average join latency          : ${avg(latencies)} ms`)
  console.log(`  Min / Max latency             : ${latencies.length ? Math.min(...latencies) : 'N/A'} ms / ${latencies.length ? Math.max(...latencies) : 'N/A'} ms`)

  if (errors.length) {
    console.log(`\n  Last ${Math.min(errors.length, 5)} errors:`)
    errors.slice(-5).forEach(e => console.log(`    ✗ ${e}`))
  }

  console.log('\n──────────────────────────────────────────────────────')
  if (failedJoins === 0) {
    console.log(`  ✅ All ${MAX_BOTS} bots connected without failure.`)
    console.log(`     Run again with a higher --max value to probe further.`)
  } else if (peakActive < 10) {
    console.log(`  ❌ Failures occurred very early (peak: ${peakActive}).`)
    console.log(`     Check server logs — may be a connection/auth issue.`)
  } else {
    console.log(`  ⚠️  Server started rejecting connections around ${peakActive} participants.`)
    console.log(`     Consider tuning OS socket limits or server resources.`)
  }
  console.log('══════════════════════════════════════════════════════\n')
}

// ── Main ─────────────────────────────────────────────────────────────────────────
async function run() {
  console.log('╔══════════════════════════════════════════════════════╗')
  console.log('║      MetaMesh Beta Load Test v2 – Starting           ║')
  console.log('╚══════════════════════════════════════════════════════╝')
  console.log(`  Server  : ${SERVER}`)
  console.log(`  Room    : ${ROOM}`)
  console.log(`  Max bots: ${MAX_BOTS}  |  Step: ${STEP}  |  Delay: ${DELAY_MS}ms\n`)

  process.on('SIGINT', async () => { await cleanup(); printReport(); process.exit(0) })

  let wave = 0
  let consecutiveTotalFailWaves = 0

  while (successfulJoins + failedJoins < MAX_BOTS) {
    wave++
    const promises = []
    const thisStep = Math.min(STEP, MAX_BOTS - successfulJoins - failedJoins)

    for (let i = 0; i < thisStep; i++) {
      promises.push(spawnBot(successfulJoins + failedJoins + i + 1))
    }

    const results = await Promise.allSettled(promises)
    const waveOk  = results.filter(r => r.status === 'fulfilled' && r.value === true).length
    const waveFail = thisStep - waveOk

    const mem = process.memoryUsage()
    console.log(
      `[Wave ${String(wave).padStart(3)}]  ` +
      `Active: ${String(currentlyActive).padStart(4)}  |  ` +
      `Peak: ${String(peakActive).padStart(4)}  |  ` +
      `Joined: ${String(successfulJoins).padStart(4)}  |  ` +
      `Failed: ${String(failedJoins).padStart(3)}  |  ` +
      `RTT avg: ${String(avg(latencies)).padStart(7)} ms  |  ` +
      `Heap: ${(mem.heapUsed/1024/1024).toFixed(1)} MB`
    )

    if (waveFail > 0) {
      // Print last few errors inline
      errors.slice(-(waveFail)).forEach(e => console.log(`         ↳ ${e}`))
    }

    if (waveFail === thisStep) {
      consecutiveTotalFailWaves++
      if (consecutiveTotalFailWaves >= 3) {
        console.error('\n  ❌ 3 consecutive all-fail waves — server capacity reached.\n')
        break
      }
    } else {
      consecutiveTotalFailWaves = 0
    }

    await sleep(DELAY_MS)
  }

  await cleanup()
  printReport()
}

run().catch(err => { console.error('Fatal:', err); process.exit(1) })
