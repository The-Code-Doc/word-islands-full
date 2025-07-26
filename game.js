window.onload = function () {
  class WordUnscrambleScene extends Phaser.Scene {
    constructor() {
      super({ key: "WordUnscrambleScene" });
    }

    init(data) {
      this.originalWord = data.word || "planet";
      this.scrambledWord = this.shuffleWord(this.originalWord);
    }

    preload() {}

    create() {
      this.add.text(400, 50, "Unscramble the Word!", {
        fontSize: "32px",
        fill: "#003",
        fontFamily: "Quicksand"
      }).setOrigin(0.5);

      this.feedback = this.add.text(400, 140, "", {
        fontSize: "20px",
        fill: "#007700"
      }).setOrigin(0.5);

      this.inputField = this.add.dom(400, 200, 'input', {
        type: 'text',
        fontSize: '20px',
        width: '200px',
        padding: '10px'
      });

      this.scrambleText = this.add.text(400, 280, this.scrambledWord, {
        fontSize: "28px",
        color: "#004d40",
        fontFamily: "Quicksand"
      }).setOrigin(0.5);

      const submitBtn = this.add.text(400, 360, "Submit", {
        fontSize: "22px",
        backgroundColor: "#00c2ff",
        color: "#fff",
        padding: { x: 15, y: 8 }
      }).setOrigin(0.5).setInteractive();

      submitBtn.on("pointerdown", () => {
        const input = this.inputField.node.value.trim().toLowerCase();
        if (input === this.originalWord) {
          this.feedback.setText("✅ Correct!").setColor("#007700");
        } else {
          this.feedback.setText("❌ Try again").setColor("#aa0000");
        }
      });
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
    backgroundColor: '#e3f2fd',
    parent: 'phaser-game',
    dom: { createContainer: true },
    scene: [WordUnscrambleScene]
  };

  new Phaser.Game(config);
};
