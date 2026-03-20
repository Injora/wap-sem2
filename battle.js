document.addEventListener("DOMContentLoaded", () => {
    startBattle();
});
const impactTexts = ["CLASH!", "FINISH HIM!", "OVERPOWERED!", "DEVASTATING!", "CRITICAL HIT!"];
const quotes = [
    "I won't lose here!",
    "Is that all you've got?",
    "Bankai...",
    "You're wide open!",
    "Too slow!",
    "Burn into ashes!",
    "Shatter, Kyoka Suigetsu."
];
function normalizeName(name) {
    if (!name) return "";
    return name.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z\s]/g, "")
        .trim();
}

const bankaiMap = {
    "genryusai shigekuni yamamoto": "Zanka no Tachi",
    "shigekuni yamamoto genryusai": "Zanka no Tachi",
    "yamamoto": "Zanka no Tachi",
    "shunsui kyoraku": "Katen Kyokotsu: Karamatsu Shinju",
    "chojiro sasakibe": "Koko Gonryo Rikyu",
    "sui feng": "Jakuho Raikoben",
    "soi fon": "Jakuho Raikoben",
    "gin ichimaru": "Kamishini no Yari",
    "rojuro otoribashi": "Kinshara Butodan",
    "rose": "Kinshara Butodan",
    "retsu unohana": "Minazuki",
    "byakuya kuchiki": "Senbonzakura Kageyoshi",
    "renji abarai": "Hihio Zabimaru / Soo Zabimaru",
    "sajin komamura": "Kokujo Tengen Myoo",
    "kaname tosen": "Suzumushi Tsuishiki: Enma Korogi",
    "kensei muguruma": "Tekken Tachikaze",
    "toshiro hitsugaya": "Daiguren Hyorinmaru",
    "ikkaku madarame": "Ryumon Hozukimaru",
    "mayuri kurotsuchi": "Konjiki Ashisogi Jizo",
    "kisuke urahara": "Kannonbiraki Benihime Aratame",
    "rukia kuchiki": "Hakka no Togame",
    "ichibe hyosube": "Shirafude Ichimonji",
    "kugo ginjo": "Trash",
    "ichigo kurosaki": "Tensa Zangetsu"
};

const quincyMap = {
    "yhwach": "A - The Almighty",
    "uryu ishida": "A - The Antithesis",
    "jugram haschwalth": "B - The Balance",
    "askin nakk le vaar": "D - The Deathdealing",
    "bambietta basterbine": "E - The Explode",
    "as nodt": "F - The Fear",
    "liltotto lamperd": "G - The Glutton",
    "bazz b": "H - The Heat",
    "cang du": "I - The Iron",
    "quilge opie": "J - The Jail",
    "pepe waccabrada": "L - The Love",
    "pernida parnkgjas": "C - The Compulsory",
    "gerard valkyrie": "M - The Miracle",
    "driscoll berci": "O - The Overkill",
    "meninas mcallon": "P - The Power",
    "berenice gabrielli": "Q - The Question",
    "jerome guizbatt": "R - The Roar",
    "mask de masculine": "S - The Superstar",
    "candice catnipp": "T - The Thunderbolt",
    "nanana najahkoop": "U - The Underbelly",
    "gremmy thoumeaux": "V - The Visionary",
    "nianzol weizol": "W - The Wind",
    "royd lloyd": "Y - The Yourself",
    "loyd lloyd": "Y - The Yourself",
    "giselle gewelle": "Z - The Zombie",
    "bg9": "K",
    "robert accutrone": "N"
};
let p1Team = [];
let p2Team = [];
let p1Fighter = null;
let p2Fighter = null;
const p1Roster = document.getElementById("p1_roster");
const p2Roster = document.getElementById("p2_roster");
const p1Zone = document.getElementById("p1_zone");
const p2Zone = document.getElementById("p2_zone");
const p1Img = document.getElementById("p1_img");
const p2Img = document.getElementById("p2_img");
const p1Name = document.getElementById("p1_name");
const p2Name = document.getElementById("p2_name");
const p1HpFill = document.getElementById("p1_hp_fill");
const p2HpFill = document.getElementById("p2_hp_fill");
const p1HpText = document.getElementById("p1_hp_text");
const p2HpText = document.getElementById("p2_hp_text");
const p1Quote = document.getElementById("p1_quote");
const p2Quote = document.getElementById("p2_quote");
const flashOverlay = document.getElementById("flash_overlay");
const impactTextEl = document.getElementById("impact_text");
const battleLog = document.getElementById("battle_log");
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
function logMsg(msg, type = "normal") {
    const div = document.createElement("div");
    div.className = `log-entry log-${type}`;
    div.innerHTML = `> ${msg}`;
    battleLog.appendChild(div);
    battleLog.scrollTop = battleLog.scrollHeight;
}
async function startBattle() {
    const rawP1 = localStorage.getItem("p1Team");
    const rawP2 = localStorage.getItem("p2Team");
    if (!rawP1 || !rawP2) {
        alert("Teams not found! Redirecting back...");
        window.location.href = "index.html";
        return;
    }
    p1Team = JSON.parse(rawP1).map(c => ({...c, currentBP: c.bp, maxBP: c.bp, dead: false, hasTransformed: false}));
    p2Team = JSON.parse(rawP2).map(c => ({...c, currentBP: c.bp, maxBP: c.bp, dead: false, hasTransformed: false}));
    p1Team.sort((a,b) => a.bp - b.bp);
    p2Team.sort((a,b) => a.bp - b.bp);
    initRosterIcons();
    logMsg("Both teams have arrived on the battlefield...", "clash");
    await sleep(1500);
    await nextFight();
}
function initRosterIcons() {
    p1Roster.innerHTML = "";
    p2Roster.innerHTML = "";
    p1Team.forEach((c, i) => {
        p1Roster.innerHTML += `<img id="p1_icon_${i}" src="${c.image}" class="mini-icon" title="${c.name}">`;
    });
    p2Team.forEach((c, i) => {
        p2Roster.innerHTML += `<img id="p2_icon_${i}" src="${c.image}" class="mini-icon" title="${c.name}">`;
    });
}
function updateRosterIcons() {
    p1Team.forEach((c, i) => {
        const icon = document.getElementById(`p1_icon_${i}`);
        icon.className = `mini-icon ${c.dead ? 'icon-dead' : ''} ${c === p1Fighter ? 'icon-active' : ''}`;
    });
    p2Team.forEach((c, i) => {
        const icon = document.getElementById(`p2_icon_${i}`);
        icon.className = `mini-icon ${c.dead ? 'icon-dead' : ''} ${c === p2Fighter ? 'icon-active' : ''}`;
    });
}
function loadFighterUI(player, fighter) {
    const isP1 = player === 1;
    const nameEl = isP1 ? p1Name : p2Name;
    const imgEl = isP1 ? p1Img : p2Img;
    const hpFill = isP1 ? p1HpFill : p2HpFill;
    const hpText = isP1 ? p1HpText : p2HpText;
    const zone = isP1 ? p1Zone : p2Zone;
    nameEl.textContent = fighter.name;
    nameEl.style.color = fighter.color || "#fff";
    imgEl.src = fighter.image;
    zone.style.setProperty('--card-color', fighter.color || "#fff");
    imgEl.classList.remove('death-fall', 'take-damage');
    zone.classList.remove('slide-in-left', 'slide-in-right', 'dash-left', 'dash-right', 'return-home', 'winner-glow');
    zone.style.opacity = 1;
    zone.style.filter = "none";
    updateHP(player, fighter.currentBP, fighter.maxBP, true);
}
async function updateHP(player, current, max, instant = false) {
    const hpFill = player === 1 ? p1HpFill : p2HpFill;
    const hpText = player === 1 ? p1HpText : p2HpText;
    const ptc = Math.max(0, Math.min(100, (current / max) * 100));
    hpFill.style.width = ptc + "%";
    if (ptc < 30) hpFill.style.background = "#f44336"; 
    hpText.textContent = `${current} / ${max} BP`;
    if (!instant) await sleep(600); 
}
async function summonFighter(player, fighter) {
    loadFighterUI(player, fighter);
    updateRosterIcons();
    const zone = player === 1 ? p1Zone : p2Zone;
    zone.classList.add(player === 1 ? 'slide-in-left' : 'slide-in-right');
    logMsg(`${fighter.name} steps into the arena!`, player === 1 ? "p1" : "p2");
    const quoteEl = player === 1 ? p1Quote : p2Quote;
    quoteEl.textContent = `"${randomChoice(quotes)}"`;
    quoteEl.classList.add('quote-active');
    await sleep(1200);
    quoteEl.classList.remove('quote-active');
}
async function animateClash() {
    logMsg("They charge at each other!", "clash");
    p1Zone.classList.add('dash-right');
    p2Zone.classList.add('dash-left');
    await sleep(250); 
    flashOverlay.classList.add('flash-active');
    document.getElementById("arena_stage").classList.add('arena-shake');
    impactTextEl.textContent = randomChoice(impactTexts);
    impactTextEl.classList.remove('impact-animate');
    void impactTextEl.offsetWidth; 
    impactTextEl.classList.add('impact-animate');
    await sleep(100);
    flashOverlay.classList.remove('flash-active');
    await sleep(300);
    document.getElementById("arena_stage").classList.remove('arena-shake');
    p1Zone.classList.remove('dash-right');
    p2Zone.classList.remove('dash-left');
    p1Zone.classList.add('return-home');
    p2Zone.classList.add('return-home');
    await sleep(500);
    p1Zone.classList.remove('return-home');
    p2Zone.classList.remove('return-home');
}
async function showWinner(losingPlayer, winningPlayer) {
    const loser = losingPlayer === 1 ? p1Fighter : p2Fighter;
    const winner = winningPlayer === 1 ? p1Fighter : p2Fighter;
    const losingImg = losingPlayer === 1 ? p1Img : p2Img;
    const losingZone = losingPlayer === 1 ? p1Zone : p2Zone;
    logMsg(`🩸 ${loser.name}'s spiritual pressure vanishes...`, "kill");
    logMsg(`🏆 ${winner.name} stands victorious with ${winner.currentBP} BP remaining!`, winningPlayer === 1 ? "p1" : "p2");
    losingImg.classList.add('death-fall');
    await sleep(1500); 
}
function getMultiplier(attackerRace, defenderRace) {
    const a = Array.isArray(attackerRace) ? attackerRace.join(" ").toLowerCase() : (attackerRace || "").toLowerCase();
    const d = Array.isArray(defenderRace) ? defenderRace.join(" ").toLowerCase() : (defenderRace || "").toLowerCase();
    if (a.includes("soul reaper") && (d.includes("hollow") || d.includes("arrancar") || d.includes("espada"))) return 2.0;
    if (a.includes("quincy") && (d.includes("soul reaper") || d.includes("arrancar"))) return 2.0;
    if ((a.includes("espada") || a.includes("arrancar")) && d.includes("quincy")) return 1.5;
    return 1.0;
}
async function checkRevive(fighter, playerNum) {
    if (fighter.hasTransformed) return false;

    const r = fighter.race.toLowerCase();
    const normName = normalizeName(fighter.name);
    let revived = false;
    let boost = 0;
    let msg = "";

    if (r.includes("soul reaper") && bankaiMap[normName]) {
        boost = 40;
        msg = `🗡️ Bankai! ${bankaiMap[normName]}`;
        revived = true;
    } else if (r.includes("quincy") && quincyMap[normName]) {
        boost = 40;
        msg = `🔷 Vollständig! ${quincyMap[normName]}`;
        revived = true;
    } else if (r.includes("espada")) {
        boost = 30;
        msg = `👁️ Resurrección activated!`;
        revived = true;
    }

    if (revived) {
        logMsg(`[SECOND WIND] ${fighter.name} refuses to fall!`, playerNum === 1 ? "p1" : "p2");
        logMsg(msg, "clash");
        
        fighter.hasTransformed = true;
        fighter.maxBP = boost;
        fighter.currentBP = boost;
        
        const imgEl = playerNum === 1 ? p1Img : p2Img;
        imgEl.classList.remove('take-damage', 'death-fall');
        imgEl.style.filter = "drop-shadow(0 0 20px " + (fighter.color || "#fff") + ") contrast(1.2)";
        
        await updateHP(playerNum, fighter.currentBP, fighter.maxBP, false);
        return true;
    }
    
    return false;
}
async function nextFight() {
    if (!p1Fighter || p1Fighter.dead) {
        p1Fighter = p1Team.find(c => !c.dead);
        if (p1Fighter) {
            await summonFighter(1, p1Fighter);
        }
    }
    if (!p2Fighter || p2Fighter.dead) {
        p2Fighter = p2Team.find(c => !c.dead);
        if (p2Fighter) {
            await summonFighter(2, p2Fighter);
        }
    }
    if (!p1Fighter && !p2Fighter) {
        return showFinalWinner(0); 
    }
    if (!p1Fighter) {
        return showFinalWinner(2);
    }
    if (!p2Fighter) {
        return showFinalWinner(1);
    }
    await sleep(1000);
    await animateClash();
    const mult1 = getMultiplier(p1Fighter.race, p2Fighter.race);
    const mult2 = getMultiplier(p2Fighter.race, p1Fighter.race);
    const bp1 = p1Fighter.currentBP;
    const bp2 = p2Fighter.currentBP;
    const final1 = bp1 * mult1;
    const final2 = bp2 * mult2;
    if (mult1 > 1) logMsg(`${p1Fighter.name} has racial advantage! (${mult1}x)`, "p1");
    if (mult2 > 1) logMsg(`${p2Fighter.name} has racial advantage! (${mult2}x)`, "p2");
    if (final1 > final2) {
        p1Fighter.currentBP = Math.floor(Math.max(1, (final1 - final2) / mult1));
        p2Img.classList.add('take-damage');
        await updateHP(2, 0, p2Fighter.maxBP);
        await updateHP(1, p1Fighter.currentBP, p1Fighter.maxBP);
        const p2Revived = await checkRevive(p2Fighter, 2);
        if (!p2Revived) {
            p2Fighter.dead = true;
            await showWinner(2, 1);
        } else {
            await sleep(1000); 
        }
    } else if (final2 > final1) {
        p2Fighter.currentBP = Math.floor(Math.max(1, (final2 - final1) / mult2));
        p1Img.classList.add('take-damage');
        await updateHP(1, 0, p1Fighter.maxBP);
        await updateHP(2, p2Fighter.currentBP, p2Fighter.maxBP);
        const p1Revived = await checkRevive(p1Fighter, 1);
        if (!p1Revived) {
            p1Fighter.dead = true;
            await showWinner(1, 2);
        } else {
            await sleep(1000); 
        }
    } else {
        p1Img.classList.add('take-damage');
        p2Img.classList.add('take-damage');
        await Promise.all([
            updateHP(1, 0, p1Fighter.maxBP),
            updateHP(2, 0, p2Fighter.maxBP)
        ]);
        logMsg(`💥 MUTUAL DESTRUCTION! Both ${p1Fighter.name} and ${p2Fighter.name} fall!`, "clash");
        const p1Revived = await checkRevive(p1Fighter, 1);
        const p2Revived = await checkRevive(p2Fighter, 2);
        if (!p1Revived) {
            p1Fighter.dead = true;
            p1Img.classList.add('death-fall');
        }
        if (!p2Revived) {
            p2Fighter.dead = true;
            p2Img.classList.add('death-fall');
        }
        await sleep(1500);
    }
    updateRosterIcons();
    if (p1Fighter && p1Fighter.dead) p1Fighter = null;
    if (p2Fighter && p2Fighter.dead) p2Fighter = null;
    await nextFight();
}
function showFinalWinner(winnerNum) {
    const screen = document.getElementById("victory_screen");
    const title = document.getElementById("victory_title");
    screen.classList.remove('hidden');
    if (winnerNum === 1) {
        title.textContent = "PLAYER 1 WINS!";
        title.className = "p1-win";
        logMsg("Player 1 has claimed ultimate victory!", "p1");
        if (p1Fighter) p1Zone.classList.add('winner-glow');
    } else if (winnerNum === 2) {
        title.textContent = "PLAYER 2 WINS!";
        title.className = "p2-win";
        logMsg("Player 2 has conquered the arena!", "p2");
        if (p2Fighter) p2Zone.classList.add('winner-glow');
    } else {
        title.textContent = "COMPLETE ANNIHILATION";
        title.style.color = "#aaa";
        logMsg("Nobody survived the massacre...");
    }
}