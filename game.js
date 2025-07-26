window.onload = function () {
  class EarthIslandScene extends Phaser.Scene {
    constructor() {
      super({ key: "EarthIslandScene" });
      this.words = [
        // 25 words for Earth Island
        "plant", "river", "stone", "grain", "mount", "lemon", "grass", "earth", "table", "chair",
        "leaves", "cloud", "field", "bloom", "fruit", "roots", "trunk", "barky", "creek", "slope",
        "rocks", "dunes", "miner", "muddy", "canal"
      ];
      this.portalWords = [];
      this.currentIndex = 0;
      this.startTime = 0;
      this.timeLimit = 60;
      this.completed = false;
    }

    preload() {}

    create() {
      this.portalWords = Phaser.Utils.Array.Shuffle(this.words).slice(0, 5);
      this.currentWord = this.portalWords[this.currentIndex];
      this.scrambled = this.shuffleWord(this.currentWord);
      this.startTime = this.time.now;

      this.add.text(400, 40, "🌱 Earth Island - Unscramble", {
        fontSize: "26px", fill: "#004d40"
      }).setOrigin(0.5);

      this.timerText = this.add.text(400, 80, "Time Left: 60", {
        fontSize: "20px", fill: "#aa0000"
      }).setOrigin(0.5);

      this.feedback = this.add.text(400, 140, "", {
        fontSize: "20px",
        fill: "#007700"
      }).setOrigin(0.5);

      this.scrambleText = this.add.text(400, 200, this.scrambled, {
        fontSize: "30px", fill: "#003"
      }).setOrigin(0.5);

      this.inputField = this.add.dom(400, 270, 'input', {
        type: 'text', fontSize: '20px', width: '200px', padding: '10px'
      });

      this.submitBtn = this.add.text(400, 340, "Submit", {
        fontSize: "22px",
        backgroundColor: "#00c2ff",
        color: "#fff",
        padding: { x: 15, y: 8 }
      }).setOrigin(0.5).setInteractive();

      this.submitBtn.on("pointerdown", () => {
        const guess = this.inputField.node.value.trim().toLowerCase();
        if (guess === this.currentWord) {
          this.feedback.setText("✅ Correct!").setColor("#007700");
          this.inputField.node.value = "";
          this.nextWord();
        } else {
          this.feedback.setText("❌ Try again").setColor("#aa0000");
        }
      });

      this.timerEvent = this.time.addEvent({
        delay: 1000,
        callback: this.updateTimer,
        callbackScope: this,
        loop: true
      });
    }

    updateTimer() {
      const elapsed = Math.floor((this.time.now - this.startTime) / 1000);
      const remaining = this.timeLimit - elapsed;
      this.timerText.setText("Time Left: " + remaining);
      if (remaining <= 0 && !this.completed) {
        this.endGame(false);
      }
    }

    nextWord() {
      this.currentIndex += 1;
      if (this.currentIndex < this.portalWords.length) {
        this.currentWord = this.portalWords[this.currentIndex];
        this.scrambled = this.shuffleWord(this.currentWord);
        this.scrambleText.setText(this.scrambled);
        this.feedback.setText("");
      } else {
        this.endGame(true);
      }
    }

    endGame(success) {
      this.completed = true;
      this.inputField.setVisible(false);
      this.submitBtn.disableInteractive();
      if (success) {
        this.feedback.setText("🎉 Portal Complete!").setColor("#004d40");
      } else {
        this.feedback.setText("⏱️ Time's Up!").setColor("#880000");
      }
      this.timerEvent.remove();
    }

    shuffleWord(word) {
      const arr = word.split("");
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr.join("");
    }
  }

  const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#e0f7fa',
    parent: 'phaser-game',
    dom: { createContainer: true },
    scene: [EarthIslandScene]
  };

  new Phaser.Game(config);
};
