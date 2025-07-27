window.onload = function () {
  const ISLAND_RULES = {
    Earth: { length: 5, count: 5, time: 60 },
    Water: { length: 7, count: 5, time: 120 },
    Wind:  { length: 7, count: 5, time: 60 },
    Fire:  { length: 10, count: 3, time: 60 },
    Elemental: { length: 7, count: 5, time: 90 } // placeholder
  };

  const WORD_BANK = {
    Earth: ["plant", "river", "stone", "grain", "mount", "lemon", "grass", "earth", "table", "chair", "cloud", "field", "bloom", "fruit", "roots", "trunk", "creek", "slope", "rocks", "dunes", "miner", "muddy", "canal", "flame"],
    Water: ["journey", "weather", "picture", "diamond", "kingdom", "festival", "capture", "station", "balance", "freedom", "library", "network", "history", "venture", "blanket"],
    Wind:  ["miracle", "passion", "stadium", "thought", "garment", "charity", "silence", "organic", "dismiss", "culture", "teacher", "fantasy", "pursuit", "fortune", "musical"],
    Fire:  ["earthquake", "background", "foundation", "playwright", "apocalypse", "experience", "journalism", "technology", "university", "vegetables"]
  };

  class ProgressMapScene extends Phaser.Scene {
    constructor() {
      super("ProgressMapScene");
      this.islands = ["Earth", "Water", "Wind", "Fire", "Elemental"];
      this.currentIndex = 0;
    }

    preload() {}

    create() {
      this.loadProgress();

      this.add.text(400, 80, "🌍 Word Islands", {
        fontSize: "32px", fill: "#004d40"
      }).setOrigin(0.5);

      this.status = this.add.text(400, 140, "", {
        fontSize: "20px", fill: "#333"
      }).setOrigin(0.5);

      this.islandLabel = this.add.text(400, 280, "", {
        fontSize: "40px", fill: "#00695c"
      }).setOrigin(0.5);

      this.leftArrow = this.add.text(100, 280, "<", {
        fontSize: "48px", fill: "#00838f"
      }).setOrigin(0.5).setInteractive().on("pointerdown", () => this.navigate(-1));

      this.rightArrow = this.add.text(700, 280, ">", {
        fontSize: "48px", fill: "#00838f"
      }).setOrigin(0.5).setInteractive().on("pointerdown", () => this.navigate(1));

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
      this.enterBtn.setVisible(true);
      this.leftArrow.setVisible(this.currentIndex > 0);
      this.rightArrow.setVisible(this.currentIndex < this.islands.length - 1);
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
      const rule = ISLAND_RULES[this.island];
      const words = Phaser.Utils.Array.Shuffle(WORD_BANK[this.island] || []).slice(0, rule.count);
      this.words = words;
      this.index = 0;
      this.timeLimit = rule.time;
    }

    create() {
      this.startTime = this.time.now;
      this.currentWord = this.words[this.index];
      this.scrambled = this.shuffle(this.currentWord);

      this.add.text(400, 50, `${this.island} Island`, {
        fontSize: "28px", fill: "#004d40"
      }).setOrigin(0.5);

      this.timerText = this.add.text(400, 90, "Time: 0", {
        fontSize: "20px", fill: "#aa0000"
      }).setOrigin(0.5);

      this.scrambleText = this.add.text(400, 180, this.scrambled, {
        fontSize: "36px", fill: "#003"
      }).setOrigin(0.5);

      this.feedback = this.add.text(400, 240, "", {
        fontSize: "20px", fill: "#007700"
      }).setOrigin(0.5);

      this.inputField = this.add.dom(400, 310, 'input', {
        type: 'text', fontSize: '20px', width: '200px', padding: '10px'
      });

      this.submitBtn = this.add.text(400, 370, "Submit", {
        fontSize: "22px", backgroundColor: "#00c2ff", color: "#fff", padding: { x: 15, y: 8 }
      }).setOrigin(0.5).setInteractive();

      this.submitBtn.on("pointerdown", () => {
        const guess = this.inputField.node.value.trim().toLowerCase();
        if (guess === this.currentWord) {
          this.feedback.setText("✅ Correct!");
          this.inputField.node.value = "";
          this.nextWord();
        } else {
          this.feedback.setText("❌ Try again");
        }
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
      if (remaining <= 0) {
        this.endGame(false);
      }
    }

    nextWord() {
      this.index++;
      if (this.index >= this.words.length) {
        this.endGame(true);
      } else {
        this.currentWord = this.words[this.index];
        this.scrambled = this.shuffle(this.currentWord);
        this.scrambleText.setText(this.scrambled);
        this.feedback.setText("");
      }
    }

    endGame(success) {
      this.inputField.setVisible(false);
      this.submitBtn.disableInteractive();
      this.timer.remove();

      if (success) {
        this.feedback.setText("🎉 Completed!").setColor("#004d40");
        const stored = JSON.parse(localStorage.getItem("wordIslandProgress") || "{}");
        if (!stored.completedIslands) stored.completedIslands = [];
        if (!stored.completedIslands.includes(this.island)) {
          stored.completedIslands.push(this.island);
        }
        if (this.island !== "Elemental" && stored.completedIslands.length >= 4) {
          stored.unlockedIslands = 5;
        } else {
          stored.unlockedIslands = Math.max(stored.unlockedIslands || 1, stored.completedIslands.length + 1);
        }
        localStorage.setItem("wordIslandProgress", JSON.stringify(stored));
      } else {
        this.feedback.setText("⏱️ Time's up!").setColor("#b71c1c");
      }

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
