import Phaser from 'phaser'
import BootScene from '@/game/scene/BootScene.js'
import WheelSpin from '@/game/scene/WheelScene.js'

function launch(containerId) {
  return new Phaser.Game({
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
  })
}

export default launch
export { launch }
