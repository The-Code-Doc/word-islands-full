window.onload = function () {
  class ProgressMapScene extends Phaser.Scene {
    constructor() {
      super({ key: "ProgressMapScene" });
      this.islands = ["Earth", "Water", "Wind", "Fire", "Elemental"];
      this.unlockedIslands = 1;
      this.completedIslands = [];
      this.currentIndex = 0;
    }

    preload() {}

    create() {
      this.cameras.main.setBackgroundColor("#e3f2fd");

      this.title = this.add.text(400, 100, "🌍 Word Islands", {
        fontSize: "32px", fill: "#004d40"
      }).setOrigin(0.5);

      this.statusText = this.add.text(400, 160, "", {
        fontSize: "20px", fill: "#00796b"
      }).setOrigin(0.5);

      this.islandText = this.add.text(400, 300, "", {
        fontSize: "48px", fill: "#00695c"
      }).setOrigin(0.5);

      this.leftArrow = this.add.text(100, 300, "<", {
        fontSize: "48px", fill: "#00838f"
      }).setInteractive().setOrigin(0.5);

      this.rightArrow = this.add.text(700, 300, ">", {
        fontSize: "48px", fill: "#00838f"
      }).setInteractive().setOrigin(0.5);

      this.leftArrow.on("pointerdown", () => this.navigate(-1));
      this.rightArrow.on("pointerdown", () => this.navigate(1));

      this.input.on('pointerdown', pointer => this.pointerStartX = pointer.x);
      this.input.on('pointerup', pointer => {
        const diff = pointer.x - this.pointerStartX;
        if (diff > 50) this.navigate(-1);
        else if (diff < -50) this.navigate(1);
      });

      this.enterBtn = this.add.text(400, 400, "Enter", {
        fontSize: "24px", backgroundColor: "#00c2ff", color: "#fff", padding: { x: 20, y: 10 }
      }).setOrigin(0.5).setInteractive();

      this.enterBtn.on("pointerdown", () => this.enterIsland());

      this.loadProgress();
      this.updateIslandView();
    }

    navigate(direction) {
      const newIndex = this.currentIndex + direction;
      if (newIndex < 0 || newIndex >= this.islands.length) return;
      this.currentIndex = newIndex;
      this.updateIslandView();
    }

    updateIslandView() {
      const island = this.islands[this.currentIndex];
      const isUnlocked = this.currentIndex < this.unlockedIslands;
      const isCompleted = this.completedIslands.includes(island);

      this.islandText.setText(island + (isCompleted ? " ✅" : ""));

      this.statusText.setText(isUnlocked ? "Tap 'Enter' to begin" : "🔒 Locked");

      this.enterBtn.setVisible(isUnlocked);

      this.leftArrow.setVisible(this.currentIndex > 0);
      this.rightArrow.setVisible(this.currentIndex < this.unlockedIslands - 1 ||
        (this.currentIndex === this.unlockedIslands - 1 && this.completedIslands.length >= 4));
    }

    enterIsland() {
      const island = this.islands[this.currentIndex];
      this.scene.start("EarthIslandScene", { island: island });
    }

    loadProgress() {
      const stored = localStorage.getItem("wordIslandProgress");
      if (stored) {
        const parsed = JSON.parse(stored);
        this.unlockedIslands = parsed.unlockedIslands || 1;
        this.completedIslands = parsed.completedIslands || [];
      }
    }
  }

  class EarthIslandScene extends Phaser.Scene {
    constructor() {
      super({ key: "EarthIslandScene" });
    }

    init(data) {
      this.island = data.island || "Earth";
      this.words = Phaser.Utils.Array.Shuffle(['plant', 'river', 'stone', 'grain', 'mount', 'lemon', 'grass', 'earth', 'table', 'chair', 'cloud', 'field', 'bloom', 'fruit', 'roots', 'trunk', 'barky', 'creek', 'slope', 'rocks', 'dunes', 'miner', 'muddy', 'canal', 'flame']).slice(0, 5);
      this.index = 0;
      this.timeLimit = 60;
    }

    preload() {}

    create() {
      this.startTime = this.time.now;
      this.currentWord = this.words[this.index];
      this.scrambled = this.shuffle(this.currentWord);

      this.add.text(400, 40, `${this.island} Island`, {
        fontSize: "26px", fill: "#004d40"
      }).setOrigin(0.5);

      this.timerText = this.add.text(400, 80, "", {
        fontSize: "20px", fill: "#aa0000"
      }).setOrigin(0.5);

      this.scrambleText = this.add.text(400, 160, this.scrambled, {
        fontSize: "36px", fill: "#003"
      }).setOrigin(0.5);

      this.feedback = this.add.text(400, 220, "", {
        fontSize: "20px", fill: "#007700"
      }).setOrigin(0.5);

      this.inputField = this.add.dom(400, 280, 'input', {
        type: 'text', fontSize: '20px', width: '200px', padding: '10px'
      });

      this.submitBtn = this.add.text(400, 340, "Submit", {
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
      this.index += 1;
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
        const stored = JSON.parse(localStorage.getItem("wordIslandProgress")) || {
          unlockedIslands: 1,
          completedIslands: []
        };
        if (!stored.completedIslands.includes(this.island)) {
          stored.completedIslands.push(this.island);
        }
        if (stored.completedIslands.length >= 4) {
          stored.unlockedIslands = 5;
        } else {
          stored.unlockedIslands = Math.max(stored.unlockedIslands, stored.completedIslands.length + 1);
        }
        localStorage.setItem("wordIslandProgress", JSON.stringify(stored));
      } else {
        this.feedback.setText("⏱️ Time's up!").setColor("#b71c1c");
      }

      this.time.delayedCall(3000, () => {
        this.scene.start("ProgressMapScene");
      });
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
  scene: [ProgressMapScene, EarthIslandScene]
};

  new Phaser.Game(config);
};
