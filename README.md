# ⚔️ Bleach Battle Arena

Welcome to **Bleach Battle Arena**, a fully responsive, visually dynamic 2-player character drafting and battle simulator! Built using Vanilla Javascript, HTML, and CSS, this project dynamically bridges with a live Bleach REST API to pit your favorite Soul Reapers, Espadas, and Sternritters against each other in a continuous survivor-style combat system.

## 🌟 Features

*   **Deep API Integration:** Dynamically lazy-loads character stats, racial metadata, physical attributes, affiliations, and manifested techniques (Zanpakutō releases, Shrift abilities, etc.) directly from the live network.
*   **Holographic UI & Modals:** Features a highly immersive, dark-mode anime aesthetic with interactive glassmorphism cards, glowing Reiatsu accents, and a comprehensive `See Info` modal providing deep lore data and battle-kits for every character.
*   **2-Player Drafting System:** Grab a friend and draft teams of 3. You can hand-pick your champions or utilize the **Random Assign** buttons to test your luck with the RNG generator.
*   **Continuous Survivor Combat Engine:** Battles happen instantly in a sequence rather than turn-based rounds. 
    * Characters clash head-on using their Spiritual Pressure (BP). 
    * The character with the higher BP defeats the opponent, but *survives* to fight the next enemy with only their remaining BP difference!
*   **Lore-Accurate Damage Multipliers:** Matches apply canonical race-advantages:
    *   🟥 **Soul Reapers** deal 2x damage against Hollows/Arrancars.
    *   🔵 **Quincies** deal 2x damage against Soul Reapers.
    *   🟪 **Espadas** deal 1.5x damage against Quincies.
*   **Passive Revivals & Form Changes:** Powerful characters don't go down easily. When specific named characters reach 0 BP, they trigger a one-time absolute revival:
    *   **Bankai (Soul Reapers):** Re-enters the battlefield with a massive 40 BP surge alongside their signature Bankai chant!
    *   **Resurrección (Espadas):** Awakens their hollow form with a 30 BP recovery!
    *   **Vollständig (Quincies):** Activates their Rift sequence to regain 40 BP!
*   **Cinematic Battle Animations:** Real-time DOM-element manipulation executing dynamic screen shakes, attack dashes, slash impacts, and floating damage text.

## 🛠️ Technology Stack

*   **HTML5**
*   **CSS3** (Keyframe animations, Flexbox/Grid layouts, Glassmorphism)
*   **Vanilla JavaScript (ES6+)** (Async/Await Data Polling, DOM Manipulation, Module Architecture)
*   **External Data:** [Bleach API proxy mapped](https://bleach-api-8v2r.onrender.com/) via `api.codetabs.com` network.

## 🚀 How to Run Locally

You do not need any heavy frameworks like React or Node.js to spin this up. However, because we utilize `localStorage` for passing drafted teams between HTML files, you **must** use a local server rather than just aggressively opening the `index.html` file in your browser.

1.  Clone this repository to your local machine:
    ```bash
    git clone https://github.com/Injora/wap-sem2.git
    cd wap-sem2/bleach-battle-arena
    ```
2.  Start a local development server. If you have Python installed, you can easily deploy it using:
    ```bash
    python3 -m http.server 8000
    ```
3.  Open your browser and navigate to `http://localhost:8000`.

## 🌐 Deploying to Vercel

The architecture is fully compatible with Vercel's static deployment parameters. 

To deploy instantly, import the repository to your Vercel dashboard. Under the **Build & Development Settings**, change the **Root Directory** to `bleach-battle-arena`. Leave the Framework Preset as `Other` and press the deploy button!

---
*Created by [Injora](https://github.com/Injora) | Project completed during Sem 2*
