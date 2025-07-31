
window.onload = function () {
  const ISLAND_RULES = {
    Earth: { length: 5, count: 5, time: 60 },
    Water: { length: 7, count: 5, time: 120 },
    Wind:  { length: 7, count: 5, time: 60 },
    Fire:  { length: 10, count: 3, time: 60 },
    Elemental: { length: 7, count: 5, time: 90 }
  };

  const MASTER_WORD_LIST = [
    "plant", "river", "stone", "grain", "lemon", "earth", "table", "chair", "cloud", "field",
    "bloom", "fruit", "roots", "trunk", "creek", "slope", "rocks", "dunes", "miner", "muddy",
    "journey", "weather", "picture", "diamond", "kingdom", "festival", "capture", "station", "freedom",
    "library", "network", "history", "venture", "blanket", "teacher", "fantasy", "pursuit", "fortune", "musical",
    "foundation", "playwright", "apocalypse", "experience", "journalism", "technology", "university", "vegetables", "background", "earthquake"
  ];

  class IslandScene extends Phaser.Scene {
    constructor() {
      super("IslandScene");
    }

    init(data) {
      this.island = data.island;
      const { length, count, time } = ISLAND_RULES[this.island];
      this.wordLength = length;
      this.wordCount = count;
      this.timeLimit = time;
      this.words = Phaser.Utils.Array.Shuffle(MASTER_WORD_LIST.filter(w => w.length === length)).slice(0, count);
    }

    preload() {
      this.load.image('bgEarth", "earth-island-bg.png');
      this.load.image('bgWater", "water-island-bg.png');
      this.load.image('bgWind", "wind-island-bg.png');
      this.load.image('bgFire", "fire-island-bg.png');
    }

    create() {
      this.startTime = this.time.now;
      this.inputs = [];

      const bgKey = `bg${this.island}`;
      if (this.textures.exists(bgKey)) {
        this.add.image(400, 300, bgKey).setDisplaySize(800, 600).setDepth(-1);
      }

      this.add.text(400, 30, `${this.island} Island`, { fontSize: "28px", fill: "#ffffff", backgroundColor: "#00000088" }).setOrigin(0.5);
      this.timerText = this.add.text(400, 60, "", { fontSize: "20px", fill: "#ffffff", backgroundColor: "#00000088" }).setOrigin(0.5);
      this.feedback = this.add.text(400, 560, "", { fontSize: "20px", fill: "#ffffff", backgroundColor: "#00000088" }).setOrigin(0.5);

      const spacing = 80;
      const startY = 120;

      this.words.forEach((word, index) => {
        const y = startY + index * spacing;
        const scrambled = this.shuffle(word);

        const input = this.add.dom(250, y, 'input', {
          type: 'text', fontSize: '18px', width: '200px', padding: '6px'
        });

        const label = this.add.text(480, y, scrambled, {
          fontSize: "24px", fill: "#ffffff", backgroundColor: "#000000cc"
        }).setOrigin(0, 0.5);

        input.originalWord = word;
        input.wordLabel = label;
        this.inputs.push(input);
      });

      this.timer = this.time.addEvent({
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

      if (remaining <= 0) return this.endGame(false);

      for (const input of this.inputs) {
        if (input.visible) {
          const guess = input.node.value.trim().toLowerCase();
          if (guess === input.originalWord) {
            input.setVisible(false);
            if (input.wordLabel) input.wordLabel.setVisible(false);
          }
        }
      }

      if (this.inputs.every(i => !i.visible)) {
        this.endGame(true);
      }
    }

    endGame(success) {
      this.timer.remove();
      this.inputs.forEach(input => input.setVisible(false));
      const stored = JSON.parse(localStorage.getItem("wordIslandProgress") || "{}");
      if (!stored.completedIslands) stored.completedIslands = [];

      if (success) {
        this.feedback.setText("🎉 Completed!");
        if (!stored.completedIslands.includes(this.island)) stored.completedIslands.push(this.island);
        stored.unlockedIslands = (this.island === "Elemental") ? 5 : Math.max(stored.completedIslands.length + 1, stored.unlockedIslands || 1);
      } else {
        this.feedback.setText("⏱️ Time's up!");
      }

      localStorage.setItem("wordIslandProgress", JSON.stringify(stored));
      this.time.delayedCall(3000, () => this.scene.start("ProgressMapScene"));
    }

    shuffle(word) {
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
    backgroundColor: '#000000',
    parent: 'phaser-game',
    dom: { createContainer: true },
    scene: [IslandScene]
  };

  new Phaser.Game(config);
};
