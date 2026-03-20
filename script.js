let activePlayer = 1;
let p1Locked = false;
let p2Locked = false;
let isFetching = false;
let isModalOpen = false;

const API = "https://api.codetabs.com/v1/proxy/?quest=https://bleach-api-8v2r.onrender.com/";
const IMAGE_API = "https://bleach-api-8v2r.onrender.com/";
const undoP1Btn = document.getElementById("undo_p1_btn");
const undoP2Btn = document.getElementById("undo_p2_btn");
let allCharacters = [];
let p1Team = [];
let p2Team = [];
let pendingNamesList = [];
const bpMap = {
    "ichigo kurosaki": 145,
    "sosuke aizen": 150
};
const multiRaceMap = {
    "ichigo kurosaki": { race: "Soul Reaper / Hollow / Quincy", color: "#ff6a00" },
    "sosuke aizen": { race: "Soul Reaper / Hollow", color: "#2b0033" },
    "isshin kurosaki": { race: "Soul Reaper / Human", color: "#ff5555" },
    "uryu ishida": { race: "Quincy / Human", color: "#33ccff" },
    "ryuken ishida": { race: "Quincy / Human", color: "#2299cc" },
    "kugo ginjo": { race: "Soul Reaper / Human", color: "#888800" },
};
const espadaMap = {
    "yammy llargo": "Espada #0",
    "coyote starrk": "Espada #1",
    "baraggan louisenbairn": "Espada #2",
    "tier harribel": "Espada #3",
    "ulquiorra cifer": "Espada #4",
    "nnoitra gilga": "Espada #5",
    "grimmjow jaegerjaquez": "Espada #6",
    "zommari rureaux": "Espada #7",
    "szayelaporro grantz": "Espada #8",
    "aaroniero arruruerie": "Espada #9",
};
const visoredList = [
    "shinji hirako",
    "hiyori sarugaki",
    "love aikawa",
    "lisa yadomaru",
    "mashiro kuna",
    "rojuro otoribashi",
    "kensei muguruma",
    "hachigen ushoda"
];
const captainMap = {
    "shigekuni yamamoto genryusai": true,
    "genryusai shigekuni yamamoto": true,
    "yamamoto": true,
    "sui feng": true,
    "soi fon": true,
    "gin ichimaru": true,
    "retsu unohana": true,
    "sosuke aizen": true,
    "byakuya kuchiki": true,
    "sajin komamura": true,
    "shunsui kyoraku": true,
    "kaname tosen": true,
    "toshiro hitsugaya": true,
    "kenpachi zaraki": true,
    "mayuri kurotsuchi": true,
    "jushiro ukitake": true
};
function getDeterministicValue(str) {
    return str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
}
function normalizeName(name) {
    if (!name) return "";
    return name.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z\s]/g, "")
        .trim();
}
function getCharacterImage(data, raceKey) {
    if (!data || !data.slug || !raceKey) return null;
    return `https://bleach-api-8v2r.onrender.com/avatar/${raceKey}/${data.slug}`;
}
function processCharacterData(data, charInfo) {
    if (!data) return null;
    const race = data.stats?.race || charInfo.race;
    let imgUrl = getCharacterImage(data, charInfo.race);
    let themeColor = "#888";
    const raceStr = Array.isArray(race) ? race.join(" ") : (race || "");
    const rLower = raceStr.toLowerCase();
    if (rLower.includes("shinigami") || rLower.includes("soul")) themeColor = "#ff3333";
    else if (rLower.includes("arrancar") || rLower.includes("hollow")) themeColor = "#ff00ff";
    else if (rLower.includes("quincy")) themeColor = "#33ccff";
    else if (rLower.includes("human")) themeColor = "#ffcc00";
    const raceLabel = (rLower.includes("shinigami") || rLower.includes("soul")) ? "Soul Reaper"
        : rLower.includes("arrancar") ? "Arrancar"
            : rLower.includes("hollow") ? "Hollow"
                : rLower.includes("quincy") ? "Quincy"
                    : rLower.includes("human") ? "Human"
                        : race;
    const rawName = data.name?.english || data.name?.romaji || charInfo.name;
    const nameKey = normalizeName(rawName);
    const override = multiRaceMap[nameKey];
    const espadaRank = espadaMap[nameKey];
    const isVisored = visoredList.includes(nameKey);
    const isSoulReaper = (rLower.includes("shinigami") || rLower.includes("soul"));
    const occupation = data.stats?.['Professional Status']?.occupation;
    let isCapt = false;
    if (isSoulReaper) {
        if (captainMap[nameKey]) isCapt = true;
        if (typeof occupation === 'string' && (occupation.toLowerCase().includes("captain of the") || occupation.toLowerCase().includes("head captain"))) {
            isCapt = true;
        }
    }
    let finalRace;
    let finalColor = themeColor;
    let bpBonus = 0;
    if (isVisored) {
        finalRace = "Soul Reaper / Hollow (Visored)";
        finalColor = "#00ffcc";
        bpBonus = 15;
    } else if (override) {
        finalRace = override.race;
        finalColor = override.color;
        if (isCapt) bpBonus = 20;
    } else if (espadaRank) {
        finalRace = `${espadaRank} / Arrancar`;
    } else if (isCapt) {
        finalRace = "Soul Reaper (Captain)";
        finalColor = "#ffd700";
        bpBonus = 20;
    } else {
        finalRace = raceLabel;
    }
    let bp;
    if (bpMap[nameKey] !== undefined) {
        bp = bpMap[nameKey];
    } else {
        let baseBP = 70;
        if (rLower.includes("shinigami") || rLower.includes("soul")) baseBP = 80;
        else if (rLower.includes("arrancar") || rLower.includes("hollow")) baseBP = 90;
        else if (rLower.includes("quincy")) baseBP = 85;
        else if (rLower.includes("human")) baseBP = 60;
        baseBP += bpBonus;
        const variation = getDeterministicValue(nameKey) % 20;
        bp = baseBP + variation;
    }
    return {
        id: data.id || charInfo.name,
        name: data.name?.english || data.name?.romaji || charInfo.name,
        image: imgUrl,
        race: finalRace,
        gender: data.stats?.gender || "Unknown",
        bp: bp,
        color: finalColor,
        raw: data
    };
}
const findInput = document.getElementById("find_input");
const raceDrop = document.getElementById("race_drop");
const genDrop = document.getElementById("gender");
const bpSort = document.getElementById("bp_sort");
const charsGrid = document.getElementById("chars_grid");
const p1Panel = document.getElementById("p1_panel");
const p2Panel = document.getElementById("p2_panel");
const chosenCharsP1 = document.getElementById("chosen_chars_p1");
const chosenCharsP2 = document.getElementById("chosen_chars_p2");
const t1Count = document.getElementById("t1_count");
const t2Count = document.getElementById("t2_count");
const randP1Btn = document.getElementById("rand_p1_btn");
const randP2Btn = document.getElementById("rand_p2_btn");
const resetTeamsBtn = document.getElementById("reset_teams_btn");
const btn1 = document.getElementById("btn1");
const btn2 = document.getElementById("btn2");
const logBox = document.getElementById("log_box");
const resultText = document.getElementById("result_text");
p1Panel.addEventListener("click", () => {
    activePlayer = 1;
    p1Panel.style.borderColor = "#4CAF50";
    p2Panel.style.borderColor = "#333";
});
p2Panel.addEventListener("click", () => {
    activePlayer = 2;
    p2Panel.style.borderColor = "#ff5555";
    p1Panel.style.borderColor = "#333";
});
undoP1Btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (p1Locked) {
        alert("Team is locked 🔒");
        return;
    }
    if (p1Team.length === 0) return;
    p1Team.pop();
    renderTeam();
});
undoP2Btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (p2Locked) {
        alert("Team is locked 🔒");
        return;
    }
    if (p2Team.length === 0) return;
    p2Team.pop();
    renderTeam();
});
const topMenu = document.getElementById("top_menu");
const bottomPart = document.getElementById("bottom_part");
async function fetchData(attempt = 1) {
    const maxAttempts = 3;
    const retryDelay = 8000;

    if (attempt === 1) {
        charsGrid.innerHTML = `<p class="loading">Gathering Spiritual Pressure...</p>`;
    } else {
        let secs = retryDelay / 1000;
        charsGrid.innerHTML = `<p class="loading">API is waking up... retrying in <span id="retry_countdown">${secs}</span>s (attempt ${attempt}/${maxAttempts})</p>`;
        const countdown = setInterval(() => {
            secs--;
            const el = document.getElementById("retry_countdown");
            if (el) el.textContent = secs;
            if (secs <= 0) clearInterval(countdown);
        }, 1000);
        await new Promise(r => setTimeout(r, retryDelay));
        charsGrid.innerHTML = `<p class="loading">Gathering Spiritual Pressure...</p>`;
    }

    try {
        const races = ["shinigami", "humans", "quincy", "arrancar"];
        const racePromises = races.map(race =>
            fetch(API + "characters/" + race).then(res => {
                if (!res.ok) throw new Error("HTTP " + res.status);
                return res.json();
            })
        );
        const raceResults = await Promise.all(racePromises);
        raceResults.forEach((obj, index) => {
            const raceName = races[index];
            const names = obj[raceName];
            if (!names) throw new Error("Unexpected API response");
            names.forEach(name => {
                pendingNamesList.push({ name, race: raceName });
            });
        });
        pendingNamesList.sort(() => Math.random() - 0.5);
        await loadMoreCharacters(12);
        window.addEventListener('scroll', () => {
            if (isModalOpen) return;
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
                if (!isFetching) loadMoreCharacters(8);
            }
        });
        setInterval(() => {
            if (isModalOpen) return;
            if (!isFetching && pendingNamesList.length > 0) {
                loadMoreCharacters(4);
            }
        }, 3000);
    } catch (error) {
        console.error("Attempt " + attempt + " failed:", error);
        if (attempt < maxAttempts) {
            fetchData(attempt + 1);
        } else {
            charsGrid.innerHTML = `<p style="color:#cc2200; text-align:center;">
                ⚠️ Could not reach the API after ${maxAttempts} attempts.<br><br>
                <button onclick="location.reload()" style="margin-top:10px; padding:10px 20px; background:#8b3a00; color:#fff; border:1px solid #ff6500; border-radius:4px; cursor:pointer; font-family:inherit; font-size:1rem; letter-spacing:1px;">↺ Retry</button>
            </p>`;
        }
    }
}

async function loadMoreCharacters(amount) {
    if (pendingNamesList.length === 0 || isFetching) return;
    isFetching = true;
    const batch = pendingNamesList.splice(0, amount);
    let loadingElem = null;
    if (amount >= 8) {
        loadingElem = document.createElement('p');
        loadingElem.className = 'loading';
        loadingElem.innerText = 'Loading more spiritual pressure...';
        charsGrid.appendChild(loadingElem);
    }
    try {
        const charPromises = batch.map(charInfo => {
            const formattedName = charInfo.name.toLowerCase().replace(/[\s\-]+/g, '_');
            return fetch(API + "characters/" + charInfo.race + "/" + encodeURIComponent(formattedName))
                .then(res => res.json())
                .catch(() => null);
        });
        const charResults = await Promise.all(charPromises);
        const newCharacters = charResults.map((result, index) => {
            if (!result) return null;
            const data = (result.results && result.results.length > 0) ? result.results[0] : null;
            if (!data) return null;
            return processCharacterData(data, batch[index]);
        }).filter(char => char !== null);
        newCharacters.forEach(char => {
            if (!allCharacters.some(c => c.id === char.id)) {
                allCharacters.push(char);
            }
        });
        applyFilters();
    } catch (error) {
        console.error(error);
    } finally {
        if (loadingElem) loadingElem.remove();
        isFetching = false;
    }
}
let lastRender = "";
function renderCharacters(characters) {
    if (characters.length === 0) {
        const emptyMsg = "<p style='width: 100%; text-align: center; color: #a8b2d1; font-size: 1.2rem;'>No characters match your search!</p>";
        if (lastRender === emptyMsg) return;
        lastRender = emptyMsg;
        charsGrid.innerHTML = emptyMsg;
        return;
    }
    const newHtml = characters.map(char => {
        const charName = char.name;
        const fallbackSafeUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(charName)}&background=random&color=fff&size=200`;
        const img = char.image ? char.image : fallbackSafeUrl;
        const race = char.race;
        const gender = char.gender;
        const bp = char.bp;
        const color = char.color || "#888";
        const isDrafted = p1Team.some(c => c.name === charName) || p2Team.some(c => c.name === charName);
        const draftBtnText = isDrafted ? "Drafted" : "Draft";
        const draftBtnStyle = isDrafted ? "flex:1; font-size: 13px; background: #555; color: #999; border-color: #444; cursor: default;" : "flex:1; font-size: 13px;";
        const safeId = char.id.toString().replace(/[^a-zA-Z0-9]/g, '_');

        return `
            <div class="card" style="--card-color: ${color};">
                <img src="${img}" 
                     loading="lazy" 
                     onerror="this.onerror=null; this.src='${fallbackSafeUrl}';">
                <h3>${charName}</h3>
                <p><strong>Race:</strong> ${race}</p>
                <p><strong>Gender:</strong> ${gender}</p>
                <p><strong>BP:</strong> ${bp}</p>
                <div style="display: flex; gap: 8px; margin-top: 10px; position: relative; z-index: 2;">
                    <button class="info-btn" onclick="openCharInfo('${charName}')" style="flex:1; font-size: 13px; background: rgba(0,0,0,0.8);">See Info</button>
                    <button id="draft_btn_${safeId}" onclick="addToTeam('${charName}')" style="${draftBtnStyle}">${draftBtnText}</button>
                </div>
            </div>
        `;
    }).join("");
    if (newHtml === lastRender) return;
    lastRender = newHtml;
    charsGrid.innerHTML = newHtml;
}
let searchTimeout;
findInput.addEventListener('input', (e) => {
    applyFilters();
    clearTimeout(searchTimeout);
    const searchTerm = e.target.value.toLowerCase().trim();
    if (searchTerm.length >= 2) {
        searchTimeout = setTimeout(() => {
            searchAndFetch(searchTerm);
        }, 400);
    }
});
async function searchAndFetch(searchTerm) {
    const matches = pendingNamesList.filter(char => char.name.toLowerCase().includes(searchTerm));
    if (matches.length === 0) return;
    pendingNamesList = pendingNamesList.filter(char => !char.name.toLowerCase().includes(searchTerm));
    try {
        const charPromises = matches.map(charInfo => {
            const formattedName = charInfo.name.toLowerCase().replace(/[\s\-]+/g, '_');
            return fetch(API + "characters/" + charInfo.race + "/" + encodeURIComponent(formattedName))
                .then(res => res.json())
                .catch(() => null);
        });
        const charResults = await Promise.all(charPromises);
        const newCharacters = charResults.map((result, index) => {
            if (!result) return null;
            const data = (result.results && result.results.length > 0) ? result.results[0] : null;
            if (!data) return null;
            return processCharacterData(data, matches[index]);
        }).filter(char => char !== null);
        newCharacters.forEach(char => {
            if (!allCharacters.some(c => c.id === char.id)) {
                allCharacters.push(char);
            }
        });
        applyFilters();
    } catch (error) {
        console.error(error);
    }
}
raceDrop.addEventListener('change', applyFilters);
genDrop.addEventListener('change', applyFilters);
bpSort.addEventListener('change', applyFilters);
function applyFilters() {
    let filtered = allCharacters;
    const searchTerm = findInput.value.toLowerCase().trim();
    if (searchTerm) {
        filtered = filtered.filter(char => char.name.toLowerCase().includes(searchTerm));
    }
    const selectedRace = raceDrop.value;
    if (selectedRace !== "all") {
        filtered = filtered.filter(char => char.race.toLowerCase().includes(selectedRace.toLowerCase()));
    }
    const selectedGender = genDrop.value;
    if (selectedGender !== "all") {
        filtered = filtered.filter(char => char.gender.toLowerCase() === selectedGender.toLowerCase());
    }
    const sortValue = bpSort.value;
    if (sortValue === "asc") {
        filtered = [...filtered].sort((a, b) => a.bp - b.bp);
    } else if (sortValue === "desc") {
        filtered = [...filtered].sort((a, b) => b.bp - a.bp);
    }
    renderCharacters(filtered);
}
window.addToTeam = function (name) {
    if ((activePlayer === 1 && p1Locked) || (activePlayer === 2 && p2Locked)) {
        alert("Your team is locked 🔒");
        return;
    }
    const currentTeam = activePlayer === 1 ? p1Team : p2Team;
    const otherTeam = activePlayer === 1 ? p2Team : p1Team;
    if (currentTeam.length >= 3) {
        alert("Player " + activePlayer + "'s team is full!");
        return;
    }
    if (currentTeam.find(c => c.name === name)) {
        alert(name + " is already in your team!");
        return;
    }
    const charObj = allCharacters.find(c => c.name === name);
    if (charObj) {
        if (activePlayer === 1) {
            p1Team = [...p1Team, charObj];
            if (p1Team.length === 3) p1Locked = true;
        } else {
            p2Team = [...p2Team, charObj];
            if (p2Team.length === 3) p2Locked = true;
        }
        
        const safeId = charObj.id.toString().replace(/[^a-zA-Z0-9]/g, '_');
        const btn = document.getElementById("draft_btn_" + safeId);
        if (btn) {
            btn.innerText = "Drafted";
            btn.style.cssText = "flex:1; font-size: 13px; background: #555; color: #999; border-color: #444; cursor: default;";
        }
        
        renderTeam();
    }
}
window.removeFromTeam = function (name, playerNum) {
    const team = playerNum === 1 ? p1Team : p2Team;
    const isLocked = playerNum === 1 ? p1Locked : p2Locked;
    if (isLocked && team.length === 3) {
        alert("Team is locked 🔒");
        return;
    }
    let removedChar;
    if (playerNum === 1) {
        removedChar = p1Team.find(c => c.name === name);
        p1Team = p1Team.filter(c => c.name !== name);
    }
    if (playerNum === 2) {
        removedChar = p2Team.find(c => c.name === name);
        p2Team = p2Team.filter(c => c.name !== name);
    }
    
    if (removedChar) {
        const safeId = removedChar.id.toString().replace(/[^a-zA-Z0-9]/g, '_');
        const btn = document.getElementById("draft_btn_" + safeId);
        if (btn) {
            btn.innerText = "Draft";
            btn.style.cssText = "flex:1; font-size: 13px;";
        }
    }
    
    renderTeam();
}
function assignRandomTeam(playerNum) {
    let currentTeam = playerNum === 1 ? p1Team : p2Team;
    let otherTeam = playerNum === 1 ? p2Team : p1Team;
    currentTeam = [];
    const availablePool = allCharacters.filter(c => !otherTeam.some(otherC => otherC.id === c.id));
    if (availablePool.length < 3) {
        alert("Not enough characters loaded yet to randomize safely! Scroll down to fetch more.");
        return;
    }
    while (currentTeam.length < 3) {
        let randIdx = Math.floor(Math.random() * availablePool.length);
        const charObj = availablePool.splice(randIdx, 1)[0];
        currentTeam.push(charObj);
    }
    if (playerNum === 1) {
        p1Team = currentTeam;
        p1Locked = true;
    } else {
        p2Team = currentTeam;
        p2Locked = true;
    }
    renderTeam();
}
randP1Btn.addEventListener("click", (e) => {
    e.stopPropagation();
    assignRandomTeam(1);
});
randP2Btn.addEventListener("click", (e) => {
    e.stopPropagation();
    assignRandomTeam(2);
});
resetTeamsBtn.addEventListener("click", () => {
    p1Team = [];
    p2Team = [];
    p1Locked = false;
    p2Locked = false;
    renderTeam();
});
function _generateTeamCards(teamArray, playerNum) {
    if (teamArray.length === 0) return "<p style='color:#888; font-style:italic;'>No characters selected...</p>";
    return teamArray.map(char => `
        <div class="team-card" style="cursor: pointer; --card-color: ${char.color || '#888'}; padding: 5px; flex-direction:row; align-items:center;" onclick="removeFromTeam('${char.name}', ${playerNum})" title="Click to remove ${char.name}">
            <img src="${char.image}" alt="${char.name}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(char.name)}&background=random&color=fff&size=200'" style="width:50px; height:50px; border-radius:50%; margin-right: 10px;">
            <div style="flex:1;">
                <div style="font-size:12px;"><strong>${char.name}</strong></div>
                <div style="color: #4CAF50; font-weight: bold; font-size:12px;">BP: ${char.bp}</div>
            </div>
        </div>
    `).join("");
}
function renderTeam() {
    t1Count.innerText = p1Team.length;
    t2Count.innerText = p2Team.length;
    if (p1Locked) {
        chosenCharsP1.innerHTML = "<p style='color:#888;'>🔒 Spiritual Pressure Concealed</p>";
    } else {
        chosenCharsP1.innerHTML = _generateTeamCards(p1Team, 1);
    }
    if (p2Locked) {
        chosenCharsP2.innerHTML = "<p style='color:#888;'>👁️ Hidden Team (locked)</p>";
    } else {
        chosenCharsP2.innerHTML = _generateTeamCards(p2Team, 2);
    }
    if (p1Team.length === 3 && p2Team.length === 3) {
        btn1.disabled = false;
        btn1.style.backgroundColor = "#4CAF50";
        btn1.style.color = "white";
    } else {
        btn1.disabled = true;
        btn1.style.backgroundColor = "";
        btn1.style.color = "";
    }
    undoP1Btn.style.display = p1Team.length > 0 && !p1Locked ? "block" : "none";
    undoP2Btn.style.display = p2Team.length > 0 && !p2Locked ? "block" : "none";
}
renderTeam();
btn1.addEventListener("click", () => {
    localStorage.setItem("p1Team", JSON.stringify(p1Team));
    localStorage.setItem("p2Team", JSON.stringify(p2Team));
    window.location.href = "battle.html";
});
btn2.addEventListener("click", () => {
    document.getElementById("left_col").classList.remove("hide");
    document.getElementById("team_sec").classList.remove("hide");
    document.getElementById("fight_sec").classList.add("hide");
    p1Team = [];
    p2Team = [];
    renderTeam();
});

const charModal = document.getElementById("char_modal");
const closeModalBtn = document.getElementById("close_modal_btn");
const modalInner = document.getElementById("modal_inner");

closeModalBtn.addEventListener("click", () => {
    charModal.classList.add("modal-hide");
    document.body.style.overflow = "";
    isModalOpen = false;
});

window.openCharInfo = function(name) {
    const char = allCharacters.find(c => c.name === name);
    if (!char) return;
    isModalOpen = true;
    
    const r = char.raw;
    let abilitiesHtml = "";
    
    const powers = r.powers_and_abilities;
    if (powers) {
        if (Array.isArray(powers)) {
            powers.slice(0, 10).forEach(p => {
                const title = typeof p === 'object' && p.title ? p.title : p;
                abilitiesHtml += `<li>${title}</li>`;
            });
        } else if (typeof powers === 'object') {
            Object.keys(powers).slice(0, 10).forEach(key => {
                if (key !== "details") abilitiesHtml += `<li>${key.replace(/_/g, ' ')}</li>`;
            });
        }
    }
    
    if (r.zanpakuto) {
        abilitiesHtml += `<li><strong>Zanpakutō:</strong> ${typeof r.zanpakuto === 'string' ? r.zanpakuto : r.zanpakuto.name || "Unknown"}</li>`;
    }
    
    if (r.equipment) {
        if (Array.isArray(r.equipment)) {
            r.equipment.slice(0, 3).forEach(e => abilitiesHtml += `<li><strong>Equip:</strong> ${typeof e === 'string' ? e : e.name || e.title || "Item"}</li>`);
        } else if (typeof r.equipment === 'string') {
            abilitiesHtml += `<li><strong>Equipment:</strong> ${r.equipment}</li>`;
        }
    }

    if (r.skills) {
        if (Array.isArray(r.skills)) {
            r.skills.slice(0, 3).forEach(s => abilitiesHtml += `<li><strong>Skill:</strong> ${typeof s === 'string' ? s : s.name || s.title || "Ability"}</li>`);
        } else if (typeof r.skills === 'string') {
            abilitiesHtml += `<li><strong>Skill:</strong> ${r.skills}</li>`;
        }
    }

    if (!abilitiesHtml) {
        const rc = char.race.toLowerCase();
        if (rc.includes("reaper") || rc.includes("shinigami")) {
            abilitiesHtml = "<li>Zanjutsu (Swordsmanship)</li><li>Hohō (Flash Step)</li><li>Kidō (Demon Arts)</li><li>Hakuda (Hand-to-Hand)</li>";
        } else if (rc.includes("arrancar") || rc.includes("espada") || rc.includes("hollow")) {
            abilitiesHtml = "<li>Hierro (Iron Skin)</li><li>Sonído (Sound Ceremony)</li><li>Cero (Hollow Flash)</li><li>Bala (Hollow Bullet)</li>";
        } else if (rc.includes("quincy")) {
            abilitiesHtml = "<li>Hirenkyaku (Flying Screen Step)</li><li>Blut (Blood)</li><li>Heilig Pfeil (Sacred Arrow)</li>";
        } else if (rc.includes("human") || rc.includes("fullbringer")) {
            abilitiesHtml = "<li>Spiritual Awareness</li><li>Fullbring Resonance</li>";
        } else {
            abilitiesHtml = "<li>Latent Spiritual Power</li>";
        }
    }

    let height = "Unknown", weight = "Unknown", birthday = "Unknown", bloodType = "Unknown", affiliation = "Unknown";
    if (r.stats) {
        height = r.stats.height || height;
        weight = r.stats.weight || weight;
        birthday = r.stats.birthday || birthday;
        bloodType = r.stats.blood_type || bloodType;
        if (r.stats['Professional Status']) {
            affiliation = r.stats['Professional Status'].affiliation || r.stats['Professional Status'].profession || affiliation;
        }
    }

    modalInner.innerHTML = `
        <div class="modal-img-wrapper" style="--card-color: ${char.color};">
            <img src="${char.image}" alt="${char.name}" onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(char.name)}&background=random&color=fff&size=500';">
        </div>
        <div class="modal-info-wrapper">
            <h2 class="modal-title" style="--card-color: ${char.color};">${char.name}</h2>
            
            <div class="modal-stat-box" style="--card-color: ${char.color};">
                <div class="modal-stat-title">Spiritual Pressure (BP)</div>
                <div class="modal-stat-value" style="color: #4CAF50; font-weight: bold;">${char.bp}</div>
            </div>
            
            <div style="display:flex; gap:15px; margin-bottom: 15px; flex-wrap: wrap;">
                <div class="modal-stat-box" style="flex:1; min-width: 120px; --card-color: ${char.color}; margin-bottom: 0;">
                    <div class="modal-stat-title">Affiliation</div>
                    <div class="modal-stat-value" style="font-size:1rem;">${affiliation}</div>
                </div>
                <div class="modal-stat-box" style="flex:1; min-width: 120px; --card-color: ${char.color}; margin-bottom: 0;">
                    <div class="modal-stat-title">Race</div>
                    <div class="modal-stat-value" style="font-size:1rem;">${char.race}</div>
                </div>
            </div>

            <div style="display:flex; gap:15px; flex-wrap: wrap;">
                <div class="modal-stat-box" style="flex:1; min-width: 100px; --card-color: ${char.color};">
                    <div class="modal-stat-title">Gender</div>
                    <div class="modal-stat-value" style="font-size:1rem;">${char.gender}</div>
                </div>
                <div class="modal-stat-box" style="flex:1; min-width: 100px; --card-color: ${char.color};">
                    <div class="modal-stat-title">Height / Weight</div>
                    <div class="modal-stat-value" style="font-size:1rem;">${height} / ${weight}</div>
                </div>
                <div class="modal-stat-box" style="flex:1; min-width: 100px; --card-color: ${char.color};">
                    <div class="modal-stat-title">DOB / Blood</div>
                    <div class="modal-stat-value" style="font-size:1rem;">${birthday} / ${bloodType}</div>
                </div>
            </div>

            <div class="modal-abilities">
                <h4>Manifested Abilities</h4>
                <ul>
                    ${abilitiesHtml}
                </ul>
            </div>
        </div>
    `;
    
    charModal.style.setProperty('--card-color', char.color);
    charModal.querySelector('.modal-content').style.setProperty('--card-color', char.color);
    
    document.body.style.overflow = "hidden";
    charModal.classList.remove("modal-hide");
}

fetchData();