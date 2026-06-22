import Phaser from 'phaser'
import Player from './Player'
import MyPlayer from './MyPlayer'
import { sittingShiftData } from './Player'
import WebRTC from '../web/WebRTC'
import { Event, phaserEvents } from '../events/EventCenter'

export default class OtherPlayer extends Player {
  private targetPosition: [number, number]
  private lastUpdateTimestamp?: number
  private connectionBufferTime = 0
  private connected = false
  private playContainerBody: Phaser.Physics.Arcade.Body
  private myPlayer?: MyPlayer

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    id: string,
    name: string,
    frame?: string | number
  ) {
    super(scene, x, y, texture, id, frame)
    this.targetPosition = [x, y]

    this.playerName.setText(name)
    this.playContainerBody = this.playerContainer.body as Phaser.Physics.Arcade.Body
  }

  makeCall(myPlayer: MyPlayer, webRTC: WebRTC) {
    this.myPlayer = myPlayer
    const myPlayerId = myPlayer.playerId
    if (
      !this.connected &&
      this.connectionBufferTime >= 750 &&
      myPlayer.readyToConnect &&
      this.readyToConnect &&
      myPlayerId > this.playerId
    ) {
      const called = webRTC.connectToNewUser(this.playerId)
      if (called) {
        this.connected = true
        this.connectionBufferTime = 0
      }
    }
  }

  updateOtherPlayer(field: string, value: number | string | boolean) {
    switch (field) {
      case 'name':
        if (typeof value === 'string') {
          this.playerName.setText(value)
        }
        break

      case 'x':
        if (typeof value === 'number') {
          this.targetPosition[0] = value
        }
        break

      case 'y':
        if (typeof value === 'number') {
          this.targetPosition[1] = value
        }
        break

      case 'anim':
        if (typeof value === 'string') {
          this.anims.play(value, true)
        }
        break

      case 'readyToConnect':
        if (typeof value === 'boolean') {
          this.readyToConnect = value
        }
        break

      case 'videoConnected':
        if (typeof value === 'boolean') {
          this.videoConnected = value
        }
        break
    }
  }

  disconnect() {
    this.connected = false
    this.connectionBufferTime = 0
  }

  destroy(fromScene?: boolean) {
    this.playerContainer.destroy()

    super.destroy(fromScene)
  }

  /** preUpdate is called every frame for every game object. */
  preUpdate(t: number, dt: number) {
    super.preUpdate(t, dt)

    // Guard against currentAnim being null (can happen briefly on creation)
    if (!this.anims.currentAnim) return

    // Snap immediately if the game tab was inactive for > 750ms (avoid huge catch-up jumps)
    if (this.lastUpdateTimestamp && t - this.lastUpdateTimestamp > 750) {
      this.lastUpdateTimestamp = t
      this.x = this.targetPosition[0]
      this.y = this.targetPosition[1]
      this.playerContainer.x = this.targetPosition[0]
      this.playerContainer.y = this.targetPosition[1] - 30
      return
    }
    this.lastUpdateTimestamp = t

    this.setDepth(this.y)
    const animParts = this.anims.currentAnim.key.split('_')
    const animState = animParts[1]
    if (animState === 'sit') {
      const animDir = animParts[2]
      const sittingShift = sittingShiftData[animDir]
      if (sittingShift) {
        this.setDepth(this.depth + sittingShiftData[animDir][2])
      }
    }

    // ── Smooth lerp interpolation ────────────────────────────────────────────
    // lerpFactor controls how quickly we chase the target each frame.
    // 0.175 per ms means: at 60fps (dt≈16ms) we close ~95% of the gap in ~1 frame,
    // giving smooth but snappy following that is framerate-independent.
    const lerpFactor = 1 - Math.pow(1 - 0.175, dt / 16)
    const SNAP_THRESHOLD = 4 // pixels — snap if already very close

    const dx = this.targetPosition[0] - this.x
    const dy = this.targetPosition[1] - this.y

    if (Math.abs(dx) < SNAP_THRESHOLD) {
      this.x = this.targetPosition[0]
      this.playerContainer.x = this.targetPosition[0]
    } else {
      const newX = this.x + dx * lerpFactor
      this.setVelocityX((newX - this.x) / (dt / 1000))
      this.playContainerBody.setVelocityX((newX - this.x) / (dt / 1000))
    }

    if (Math.abs(dy) < SNAP_THRESHOLD) {
      this.y = this.targetPosition[1]
      this.playerContainer.y = this.targetPosition[1] - 30
    } else {
      const newY = this.y + dy * lerpFactor
      this.setVelocityY((newY - this.y) / (dt / 1000))
      this.playContainerBody.setVelocityY((newY - this.y) / (dt / 1000))
    }
    // ────────────────────────────────────────────────────────────────────────

    // Proximity chat connection timer
    this.connectionBufferTime += dt
    if (
      this.connected &&
      !this.body.embedded &&
      this.body.touching.none &&
      this.connectionBufferTime >= 750
    ) {
      if (this.x < 610 && this.y > 515 && this.myPlayer!.x < 610 && this.myPlayer!.y > 515) return
      phaserEvents.emit(Event.PLAYER_DISCONNECTED, this.playerId)
      this.connectionBufferTime = 0
      this.connected = false
    }
  }
}

declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      otherPlayer(
        x: number,
        y: number,
        texture: string,
        id: string,
        name: string,
        frame?: string | number
      ): OtherPlayer
    }
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  'otherPlayer',
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    x: number,
    y: number,
    texture: string,
    id: string,
    name: string,
    frame?: string | number
  ) {
    const sprite = new OtherPlayer(this.scene, x, y, texture, id, name, frame)

    this.displayList.add(sprite)
    this.updateList.add(sprite)

    this.scene.physics.world.enableBody(sprite, Phaser.Physics.Arcade.DYNAMIC_BODY)

    const collisionScale = [6, 4]
    sprite.body
      .setSize(sprite.width * collisionScale[0], sprite.height * collisionScale[1])
      .setOffset(
        sprite.width * (1 - collisionScale[0]) * 0.5,
        sprite.height * (1 - collisionScale[1]) * 0.5 + 17
      )

    return sprite
  }
)
