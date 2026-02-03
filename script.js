// --- INITIAL DATA ---
let balance = parseFloat(localStorage.getItem("casinoBalance")) || 20000;
let debt = parseFloat(localStorage.getItem("casinoDebt")) || 0;
let lastVisit = localStorage.getItem("lastVisitDate");
let today = new Date().toDateString();

// --- DAILY UPDATES ---
if (lastVisit !== today) {
    const interest = balance > 0 ? balance * 0.10 : 0;
    const debtInt = debt * 0.15;
    debt += debtInt;
    balance += (interest + 1500);
    localStorage.setItem("lastVisitDate", today);
    alert(`☀️ New Day!\nGift: +$1,500\nSavings Interest: +$${Math.floor(interest)}\nDebt Interest: -$${Math.floor(debtInt)}`);
    saveState();
}

function saveState() {
    localStorage.setItem("casinoBalance", balance);
    localStorage.setItem("casinoDebt", debt);
    document.getElementById("balance-display").innerText = "Balance: $" + Math.floor(balance).toLocaleString();
    document.getElementById("debt-display").innerText = "Debt: $" + Math.floor(debt).toLocaleString();
    document.getElementById("balance-display").style.color = balance < 0 ? "#ff4d4d" : "#00ff00";
}

// --- DEBT COLLECTOR ---
function checkCollector() {
    if (debt >= 50000 && Math.random() < 0.10) {
        const take = Math.floor(balance * 0.5);
        if (take > 0) {
            balance -= take;
            debt -= take;
            alert(`⚠️ DEBT COLLECTOR! ⚠️\nWes's goons took 50% ($${take.toLocaleString()}) of your balance to pay your debt.`);
            saveState();
        }
    }
}

// --- BANKING ---
document.getElementById("takeLoanBtn").addEventListener("click", () => {
    if (debt >= 100000) return alert("Wes: You're too high-risk! No more loans.");
    balance += 5000; debt += 5000; saveState();
});
document.getElementById("payLoanBtn").addEventListener("click", () => {
    if (debt <= 0) return alert("No debt!");
    if (balance < 5000) return alert("Need $5k to pay!");
    balance -= 5000; debt -= 5000; saveState();
});

// --- SLOTS ---
const symbols = ["🍒", "🍋", "🔔", "💎", "7️⃣"];
document.getElementById("spinSlotsBtn").addEventListener("click", function() {
    const bet = parseFloat(document.getElementById("slotBet").value) || 0;
    if (bet <= 0 || bet - 10000 > balance) return alert("Invalid bet!");
    balance -= bet; saveState(); this.disabled = true;
    const sEls = [document.getElementById("s1"), document.getElementById("s2"), document.getElementById("s3")];
    sEls.forEach(el => el.classList.add("spinning"));

    setTimeout(() => {
        sEls.forEach(el => el.classList.remove("spinning"));
        const results = [symbols[Math.floor(Math.random()*5)], symbols[Math.floor(Math.random()*5)], symbols[Math.floor(Math.random()*5)]];
        sEls.forEach((el, i) => el.innerText = results[i]);
        let win = 0;
        if (results[0] === results[1] && results[1] === results[2]) win = results[0] === "7️⃣" ? bet * 50 : bet * 15;
        else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) win = bet * 2;
        balance += win; document.getElementById("slotOutput").innerText = win > 0 ? `WIN $${win}!` : "LOSE";
        this.disabled = false; saveState(); checkCollector();
    }, 1200);
});

// --- ROULETTE ---
document.getElementById("spinButton").addEventListener("click", function() {
    const nBet = parseFloat(document.getElementById("numberBet").value) || 0;
    const eoBet = parseFloat(document.getElementById("evenBet").value) || 0;
    const cBet = parseFloat(document.getElementById("colorBet").value) || 0;
    const total = nBet + eoBet + cBet;
    if (total <= 0 || total - 10000 > balance) return alert("Invalid bet!");
    balance -= total; saveState(); this.disabled = true;
    const wheel = document.getElementById("roulette-wheel"); wheel.classList.add("wheel-spin");

    setTimeout(() => {
        wheel.classList.remove("wheel-spin");
        const res = Math.floor(Math.random() * 38);
        const reds = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
        let color = (res === 0 || res === 37) ? "Green" : (reds.includes(res) ? "Red" : "Black");
        wheel.innerText = res === 37 ? "00" : res;
        wheel.style.borderColor = color === "Red" ? "#ff4d4d" : (color === "Black" ? "#fff" : "#00ff00");
        let win = 0;
        if ((document.getElementById("numberInput").value === "00" && res === 37) || parseInt(document.getElementById("numberInput").value) === res) win += nBet * 36;
        if (res !== 0 && res !== 37) {
            let choice = document.getElementById("evenInput").value;
            if (((res % 2 === 0) && choice === "Even") || ((res % 2 !== 0) && choice === "Odd")) win += eoBet * 2;
            if (document.getElementById("colorInput").value === color) win += cBet * 2;
        }
        balance += win; document.getElementById("rouletteOutput").innerText = `Landed ${color} ${res === 37 ? '00' : res}!`;
        this.disabled = false; saveState(); checkCollector();
    }, 1500);
});

// --- BLACKJACK ---
let deck = [], pHand = [], dHand = [], bjBet = 0;
function createDeck() {
    const suits = ["♠", "♥", "♦", "♣"], vals = [{n:"A", v:11}, {n:"2", v:2}, {n:"3", v:3}, {n:"4", v:4}, {n:"5", v:5}, {n:"6", v:6}, {n:"7", v:7}, {n:"8", v:8}, {n:"9", v:9}, {n:"10", v:10}, {n:"J", v:10}, {n:"Q", v:10}, {n:"K", v:10}];
    deck = []; for (let s of suits) for (let v of vals) deck.push({ name: v.n + s, value: v.v });
    deck.sort(() => Math.random() - 0.5);
}
function getScore(hand) {
    let s = 0, a = 0; for (let c of hand) { s += c.value; if(c.name.includes("A")) a++; }
    while (s > 21 && a > 0) { s -= 10; a--; } return s;
}
document.getElementById("dealBtn").addEventListener("click", () => {
    bjBet = parseFloat(document.getElementById("bjBet").value) || 0;
    if (bjBet <= 0 || bjBet - 10000 > balance) return alert("Invalid bet!");
    balance -= bjBet; createDeck();
    pHand = [deck.pop(), deck.pop()]; dHand = [deck.pop(), deck.pop()];
    updateBjUI(false); document.getElementById("dealBtn").disabled = true;
    document.getElementById("hitBtn").disabled = false; document.getElementById("stayBtn").disabled = false;
    document.getElementById("blackjackOutput").innerText = "Hit or Stay?"; saveState();
});
document.getElementById("hitBtn").addEventListener("click", () => {
    pHand.push(deck.pop()); updateBjUI(false);
    if (getScore(pHand) > 21) { document.getElementById("blackjackOutput").innerText = "Bust!"; endBj(0); }
});
document.getElementById("stayBtn").addEventListener("click", () => {
    while (getScore(dHand) < 17) dHand.push(deck.pop()); updateBjUI(true);
    let pS = getScore(pHand), dS = getScore(dHand);
    if (dS > 21 || pS > dS) endBj(bjBet * 2); else if (pS === dS) endBj(bjBet); else endBj(0);
});
function updateBjUI(show) {
    document.getElementById("player-hand").innerText = "Player: " + pHand.map(c=>c.name).join(", ") + " ("+getScore(pHand)+")";
    document.getElementById("dealer-hand").innerText = "Dealer: " + (show ? dHand.map(c=>c.name).join(", ") + " ("+getScore(dHand)+")" : dHand[0].name + ", [Hidden]");
}
function endBj(pay) {
    balance += pay; document.getElementById("blackjackOutput").innerText = pay > bjBet ? "Win!" : (pay === bjBet ? "Push" : "Loss");
    document.getElementById("dealBtn").disabled = false; document.getElementById("hitBtn").disabled = true; document.getElementById("stayBtn").disabled = true;
    saveState(); checkCollector();
}

saveState();
