import { Scene } from 'phaser';

export default class WheelSpin extends Scene {
  constructor() {
    super({ key: 'WheelSpin' });
  }

  create() {
    // Define the scale factor for resizing
    const wheelScale = 0.68; // Adjust this value as needed for the wheel size
    const pinScale = 0.12; // Adjust this value as needed for the pin size
  
    // Adding the wheel sprite in the center of the canvas with scaling
    this.wheel = this.add.sprite(400, 270, 'wheel');
    this.wheel.setOrigin(0.5, 0.5);
    this.wheel.setScale(wheelScale); // Scale down or up the wheel
  
    // Adding the pin sprite in the center-top with scaling
    this.pin = this.add.sprite(400, 280, 'pin').setOrigin(0.5, 0.5);
    this.pin.setScale(pinScale); // Scale down or up the pin
  
    // Prize text displayed when wheel stops
    this.prizeText = this.add.text(400, 560, 'Spin the wheel!', {
      fontSize: '32px',
      color: '#000000',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);
  
    // Enabling spin on pointer click
    this.input.on('pointerdown', this.spinWheel, this);
  }
  
  spinWheel() {
    // Only allow spinning if the wheel is not already spinning
    if (!this.isSpinning) {
      this.isSpinning = true;
      this.prizeText.setText('Spinning...');
  
      // Play sound
      this.sound.play('spinSound');
  
      // Randomize the rotation degrees
      const rounds = Phaser.Math.Between(3, 5); // Random rounds
      const sliceDegrees = 360 / 8; // Each slice is 45 degrees
      const offset = sliceDegrees / 1; // To land in the middle of each slice
  
      // Select a random midpoint for one of the 8 slices
      const finalDegrees = Phaser.Math.Between(0, 7) * sliceDegrees + offset;
      const prizeAngle = 360 * rounds + finalDegrees;
  
      // Tween for smooth spinning
      this.tweens.add({
        targets: this.wheel,
        angle: prizeAngle,
        duration: 3000,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          this.showPrize(finalDegrees); // Pass the finalDegrees to showPrize
          this.isSpinning = false;
        },
      });
    }
  }
  
  showPrize(degrees) {
    // Prizes array for 8 slices
    const prizes = [
      "🎉 20% OFF",
      "🎉 10% OFF",
      "🎉 FREE DELIVERY",
      "🎉 10% OFF",
      "🎉 20% OFF",
      "🎉 10% OFF",
      "🎉 FREE DELIVERY",
      "🎉 10% OFF",
    ];
  
    // Total degrees for one full rotation (360 degrees)
    const sliceDegrees = 360 / prizes.length;
  
    // Calculate the prize based on the stop angle (midpoint of each slice)
    // Adjust the degrees to land on the center of each slice by dividing by the slice degrees
    const prizeIndex = Math.floor((degrees + sliceDegrees / 2) / sliceDegrees) % prizes.length;
  
    // Set the prize text based on the final prize slice
    this.prizeText.setText(prizes[prizeIndex]);
  }
    
}