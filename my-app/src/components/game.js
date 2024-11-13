import Phaser from 'phaser'
import BootScene from '@/components/scene/BootScene.js'
import WheelSpin from '@/components/scene/WheelScene.js'

export function launch(containerId, callbacks = {}) {
  // Get initial window dimensions
  const getWindowDimensions = () => ({
    width: window.innerWidth,
    height: window.innerHeight
  })

  const config = {
    type: Phaser.AUTO,
    scale: {
      mode: Phaser.Scale.FIT,  // Changed from RESIZE to FIT to avoid framebuffer issues
      parent: containerId,
      width: 800,  // Set base width
      height: 600, // Set base height
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    backgroundColor: '#ffffff',
    physics: {
      default: 'arcade',
      arcade: {
        debug: true
      }
    },
    scene: [BootScene, WheelSpin]
  }

  const game = new Phaser.Game(config)

  // Start the wheel spin scene with callbacks
  game.scene.start('WheelSpin', {
    onPrizeWon: callbacks.onPrizeWon
  })

  return game
}