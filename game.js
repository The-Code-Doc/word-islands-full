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

  class ProgressMapScene extends Phaser.Scene {
    constructor() {
      super("ProgressMapScene");
      this.islands = ["Earth", "Water", "Wind", "Fire", "Elemental"];
      this.currentIndex = 0;
    }

    preload() {}

    create() {
      this.loadProgress();
      this.add.text(400, 80, "🌍 Word Islands", { fontSize: "32px", fill: "#004d40" }).setOrigin(0.5);
      this.status = this.add.text(400, 140, "", { fontSize: "20px", fill: "#333" }).setOrigin(0.5);
      this.islandLabel = this.add.text(400, 280, "", { fontSize: "40px", fill: "#00695c" }).setOrigin(0.5);
      this.leftArrow = this.add.text(100, 280, "<", { fontSize: "48px", fill: "#00838f" }).setOrigin(0.5).setInteractive().on("pointerdown", () => this.navigate(-1));
      this.rightArrow = this.add.text(700, 280, ">", { fontSize: "48px", fill: "#00838f" }).setOrigin(0.5).setInteractive().on("pointerdown", () => this.navigate(1));
      this.enterBtn = this.add.text(400, 400, "Enter", {
        fontSize: "24px", backgroundColor: "#00c2ff", color: "#fff", padding: { x: 20, y: 10 }
      }).setOrigin(0.5).setInteractive().on("pointerdown", () => this.tryEnter());
      this.updateView();
    }

    loadProgress() {
      const stored = JSON.parse(localStorage.getItem("wordIslandProgress") || "{}");
      this.unlocked = stored.unlockedIslands || 1;
      this.completed = stored.completedIslands || [];
    }

    navigate(dir) {
      const newIndex = this.currentIndex + dir;
      if (newIndex >= 0 && newIndex < this.islands.length) {
        this.currentIndex = newIndex;
        this.updateView();
      }
    }

    updateView() {
      const island = this.islands[this.currentIndex];
      const isUnlocked = this.currentIndex < this.unlocked || (island === "Elemental" && this.completed.length >= 4);
      const isCompleted = this.completed.includes(island);
      this.islandLabel.setText(island + (isUnlocked ? (isCompleted ? " ✅" : "") : " 🔒"));
      this.status.setText(isUnlocked ? "Tap Enter to begin" : "Locked Island");
    }

    tryEnter() {
      const island = this.islands[this.currentIndex];
      const isUnlocked = this.currentIndex < this.unlocked || (island === "Elemental" && this.completed.length >= 4);
      if (isUnlocked) {
        this.scene.start("IslandScene", { island });
      }
    }
  }

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

    create() {
      this.startTime = this.time.now;
      this.inputs = [];

      this.add.text(400, 30, `${this.island} Island`, { fontSize: "28px", fill: "#004d40" }).setOrigin(0.5);
      this.timerText = this.add.text(400, 60, "", { fontSize: "20px", fill: "#aa0000" }).setOrigin(0.5);
      this.feedback = this.add.text(400, 560, "", { fontSize: "20px", fill: "#007700" }).setOrigin(0.5);

      const spacing = 100;
      this.words.forEach((word, index) => {
        const baseY = 120 + index * spacing;
        const scrambled = this.shuffle(word);

        const input = this.add.dom(400, baseY, 'input', {
          type: 'text', fontSize: '18px', width: '200px', padding: '6px'
        });

        const label = this.add.text(400, baseY - 70, scrambled, {
          fontSize: "26px", fill: "#004d40"
        }).setOrigin(0.5);

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
        this.feedback.setText("🎉 Completed!").setColor("#004d40");
        if (!stored.completedIslands.includes(this.island)) stored.completedIslands.push(this.island);
        stored.unlockedIslands = (this.island === "Elemental") ? 5 : Math.max(stored.completedIslands.length + 1, stored.unlockedIslands || 1);
      } else {
        this.feedback.setText("⏱️ Time's up!").setColor("#b71c1c");
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
    backgroundColor: '#f1f8e9',
    parent: 'phaser-game',
    dom: { createContainer: true },
    scene: [ProgressMapScene, IslandScene]
  };

  new Phaser.Game(config);
};
