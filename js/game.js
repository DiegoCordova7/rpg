import { state } from "./state.js";
import { weapons, monsters } from "./data.js";
import { UI, updateStats } from "./ui.js";

const body = document.getElementById("game-body");
const locations = [
  {
    name: "town square",
    "button text": ["Ir a la tienda", "Ir a la cueva", "Luchar contra el dragón"],
    "button functions": [goStore, goCave, fightDragon],
    text: "Estás en la plaza del pueblo. Ves un letrero que dice \"Tienda\"."
  },
  {
    name: "store",
    "button text": ["Comprar 10 de salud (10 oro)", "Comprar arma (30 oro)", "Ir a la plaza"],
    "button functions": [buyHealth, buyWeapon, goTown],
    text: "Entras a la tienda."
  },
  {
    name: "cave",
    "button text": ["Luchar contra slime", "Luchar contra bestia colmilluda", "Ir a la plaza"],
    "button functions": [fightSlime, fightBeast, goTown],
    text: "Entras a la cueva. Ves algunos monstruos."
  },
  {
    name: "fight",
    "button text": ["Atacar", "Esquivar", "Huir"],
    "button functions": [attack, dodge, goTown],
    text: "Estás luchando contra un monstruo."
  },
  {
    name: "kill monster",
    "button text": ["Ir a la plaza", "Ir a la plaza", "Ir a la plaza"],
    "button functions": [goTown, goTown, goTown],
    text: 'El monstruo grita "¡Arg!" mientras muere. Ganas puntos de experiencia y encuentras oro.'
  },
  {
    name: "lose",
    "button text": ["¿REINTENTAR?", "¿REINTENTAR?", "¿REINTENTAR?"],
    "button functions": [restart, restart, restart],
    text: "Has muerto. ☠"
  },
  {
    name: "win",
    "button text": ["¿REINTENTAR?", "¿REINTENTAR?", "¿REINTENTAR?"],
    "button functions": [restart, restart, restart],
    text: "¡Has derrotado al dragón! ¡GANASTE EL JUEGO! 🎉"
  }
];

function update(location) {
  UI.monsterStats.style.display = "none";

  UI.button1.innerText = location["button text"][0];
  UI.button2.innerText = location["button text"][1];
  UI.button3.innerText = location["button text"][2];

  UI.button1.onclick = location["button functions"][0];
  UI.button2.onclick = location["button functions"][1];
  UI.button3.onclick = location["button functions"][2];

  UI.text.innerHTML = location.text;
  switch (location.name) {
  case "town square":
    body.style.backgroundImage = "url('assets/town.png')";
    break;
  case "store":
    body.style.backgroundImage = "url('assets/shop.png')";
    break;
  case "cave":
    body.style.backgroundImage = "url('assets/cave.png')";
    break;
  case "fight":
    if (state.fighting === 2) {
      body.style.backgroundImage = "url('assets/dragon.png')";
    } else {
      body.style.backgroundImage = "url('assets/cave.png')";
    }
    break;
  default:
    body.style.backgroundImage = "url('assets/town.png')";
}
}

function goTown() {
  update(locations[0]);
}

function goStore() {
  update(locations[1]);
}

function goCave() {
  update(locations[2]);
}

function buyHealth() {
  if (state.gold >= 10) {
    state.gold -= 10;
    state.health += 10;
    updateStats(state);
  } else {
    UI.text.innerText = "No tienes suficiente oro.";
  }
}

function buyWeapon() {
  if (state.currentWeapon < weapons.length - 1) {
    if (state.gold >= 30) {
      state.gold -= 30;
      state.currentWeapon++;

      let newWeapon = weapons[state.currentWeapon].name;
      state.inventory.push(newWeapon);

      UI.text.innerText =
        "Ahora tienes un(a) " + newWeapon +
        ". En tu inventario tienes: " + state.inventory;

      updateStats(state);
    } else {
      UI.text.innerText = "No tienes suficiente oro.";
    }
  } else {
    UI.text.innerText = "¡Ya tienes el arma más poderosa!";
    UI.button2.innerText = "Vender arma por 15 de oro";
    UI.button2.onclick = sellWeapon;
  }
}

function sellWeapon() {
  if (state.inventory.length > 1) {
    state.gold += 15;
    let soldWeapon = state.inventory.shift();

    UI.text.innerText =
      "Vendiste un(a) " + soldWeapon +
      ". Inventario: " + state.inventory;

    updateStats(state);
  } else {
    UI.text.innerText = "¡No vendas tu única arma!";
  }
}

function fightSlime() {
  state.fighting = 0;
  goFight();
}

function fightBeast() {
  state.fighting = 1;
  goFight();
}

function fightDragon() {
  state.fighting = 2;
  goFight();
}

function goFight() {
  update(locations[3]);

  state.monsterHealth = monsters[state.fighting].health;

  UI.monsterStats.style.display = "block";
  UI.monsterName.innerText = monsters[state.fighting].name;
  UI.monsterHealthText.innerText = state.monsterHealth;
}

function attack() {
  UI.text.innerText =
    "El " + monsters[state.fighting].name + " ataca. ";

  UI.text.innerText +=
    "Atacas con tu " + weapons[state.currentWeapon].name + ".";

  state.health -= getMonsterAttackValue(monsters[state.fighting].level);

  if (isMonsterHit()) {
    state.monsterHealth -=
      weapons[state.currentWeapon].power +
      Math.floor(Math.random() * state.xp) + 1;
  } else {
    UI.text.innerText += " Fallaste.";
  }

  updateStats(state);
  UI.monsterHealthText.innerText = state.monsterHealth;

  if (state.health <= 0) {
    lose();
  } else if (state.monsterHealth <= 0) {
    if (state.fighting === 2) {
      winGame();
    } else {
      defeatMonster();
    }
  }

  if (Math.random() <= 0.1 && state.inventory.length !== 1) {
    UI.text.innerText +=
      " Tu " + state.inventory.pop() + " se rompió.";
    state.currentWeapon--;
  }
}

function getMonsterAttackValue(level) {
  const hit = (level * 5) - Math.floor(Math.random() * state.xp);
  return hit > 0 ? hit : 0;
}

function isMonsterHit() {
  return Math.random() > 0.2 || state.health < 20;
}

function dodge() {
  UI.text.innerText =
    "Esquivaste el ataque del " +
    monsters[state.fighting].name;
}

function defeatMonster() {
  state.gold += Math.floor(monsters[state.fighting].level * 6.7);
  state.xp += monsters[state.fighting].level;

  updateStats(state);
  update(locations[4]);
}

function lose() {
  update(locations[5]);
}

function winGame() {
  update(locations[6]);
}

function restart() {
  state.xp = 0;
  state.health = 100;
  state.gold = 50;
  state.currentWeapon = 0;
  state.inventory = ["stick"];

  updateStats(state);
  goTown();
}

UI.button1.onclick = goStore;
UI.button2.onclick = goCave;
UI.button3.onclick = fightDragon;

updateStats(state);
update(locations[0]);