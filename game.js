// casino.js (version robuste et corrigée)
document.addEventListener('DOMContentLoaded', () => {
  try {
    // ---------------------------
    // STATE
    // ---------------------------
    let playerTokens = parseInt(localStorage.getItem('playerTokens')) || 100;
    let playerName = localStorage.getItem('playerName') || '';

    // ---------------------------
    // GET DOM ELEMENTS (sûrs)
    // ---------------------------
    const $ = id => document.getElementById(id);
    const loginBox = $('login-box');
    const header = $('header');
    const menu = $('menu');
    const tokenBalance = $('token-balance');
    const messageArea = $('message-area');
    const gameArea = $('game-area');
    const gameContainer = $('game-container');
    const shopArea = $('shop-area'); // IMPORTANT: correspond à l'HTML fourni
    const shopItems = $('shop-items');
    const closeShopBtn = $('close-shop');
    const leaderboardArea = $('leaderboard-area');
    const leaderboardList = $('leaderboard-list');

    // Sanity checks (log helpful errors)
    if (!tokenBalance) console.error('Element #token-balance introuvable dans le DOM.');
    if (!messageArea) console.error('Element #message-area introuvable dans le DOM.');
    if (!gameContainer) console.error('Element #game-container introuvable dans le DOM.');
    if (!menu) console.error('Element #menu introuvable dans le DOM.');

    // ---------------------------
    // HELPERS
    // ---------------------------
    function saveTokens() {
      localStorage.setItem('playerTokens', playerTokens);
    }
    function updateTokensUI() {
      if (tokenBalance) {
        tokenBalance.innerText = `Jetons : ${playerTokens}`;
        tokenBalance.classList.add('animate');
        setTimeout(() => tokenBalance.classList.remove('animate'), 300);
      }
      saveTokens();
    }
    function showMessage(text, duration = 3000) {
      if (!messageArea) {
        console.warn('messageArea absent — message:', text);
        return;
      }
      messageArea.innerText = text;
      messageArea.style.opacity = '1';
      // clear after duration
      clearTimeout(showMessage._timeout);
      showMessage._timeout = setTimeout(() => {
        messageArea.innerText = '';
        messageArea.style.opacity = '0';
      }, duration);
    }
    function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function animateTokens(count = 10) {
      const container = $('token-animation');
      if (!container) return;
      for (let i = 0; i < count; i++) {
        const token = document.createElement('div');
        token.innerText = '💰';
        Object.assign(token.style, {
          position: 'absolute',
          fontSize: `${10 + Math.random() * 24}px`,
          left: `${Math.random() * window.innerWidth}px`,
          top: '-40px',
          opacity: '1',
          transition: 'transform 1.8s linear, opacity 1.8s linear',
          pointerEvents: 'none',
          zIndex: 9999
        });
        container.appendChild(token);
        setTimeout(() => {
          token.style.transform = `translateY(${window.innerHeight + 80}px) rotate(${Math.random() * 720}deg)`;
          token.style.opacity = '0';
        }, 30);
        setTimeout(() => container.removeChild(token), 1900);
      }
    }

    // Persist leaderboard entry for current user
    function saveLeaderboardEntry() {
      const name = playerName || 'Joueur';
      let lb = [];
      try { lb = JSON.parse(localStorage.getItem('leaderboard') || '[]'); } catch(e){ lb = []; }
      const existing = lb.find(e => e.name === name);
      if (existing) {
        if (playerTokens > existing.tokens) existing.tokens = playerTokens;
      } else {
        lb.push({ name, tokens: playerTokens });
      }
      lb.sort((a,b) => b.tokens - a.tokens);
      localStorage.setItem('leaderboard', JSON.stringify(lb.slice(0,10)));
    }
    function renderLeaderboard() {
      if (!leaderboardList) return;
      let lb = [];
      try { lb = JSON.parse(localStorage.getItem('leaderboard') || '[]'); } catch(e) { lb = []; }
      leaderboardList.innerHTML = '';
      if (lb.length === 0) {
        const li = document.createElement('li'); li.innerText = 'Aucun joueur'; leaderboardList.appendChild(li);
        return;
      }
      lb.forEach((e,i) => {
        const li = document.createElement('li'); li.innerText = `${i+1}. ${e.name} — ${e.tokens} jetons`;
        leaderboardList.appendChild(li);
      });
    }

    // ---------------------------
    // LOGIN & UI INIT
    // ---------------------------
    const createBtn = $('create-account');
    const connectBtn = $('connect');
    const usernameInput = $('username');

    if (createBtn) createBtn.addEventListener('click', () => {
      const name = (usernameInput && usernameInput.value.trim()) || '';
      if (!name) { showMessage('Pseudo invalide'); return; }
      playerName = name;
      playerTokens = 100;
      localStorage.setItem('playerName', playerName);
      saveTokens();
      showCasinoUI();
      showMessage(`Compte créé : ${playerName}`);
    });

    if (connectBtn) connectBtn.addEventListener('click', () => {
      const name = (usernameInput && usernameInput.value.trim()) || '';
      if (!name) { showMessage('Pseudo invalide'); return; }
      playerName = name;
      // keep tokens saved previously for this browser user
      playerTokens = parseInt(localStorage.getItem('playerTokens')) || 100;
      localStorage.setItem('playerName', playerName);
      showCasinoUI();
      showMessage(`Connecté : ${playerName}`);
    });

    function showCasinoUI() {
      if (loginBox) loginBox.classList.add('hidden');
      if (header) header.classList.remove('hidden');
      if (menu) menu.classList.remove('hidden');
      updateTokensUI();
    }

    // refill button (if present)
    const refillBtn = $('refill-tokens');
    if (refillBtn) refillBtn.addEventListener('click', () => {
      if (playerTokens > 0) { showMessage("Tu as encore des jetons !"); return; }
      playerTokens = 100; updateTokensUI(); showMessage("Tes jetons ont été rechargés !");
    });

    // ---------------------------
    // GAME NAV / ROUTER
    // ---------------------------
    window.openGame = function(name) {
      if (menu) menu.classList.add('hidden');
      if (leaderboardArea) leaderboardArea.classList.add('hidden');
      if (shopArea) shopArea.classList.add('hidden');
      if (gameArea) gameArea.classList.remove('hidden');
      if (!gameContainer) { console.error('#game-container missing'); return; }
      gameContainer.innerHTML = '';
      switch(name) {
        case 'slots': return loadSlots(gameContainer);
        case 'roulette': return loadRoulette(gameContainer);
        case 'dice': return loadDice(gameContainer);
        case 'wheel': return loadWheel(gameContainer);
        case 'coinFlip': return loadCoinFlip(gameContainer);
        case 'guessNumber': return loadGuessNumber(gameContainer);
        case 'blackjack': return loadBlackjack(gameContainer);
        default: showMessage('Jeu inconnu'); console.warn('openGame unknown:', name);
      }
    };

    const closeGameBtn = $('close-game');
    if (closeGameBtn) closeGameBtn.addEventListener('click', () => {
      if (gameArea) gameArea.classList.add('hidden');
      if (menu) menu.classList.remove('hidden');
      updateTokensUI();
    });

    // ---------------------------
    // GAMES IMPLEMENTATION
    // ---------------------------

    // Slots
    function loadSlots(container) {
      container.innerHTML = `
        <h2>🎰 Machine à sous</h2>
        <div id="slot-reel" style="font-size:42px;margin:12px 0">🍒 🍋 🍉</div>
        <div class="control-group">
          <input id="slot-bet" type="number" min="1" value="10" />
          <button id="slot-spin">SPIN</button>
        </div>
        <p id="slot-msg" class="msg"></p>
      `;
      const reel = $('slot-reel');
      const spin = $('slot-spin');
      if (!spin) { console.error('slot-spin absent'); return; }
      spin.onclick = () => {
        const bet = parseInt($('slot-bet').value, 10) || 0;
        if (bet <= 0) { showMessage('Mise invalide'); return; }
        if (playerTokens < bet) { showMessage('Pas assez de jetons'); return; }
        playerTokens -= bet; updateTokensUI();
        const sy = ['🍒','🍋','🍉','⭐','7️⃣'];
        const r = [rand(sy), rand(sy), rand(sy)];
        if (reel) { reel.style.opacity = '0.4'; setTimeout(()=> reel.innerText = r.join(' '), 160); setTimeout(()=> reel.style.opacity='1', 260); }
        let gain=0;
        if (r[0]===r[1] && r[1]===r[2]) gain = bet*10;
        else if (r[0]===r[1]||r[1]===r[2]||r[0]===r[2]) gain = bet*2;
        playerTokens += gain; updateTokensUI();
        if (gain>0) { animateTokens(Math.min(20,Math.ceil(gain/5))); showMessage(`Bravo ! +${gain} jetons`); }
        else showMessage('Perdu');
        saveLeaderboardEntry();
      };
    }

    // Roulette
    function loadRoulette(container) {
      container.innerHTML = `
        <h2>🎡 Roulette</h2>
        <div class="control-group">
          <input id="roulette-bet" type="number" min="1" value="10" />
          <select id="roulette-type">
            <option value="pair">Pair (x2)</option>
            <option value="impair">Impair (x2)</option>
            <option value="plein">Plein (x35)</option>
          </select>
          <button id="roulette-spin">TOURNER</button>
        </div>
        <p id="roulette-msg" class="msg"></p>
      `;
      const spin = $('roulette-spin');
      if (!spin) { console.error('roulette-spin absent'); return; }
      spin.onclick = () => {
        const bet = parseInt($('roulette-bet').value,10) || 0;
        if (bet <= 0) { showMessage('Mise invalide'); return; }
        if (playerTokens < bet) { showMessage('Pas assez de jetons'); return; }
        playerTokens -= bet; updateTokensUI();
        const number = Math.floor(Math.random()*37); // 0..36
        let win = 0;
        const type = $('roulette-type').value;
        if (type === 'pair' && number !== 0 && number % 2 === 0) win = bet*2;
        if (type === 'impair' && number % 2 === 1) win = bet*2;
        if (type === 'plein') {
          // simplified: random pick vs result
          const pick = Math.floor(Math.random()*37);
          if (pick === number) win = bet*35;
        }
        playerTokens += win; updateTokensUI();
        if (win>0) { animateTokens(Math.min(20,Math.ceil(win/5))); showMessage(`N° ${number} — Gain: ${win}`); }
        else showMessage(`N° ${number} — Perdu`);
        saveLeaderboardEntry();
      };
    }

    // Dice
    function loadDice(container) {
      container.innerHTML = `
        <h2>🎲 Dés</h2>
        <div class="control-group">
          <input id="dice-bet" type="number" min="1" value="5" />
          <button id="dice-roll">LANCER</button>
        </div>
        <p id="dice-msg" class="msg"></p>
      `;
      const roll = $('dice-roll');
      if (!roll) { console.error('dice-roll absent'); return; }
      roll.onclick = () => {
        const bet = parseInt($('dice-bet').value,10) || 0;
        if (bet<=0) { showMessage('Mise invalide'); return; }
        if (playerTokens < bet) { showMessage('Pas assez de jetons'); return; }
        playerTokens -= bet; updateTokensUI();
        const a = 1 + Math.floor(Math.random()*6);
        const b = 1 + Math.floor(Math.random()*6);
        let gain = 0;
        if (a === b) gain = bet*6;
        playerTokens += gain; updateTokensUI();
        if (gain>0) { animateTokens(Math.min(20,Math.ceil(gain/5))); showMessage(`Double ${a}! +${gain}`); }
        else showMessage(`Résultat: ${a} & ${b} — Perdu`);
        saveLeaderboardEntry();
      };
    }

    // Coin flip
    function loadCoinFlip(container) {
      container.innerHTML = `
        <h2>🪙 Pile ou Face</h2>
        <div class="control-group">
          <input id="coin-bet" type="number" min="1" value="10" />
          <select id="coin-choice"><option value="pile">Pile</option><option value="face">Face</option></select>
          <button id="coin-spin">Lancer</button>
        </div>
        <p id="coin-msg" class="msg"></p>
      `;
      const spin = $('coin-spin');
      if (!spin) { console.error('coin-spin absent'); return; }
      spin.onclick = () => {
        const bet = parseInt($('coin-bet').value,10) || 0;
        const choice = $('coin-choice').value;
        if (bet<=0) { showMessage('Mise invalide'); return; }
        if (playerTokens < bet) { showMessage('Pas assez de jetons'); return; }
        playerTokens -= bet; updateTokensUI();
        const res = Math.random() < 0.5 ? 'pile' : 'face';
        const gain = res === choice ? bet*2 : 0;
        playerTokens += gain; updateTokensUI();
        if (gain>0) { animateTokens(Math.min(20,Math.ceil(gain/5))); showMessage(`C'est ${res}! +${gain}`); }
        else showMessage(`C'est ${res}! Perdu`);
        saveLeaderboardEntry();
      };
    }

    // Guess number
    function loadGuessNumber(container) {
      container.innerHTML = `
        <h2>🔢 Chiffre Mystère (1-5)</h2>
        <div class="control-group">
          <input id="guess-bet" type="number" min="1" value="10" />
          <input id="guess-number" type="number" min="1" max="5" value="1" />
          <button id="guess-btn">Deviner</button>
        </div>
        <p id="guess-msg" class="msg"></p>
      `;
      const btn = $('guess-btn');
      if (!btn) { console.error('guess-btn absent'); return; }
      btn.onclick = () => {
        const bet = parseInt($('guess-bet').value,10) || 0;
        const guess = parseInt($('guess-number').value,10) || 0;
        if (bet<=0 || guess < 1 || guess > 5) { showMessage('Mise ou chiffre invalide'); return; }
        if (playerTokens < bet) { showMessage('Pas assez de jetons'); return; }
        playerTokens -= bet; updateTokensUI();
        const num = 1 + Math.floor(Math.random()*5);
        const gain = guess === num ? bet*5 : 0;
        playerTokens += gain; updateTokensUI();
        if (gain>0) { animateTokens(Math.min(20,Math.ceil(gain/5))); showMessage(`Bravo ! ${num} ✅ +${gain}`); }
        else showMessage(`Perdu ! Le chiffre était ${num}`);
        saveLeaderboardEntry();
      };
    }

    // Blackjack (simple hit/stand could be extended)
    function loadBlackjack(container) {
      container.innerHTML = `
        <h2>🃏 Blackjack (version simple)</h2>
        <div class="control-group">
          <input id="bj-bet" type="number" min="1" value="50" />
          <button id="bj-deal">Distribuer</button>
        </div>
        <div id="bj-table" style="margin-top:12px"></div>
        <div id="bj-controls" style="margin-top:12px"></div>
        <p id="bj-msg" class="msg"></p>
      `;
      const dealBtn = $('bj-deal');
      if (!dealBtn) { console.error('bj-deal absent'); return; }
      let deck = [], playerHand = [], dealerHand = [], betAmount = 0;

      function newDeck() {
        const suits = ['♠','♥','♦','♣'];
        const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
        const d = [];
        suits.forEach(s => ranks.forEach(r => d.push({r,s})));
        for (let i=d.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [d[i],d[j]]=[d[j],d[i]]; }
        return d;
      }
      function value(hand) {
        let total=0, aces=0;
        hand.forEach(c=>{ if(c.r==='A'){ aces++; total+=11 } else if(['J','Q','K'].includes(c.r)) total+=10; else total+=Number(c.r); });
        while(total>21 && aces>0){ total-=10; aces--; }
        return total;
      }
      function render() {
        const table = $('bj-table');
        if(!table) return;
        table.innerHTML = `Joueur: ${playerHand.map(c=>c.r+c.s).join(' ')} (${value(playerHand)})<br>Dealer: ${dealerHand.map(c=>c.r+c.s).join(' ')} (${value(dealerHand)})`;
      }
      dealBtn.onclick = () => {
        const bet = parseInt($('bj-bet').value,10) || 0;
        if (bet<=0) { showMessage('Mise invalide'); return; }
        if (playerTokens < bet) { showMessage('Pas assez de jetons'); return; }
        betAmount = bet;
        playerTokens -= bet; updateTokensUI();
        deck = newDeck(); playerHand=[deck.pop(),deck.pop()]; dealerHand=[deck.pop(),deck.pop()];
        render();
        const controls = $('bj-controls'); if(!controls) return;
        controls.innerHTML = `<button id="bj-hit" class="game-btn">Tirer</button> <button id="bj-stand" class="game-btn">Rester</button>`;
        $('bj-hit').onclick = () => {
          playerHand.push(deck.pop()); render();
          if (value(playerHand) > 21) {
            $('bj-controls').innerHTML=''; showMessage('Bust! Tu perds'); saveLeaderboardEntry();
          }
        };
        $('bj-stand').onclick = () => {
          // dealer auto play
          while (value(dealerHand) < 17) dealerHand.push(deck.pop());
          render();
          const pv = value(playerHand), dv = value(dealerHand);
          let payout = 0;
          if (pv>21) payout = 0;
          else if (dv>21 || pv>dv) payout = betAmount*2;
          else if (pv===dv) payout = betAmount;
          playerTokens += payout; updateTokensUI();
          if (payout>0) { animateTokens(Math.min(20,Math.ceil(payout/20))); showMessage(`Résultat: +${payout} jetons`); }
          else showMessage('Le dealer gagne. Perdu.');
          $('bj-controls').innerHTML='';
          saveLeaderboardEntry();
        };
      };
    }

    // ---------------------------
    // SHOP
    // ---------------------------
    window.openShop = function() {
      if (menu) menu.classList.add('hidden');
      if (leaderboardArea) leaderboardArea.classList.add('hidden');
      if (gameArea) gameArea.classList.add('hidden');
      if (shopArea) shopArea.classList.remove('hidden');
      if (!shopItems) return console.error('#shop-items missing');
      shopItems.innerHTML = '';
      const items = [
        {id:'hat', name:'Chapeau VIP', price:500},
        {id:'skin', name:'Skin Cartes', price:1200},
        {id:'pack', name:'Pack Bonus +500', price:1000}
      ];
      items.forEach(it => {
        const b = document.createElement('button');
        b.innerText = `${it.name} — ${it.price} jetons`;
        b.onclick = () => {
          if (playerTokens < it.price) { showMessage("Pas assez de jetons"); return; }
          playerTokens -= it.price; updateTokensUI();
          animatePurchase(it.name);
          showMessage(`Achat réussi : ${it.name}`);
          if (it.id === 'pack') { playerTokens += 500; updateTokensUI(); showMessage('+500 bonus ajouté'); }
        };
        shopItems.appendChild(b);
      });
    };
    if (closeShopBtn) closeShopBtn.addEventListener('click', () => {
      if (shopArea) shopArea.classList.add('hidden');
      if (menu) menu.classList.remove('hidden');
    });

    // ---------------------------
    // LEADERBOARD UI
    // ---------------------------
    window.openLeaderboard = function() {
      if (menu) menu.classList.add('hidden');
      if (gameArea) gameArea.classList.add('hidden');
      if (shopArea) shopArea.classList.add('hidden');
      if (leaderboardArea) leaderboardArea.classList.remove('hidden');
      renderLeaderboard();
    };
    window.closeLeaderboard = function(){
      if (leaderboardArea) leaderboardArea.classList.add('hidden');
      if (menu) menu.classList.remove('hidden');
    };

    // ---------------------------
    // EXTRA ANIMATIONS
    // ---------------------------
    function animatePurchase(name) {
      const el = document.createElement('div');
      el.innerText = name;
      Object.assign(el.style, {
        position:'fixed', left:'50%', top:'50%', transform:'translate(-50%,-50%) scale(0)',
        fontSize:'3rem', color:'#ffd700', zIndex:99999, transition:'transform .5s ease, opacity .5s ease'
      });
      document.body.appendChild(el);
      setTimeout(()=> el.style.transform='translate(-50%,-50%) scale(1.4)', 10);
      setTimeout(()=> { el.style.transform='translate(-50%,-50%) scale(0)'; el.style.opacity='0'; }, 800);
      setTimeout(()=> document.body.removeChild(el), 1300);
    }

    // ---------------------------
    // INIT UI if already logged in
    // ---------------------------
    if (playerName) showCasinoUI();
    else {
      // ensure login box visible
      if (loginBox) loginBox.classList.remove('hidden');
    }

    // Expose some state for debugging in console
    window.__casinoState = () => ({ playerName, playerTokens });

  } catch (err) {
    console.error('Erreur initialisation casino.js:', err);
  }
});

/***********************
 * ETAT DU JOUEUR
 ***********************/
let playerTokens = Number(localStorage.getItem("tokens")) || 100;

const tokenDisplay = document.getElementById("token-balance");
const messageBox = document.getElementById("game-message");

function saveTokens() {
  localStorage.setItem("tokens", playerTokens);
}

function updateTokens() {
  if (tokenDisplay) tokenDisplay.textContent = `Jetons : ${playerTokens}`;
  saveTokens();
}

function showMessage(text, win = false) {
  if (!messageBox) return;
  messageBox.textContent = text;
  messageBox.className = win ? "msg win" : "msg lose";
}

/***********************
 * NE PAS ALLER EN DESSOUS DE 0
 ***********************/
function canBet(amount) {
  return playerTokens >= amount && amount > 0;
}

/***********************
 * JEU : DOUBLE OU RIEN
 ***********************/
const doubleBtn = document.getElementById("double-btn");
if (doubleBtn) {
  doubleBtn.onclick = () => {
    const bet = Number(document.getElementById("bet-amount").value);

    if (!canBet(bet)) {
      showMessage("❌ Mise invalide", false);
      return;
    }

    const win = Math.random() < 0.5;

    if (win) {
      playerTokens += bet;
      showMessage(`✅ Gagné ! +${bet} jetons`, true);
    } else {
      playerTokens -= bet;
      if (playerTokens < 0) playerTokens = 0;
      showMessage(`❌ Perdu ! -${bet} jetons`, false);
    }

    updateTokens();
  };
}

/***********************
 * JEU : SLOTS (simple)
 ***********************/
const slotBtn = document.getElementById("slot-btn");
if (slotBtn) {
  slotBtn.onclick = () => {
    const bet = Number(document.getElementById("bet-amount").value);

    if (!canBet(bet)) {
      showMessage("❌ Pas assez de jetons", false);
      return;
    }

    playerTokens -= bet;

    const symbols = ["🍒", "🍋", "🍉"];
    const s1 = symbols[Math.floor(Math.random() * 3)];
    const s2 = symbols[Math.floor(Math.random() * 3)];
    const s3 = symbols[Math.floor(Math.random() * 3)];

    const reel = document.getElementById("slots");
    if (reel) reel.textContent = `${s1} ${s2} ${s3}`;

    if (s1 === s2 && s2 === s3) {
      const winAmount = bet * 5;
      playerTokens += winAmount;
      showMessage(`🎉 Jackpot ! +${winAmount} jetons`, true);
    } else {
      showMessage("😢 Perdu...", false);
    }

    updateTokens();
  };
}

/***********************
 * RECHARGER JETONS
 ***********************/
const refillBtn = document.getElementById("refill-btn");
if (refillBtn) {
  refillBtn.onclick = () => {
    if (playerTokens > 0) {
      showMessage("⚠️ Tu as encore des jetons", false);
      return;
    }
    playerTokens = 100;
    showMessage("✅ Jetons rechargés !", true);
    updateTokens();
  };
}

/***********************
 * INITIALISATION
 ***********************/
updateTokens();

// -----------------------------------
//  DOUBLE OU RIEN (NOUVELLE FONCTION)
// -----------------------------------

const doubleBtns = document.getElementById("double-or-nothing");

// Vérifie l'affichage du bouton
function checkDoubleOrNothing() {
    if (playerTokens >= 500000) {
        doubleBtns.style.display = "block";
    } else {
        doubleBtns.style.display = "none";
    }
}

// On l'appelle dans updateTokens
const originalUpdateTokens = updateTokens;
updateTokens = function () {
    originalUpdateTokens();
    checkDoubleOrNothing();
};

// Logique du jeu Double ou Rien
doubleBtns.onclick = () => {
    if (playerTokens < 500000) return;

    const confirmPlay = confirm(
        "⚠️ DOUBLE OU RIEN ⚠️\n\nTu peux doubler tes jetons… ou tout perdre.\nTu es sûr ?"
    );

    if (!confirmPlay) return;

    const win = Math.random() < 0.5; // 50/50

    if (win) {
        playerTokens *= 2;
        alert("🔥 INCROYABLE ! TU AS DOUBLÉ TES JETONS !");
        animateTokens(50);
    } else {
        playerTokens = 0; 
        alert("💀 MALHEUR… TU AS TOUT PERDU.");
    }

    updateTokens();
};

function buyItem(itemName, price, element) {
  if(playerTokens < price) {
    showPurchaseMsg("Pas assez de jetons !");
    return;
  }
  playerTokens -= price;
  updateTokens();
  
  // Animation de l’item acheté
  element.classList.add('item-bought');
  setTimeout(() => element.classList.remove('item-bought'), 700);

  // Message en bas
  showPurchaseMsg(`Tu as acheté : ${itemName} !`);
}

// Afficher le message d’achat
function showPurchaseMsg(msg) {
  const purchaseMsg = document.getElementById('purchase-msg');
  purchaseMsg.innerText = msg;
}




// ---------------------------
// CHAT
// ---------------------------
const chatMessages = document.getElementById('chat-messages');

document.getElementById('send-chat').onclick = () => {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  if (message !== '') {
    addChatMessage(`Moi: ${message}`);
    input.value = '';
  }
};

function addChatMessage(msg){
  const p = document.createElement('p');
  p.innerText = msg;
  chatMessages.appendChild(p);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Messages simulés d'autres joueurs
setInterval(() => {
  const messages = [
    "JoueurX a gagné 200 jetons !",
    "JoueurY a acheté un booster !",
    "JoueurZ a ouvert un coffre mystère !",
    "JoueurW a perdu au blackjack !"
  ];
  addChatMessage(messages[Math.floor(Math.random() * messages.length)]);
}, 8000);

// ---------------------------
// COFFRE MYSTÈRE
// ---------------------------
document.getElementById('open-chest').onclick = () => {
  const gain = Math.floor(Math.random() * 5000) + 500;
  playerTokens += gain;
  updateTokens();
  addChatMessage(`🎁 Coffre Mystère ouvert ! +${gain} jetons`);
  animateTokens(Math.min(gain / 10, 30));
};

// ---------------------------
// MISES À JOUR DU BALANCE
// ---------------------------
function updateTokens(){
  const balance = document.getElementById('token-balance');
  balance.innerText = `Jetons : ${playerTokens}`;
  balance.classList.add('animate');
  setTimeout(() => balance.classList.remove('animate'), 500);
  localStorage.setItem('playerTokens', playerTokens);
}

// ---------------------------
// ANIMATION DES JETONS
// ---------------------------
function animateTokens(count){
  const container = document.getElementById('token-animation');
  for (let i = 0; i < count; i++){
    const token = document.createElement('div');
    token.innerText = '💰';
    token.style.position = 'absolute';
    token.style.fontSize = `${10 + Math.random() * 20}px`;
    token.style.left = `${Math.random() * window.innerWidth}px`;
    token.style.top = '-30px';
    token.style.opacity = 1;
    token.style.transition = 'transform 2s ease, opacity 2s ease';
    container.appendChild(token);

    setTimeout(() => {
      token.style.transform = `translateY(${window.innerHeight + 50}px) rotate(${Math.random() * 360}deg)`;
      token.style.opacity = 0;
    }, 50);

    setTimeout(() => container.removeChild(token), 2100);
  }
}

// JS
const musics = [
  document.getElementById('music1'),
  document.getElementById('music2')
  
];
let currentMusic = 0;

document.getElementById('play-music').onclick = () => {
  musics[currentMusic].play().catch(err => console.log(err));
};

document.getElementById('change-music').onclick = () => {
  musics[currentMusic].pause();
  musics[currentMusic].currentTime = 0;
  currentMusic = (currentMusic + 1) % musics.length;
  musics[currentMusic].play().catch(err => console.log(err));
};



