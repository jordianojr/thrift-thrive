import Phaser from 'phaser'
import BootScene from '@/components/scene/BootScene.js'
import WheelSpin from '@/components/scene/WheelScene.js'

export function launch(containerId, callbacks = {}) {
  const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    autoCenter: true,
    backgroundColor: '#ffffff',
    parent: containerId,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 300 },
        debug: false
      }
    },
    scene: [BootScene, WheelSpin]
  }

  const game = new Phaser.Game(config)
  
  // Pass callbacks to the scene
  game.scene.start('WheelSpin', { 
    onPrizeWon: callbacks.onPrizeWon 
  })

  return game
}