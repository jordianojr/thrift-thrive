import { Scene } from 'phaser'
import thudMp3 from '@/assets/thud.mp3'
import wheel from '@/assets/wheel.png'
import pin from '@/assets/pin.png'
import yay from '@/assets/kids_cheering.mp3'
import spin from '@/assets/spinsound.mp3'

export default class BootScene extends Scene {
  constructor () {
    super({ key: 'BootScene' })
  }

  preload () {
    this.load.image('wheel', wheel);
    this.load.image('pin', pin);
    this.load.audio('spinSound', thudMp3);
    this.load.audio('yay', yay);
    this.load.audio('spin', spin);
  }

  create () {
    this.scene.start('WheelSpin')
  }
}
