// Récupère les jetons et inventaire du joueur
let playerTokens = parseInt(localStorage.getItem('playerTokens'), 10) || 100;
let playerInventory = JSON.parse(localStorage.getItem('playerInventory') || '[]');

// Inventaire du magasin
const shopInventory = [
  { name: "Potion", price: 500 },
  { name: "Épée", price: 5000 },
  { name: "Armure", price: 10000 },
  { name: "Objet Mystère", price: 50000 }
];

// Met à jour l'affichage du magasin
function updateShopDisplay() {
  document.getElementById('shop-tokens').innerText = playerTokens;
  const shopList = document.getElementById('shop-items');
  shopList.innerHTML = '';

  shopInventory.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${item.name} — ${item.price} jetons
      <button onclick="buyItem('${item.name}')">Acheter</button>
      <button onclick="sellItem('${item.name}')">Vendre</button>
    `;
    shopList.appendChild(li);
  });
}

// Acheter un objet
function buyItem(itemName) {
  const item = shopInventory.find(i => i.name === itemName);
  if (!item) return;

  if (playerTokens < item.price) {
    alert("Pas assez de jetons !");
    return;
  }

  playerTokens -= item.price;
  playerInventory.push(itemName);
  saveData();
  alert(`Vous avez acheté : ${itemName}`);
  updateShopDisplay();
}

// Vendre un objet
function sellItem(itemName) {
  const index = playerInventory.indexOf(itemName);
  if (index === -1) {
    alert("Vous n'avez pas cet objet !");
    return;
  }

  const item = shopInventory.find(i => i.name === itemName);
  const sellPrice = Math.floor(item.price / 2);

  playerTokens += sellPrice;
  playerInventory.splice(index, 1);
  saveData();
  alert(`Vous avez vendu : ${itemName} pour ${sellPrice} jetons`);
  updateShopDisplay();
}

// Sauvegarde les données dans localStorage
function saveData() {
  localStorage.setItem('playerTokens', playerTokens);
  localStorage.setItem('playerInventory', JSON.stringify(playerInventory));
}

// Bouton retour au menu
document.getElementById('back-menu').onclick = () => {
  window.location.href = 'index.html'; // page principale du casino
};

// Initialisation
updateShopDisplay();

function buyItem(itemName) {
  const item = shopInventory.find(i => i.name === itemName);
  if (!item) return;

  if (playerTokens < item.price) {
    alert("Pas assez de jetons !");
    return;
  }

  playerTokens -= item.price;
  playerInventory.push(itemName);
  saveData();
  updateShopDisplay();

  // Afficher une animation flottante
  animatePurchase(itemName);
}

// Fonction pour l'animation flottante
function animatePurchase(text) {
  const pop = document.createElement('div');
  pop.className = 'pop-animation';
  pop.innerText = `+ ${text}!`;
  
  // Position aléatoire sur la page
  pop.style.left = `${window.innerWidth/2 + (Math.random()*100-50)}px`;
  pop.style.top = `${window.innerHeight/2}px`;

  document.body.appendChild(pop);

  // Supprimer après animation
  setTimeout(() => {
    document.body.removeChild(pop);
  }, 1000);
}
if (itemName) animateTokens(Math.min(item.price / 1000, 20));
