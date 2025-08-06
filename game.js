
// game.js – Full working version with ProgressMapScene and IslandScene
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [ProgressMapScene, IslandScene]
};

const game = new Phaser.Game(config);

let currentIsland = "earth";

// Utility for loading island-specific background
function getIslandBackgroundKey(island) {
  switch (island) {
    case "earth": return "bgEarth";
    case "water": return "bgWater";
    case "wind": return "bgWind";
    case "fire": return "bgFire";
    default: return "bgEarth";
  }
}

// Scene: Progress Map
class ProgressMapScene extends Phaser.Scene {
  constructor() { super({ key: "ProgressMapScene" }); }

  preload() {
    this.load.image("bgEarth", "earth-island-bg.png");
    this.load.image("bgWater", "water-island-bg.png");
    this.load.image("bgWind", "wind-island-bg.png");
    this.load.image("bgFire", "fire-island-bg.png");
  }

  create() {
    this.add.image(400, 300, "bgEarth");

    const islands = ["earth", "water", "wind", "fire"];
    let index = 0;

    this.add.text(300, 50, "Island Progress Map", { fontSize: "24px", fill: "#ffffff" });

    islands.forEach(island => {
      const button = this.add.text(300, 150 + index * 60, `Enter ${island} island`, {
        fontSize: "20px",
        fill: "#00ffcc"
      }).setInteractive();

      button.on("pointerdown", () => {
        currentIsland = island;
        this.scene.start("IslandScene");
      });

      index++;
    });
  }
}

// Scene: Island with word unscrambling
class IslandScene extends Phaser.Scene {
  constructor() { super({ key: "IslandScene" }); }

  preload() {
    this.load.image("bgEarth", "earth-island-bg.png");
    this.load.image("bgWater", "water-island-bg.png");
    this.load.image("bgWind", "wind-island-bg.png");
    this.load.image("bgFire", "fire-island-bg.png");
  }

  create() {
    const bgKey = getIslandBackgroundKey(currentIsland);
    this.add.image(400, 300, bgKey);

    const words = getWordsForIsland(currentIsland).slice(0, 5);
    const style = { fontSize: "22px", fill: "#ffffff", backgroundColor: "#000000cc", padding: 6 };
    this.textBoxes = [];

    words.forEach((word, i) => {
      const y = 100 + i * 80;
      const input = this.add.dom(250, y, 'input', 'width: 180px; height: 28px; font-size: 18px;');
      this.textBoxes.push({ input, word });

      const label = this.add.text(480, y - 14, shuffleWord(word), style);
    });

    this.add.text(20, 20, `Island: ${currentIsland}`, { fontSize: "20px", fill: "#ffff00" });

    const backBtn = this.add.text(20, 550, "← Back to Map", {
      fontSize: "20px",
      fill: "#00ffcc"
    }).setInteractive();

    backBtn.on("pointerdown", () => {
      this.scene.start("ProgressMapScene");
    });

    this.input.keyboard.on("keydown-ENTER", () => {
      this.checkAnswers();
    });
  }

  checkAnswers() {
    this.textBoxes.forEach(obj => {
      const userWord = obj.input.node.value.trim().toLowerCase();
      if (userWord === obj.word.toLowerCase()) {
        obj.input.setVisible(false);
      }
    });
  }
}

function shuffleWord(word) {
  const array = word.split("");
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.join("");
}

function getWordsForIsland(island) {
  const wordBank = {
    earth: ["plant", "rocks", "stone", "dirt", "moss", "roots", "grass", "mines", "field"],
    water: ["oceanic", "current", "bubble", "whales", "trouts", "stream", "rivers", "tide", "shores"],
    wind: ["breeze", "gusty", "draft", "whirl", "zephyr", "galeon", "whoosh", "stormy", "hollow"],
    fire: ["volcanoes", "scorching", "pyromania", "campfires", "inferno", "lightning", "combusted"]
  };
  return wordBank[island] || wordBank["earth"];
}
