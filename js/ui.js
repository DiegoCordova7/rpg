export const UI = {
  button1: document.querySelector('#button1'),
  button2: document.querySelector("#button2"),
  button3: document.querySelector("#button3"),
  text: document.querySelector("#text"),
  xpText: document.querySelector("#xpText"),
  healthText: document.querySelector("#healthText"),
  goldText: document.querySelector("#goldText"),
  monsterStats: document.querySelector("#monsterStats"),
  monsterName: document.querySelector("#monsterName"),
  monsterHealthText: document.querySelector("#monsterHealth")
};

export function updateStats(state) {
  UI.goldText.innerText = state.gold;
  UI.healthText.innerText = state.health;
  UI.xpText.innerText = state.xp;
}