// Charger comptes enregistrés
let accounts = JSON.parse(localStorage.getItem("accounts")) || {};
let currentUser = localStorage.getItem("currentUser");

function saveAccounts() {
    localStorage.setItem("accounts", JSON.stringify(accounts));
}

function createAccount() {
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();
    const msg = document.getElementById("loginMsg");

    if (!user || !pass) {
        msg.textContent = "Remplis tous les champs.";
        return;
    }

    if (accounts[user]) {
        msg.textContent = "Ce nom existe déjà.";
        return;
    }

    accounts[user] = { password: pass, tokens: 1000 };
    saveAccounts();

    msg.textContent = "Compte créé ! Connecte-toi maintenant.";
}

function login() {
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();
    const msg = document.getElementById("loginMsg");

    if (!user || !pass) {
        msg.textContent = "Remplis tous les champs.";
        return;
    }

    if (!accounts[user] || accounts[user].password !== pass) {
        msg.textContent = "Nom ou mot de passe incorrect.";
        return;
    }

    localStorage.setItem("currentUser", user);

    window.location.href = "casino.html";
}

