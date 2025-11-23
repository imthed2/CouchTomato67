// app.js — Expanded Choice Tour (DANSK)
// Inkluderer +10 ekstra scener og 2 hemmelige slutninger
const initialState = {
  player: {
    name: "Daniel Hagen",
    job: "telefonreparatør",
    likes: ["stemningslys","planter","Minecraft","sorte klæder"],
    relations: { niece: "Emma (8)", nephews: ["Max (15)","Liam"] },
  },
  stats: { energy: 7, hygge: 6, ry: 5 },
  inventory: [],
  scene: "start",
  flags: {} // for tracking hemmeligheder/valg
};

let state = load() || structuredClone(initialState);

// Scenes (udvidet)
const scenes = {
  start: {
    title: "Morgen i lejligheden",
    image: "Du vågner i din lejlighed, lyskæden kaster et blødt skær på bogreolen. Telefonen ringer — det er Sara.",
    choices: [
      { txt: "Tag telefonen", go: "phone-call", effect: { energy: -1 } },
      { txt: "Snooze 10 min", go: "snooze", effect: { energy: +1, hygge: -1 } },
      { txt: "Tjek Minecraft-serveren", go: "minecraft", effect: { ry: +1 } }
    ]
  },

  "phone-call": {
    title: "Sara ringer",
    image: "Emma har mistet sin tegning. Sara spørger om du kan komme senere.",
    choices: [
      { txt: "Sig ja — familie først", go: "prepare-gifts", effect: { hygge:+2, energy:-1 } },
      { txt: "Sig nej — du har arbejde", go: "workday", effect: { ry:-1 } },
      { txt: "Spørg om et billede", go: "ask-photo", effect: { ry:+1 } }
    ]
  },

  snooze: {
    title: "10 minutter senere",
    image: "Der er ro. Du mister et opkald, men får sovet lidt.",
    choices: [
      { txt: "Stå op og tjek telefon", go: "phone-call" },
      { txt: "Bliv og spil et kvarter", go: "minecraft", effect: { energy:-1 } }
    ]
  },

  minecraft: {
    title: "Minecraft-serveren",
    image: "Niels har kommenteret din plugin-ide. Et DM nævner en kunde med vandskadet telefon.",
    choices: [
      { txt: "Pak værktøj og forbered", go: "prep-repair", effect: { inventory_add: 'værktøjskit', energy:-1 } },
      { txt: "Fortsæt kode — serveren kalder", go: "server-focus", effect: { ry:+1 } }
    ]
  },

  prep-repair: {
    title: "Klar til job",
    image: "Du pakker værktøj og tænker på rutiner.",
    choices: [
      { txt: "Kør til butikken", go: "repair-shop", effect: { energy:-2, ry:+1 } },
      { txt: "Send en guide i stedet", go: "send-guide", effect: { ry:-1 } }
    ]
  },

  "repair-shop": {
    title: "Vandskadet telefon",
    image: "Kunden er nervøs — billeder af familien er vigtige.",
    choices: [
      { txt: "Grundig undersøgelse", go: "thorough", effect: { energy:-2, ry:+2 } },
      { txt: "Hurtig tørrekammer-løsning", go: "quickfix", effect: { energy:-1, ry:-1 } }
    ]
  },

  thorough: {
    title: "Taknemmelig kunde",
    image: "Du reddede billederne. Kunden er overlykkelig.",
    choices: [
      { txt: "Sælg skærmbeskyttelse med rabat", go: "afterwork-good", effect: { ry:+1, hygge:+1 } },
      { txt: "Gå hjem alene", go: "home-alone", effect: { hygge:-1 } }
    ]
  },

  quickfix: {
    title: "Blandede følelser",
    image: "Nogle billeder gik tabt.",
    choices: [
      { txt: "Tilbyd backup senere", go: "afterwork-good" },
      { txt: "Tag pengene og gå", go: "afterwork-bad", effect: { ry:-2 } }
    ]
  },

  afterwork-good: {
    title: "Aften hos mor",
    image: "Emma kaster sig om halsen på dig. Hygge og mad.",
    choices: [
      { txt: "Giv tegnesættet", go: "ending-family", effect: { hygge:+3 } },
      { txt: "Tjek phone — spil under middagen", go: "ending-aloof", effect: { hygge:-2 } }
    ]
  },

  afterwork-bad: {
    title: "Urolig aften",
    image: "Kunden ringer og er utilfreds.",
    choices: [
      { txt: "Gå tilbage og ordne det", go: "repair-atonement", effect: { ry:+2, energy:-2 } },
      { txt: "Ignorér og gå hjem", go: "ending-ignores", effect: { ry:-3 } }
    ]
  },

  repair-atonement: {
    title: "Du gjorde det rigtigt",
    image: "Du fik rettet fejlen og genvandt din stolthed.",
    choices: [
      { txt: "Fejr med familien", go: "ending-family", effect: { hygge:+2 } },
      { txt: "Gå hjem og kod", go: "ending-geek", effect: { ry:+1 } }
    ]
  },

  ending-family: {
    title: "Slutning: Familiehygge",
    image: "Varm afslutning med familie og leg.",
    ending: "family",
    choices: [{ txt: "Spil igen", go: "start" }]
  },

  ending-aloof: {
    title: "Slutning: Alene med telefonen",
    image: "Du får tid til kode, men mangler samvær.",
    ending: "aloof",
    choices: [{ txt: "Spil igen", go: "start" }]
  },

  ending-ignores: {
    title: "Slutning: Dårligt rygte",
    image: "Butikken mister kunder pga rygte.",
    ending: "bad",
    choices: [{ txt: "Spil igen", go: "start" }]
  },

  ending-geek: {
    title: "Slutning: Geek mode",
    image: "Kode og serverfokus fører til teknisk fremgang.",
    ending: "geek",
    choices: [{ txt: "Spil igen", go: "start" }]
  },

  ask-photo: {
    title: "Billede af tegningen",
    image: "Sara sender et billede; Emma smiler.",
    choices: [
      { txt: "Sig at du kommer senere", go: "prepare-gifts", effect: { hygge:+1 } },
      { txt: "Send tegne-idé via besked", go: "minecraft", effect: { ry:+1 } }
    ]
  },

  prepare-gifts: {
    title: "Forberedelse til familien",
    image: "Du finder et lille tegnesæt og pakker det.",
    choices: [
      { txt: "Kør til mor", go: "afterwork-good", effect: { energy:-1 } },
      { txt: "Bliv og kod plugin", go: "ending-geek", effect: { ry:+1 } }
    ]
  },

  server-focus: {
    title: "Server-fokus",
    image: "Niels roser din kode. Du får et hint om en skjult plugin-funktion.",
    choices: [
      { txt: "Undersøg den skjulte funktion (hemmeligt spor)", go: "find-key", effect: { flags_add: 'saw_hint' } },
      { txt: "Ignorér og fortsæt arbejde", go: "ending-geek", effect: { ry:+1 } }
    ]
  },

  // +10 ekstra scener / sidequests
  find-key: {
    title: "Et mystisk hint",
    image: "På serverens forum finder du referencer til en 'nøgle' gemt i byen.",
    choices: [
      { txt: "Følg sporet i byen", go: "city-hunt", effect: { energy:-1 } },
      { txt: "Lad det ligge", go: "ending-geek" }
    ]
  },

  city-hunt: {
    title: "Byjagt",
    image: "Du undersøger et gammelt lager og finder en metalbrik med et symbol.",
    choices: [
      { txt: "Tag brikken med hjem", go: "home-brick", effect: { inventory_add: 'metalbrik' } },
      { txt: "Giv brikken til en collector", go: "collector", effect: { ry:+1 } }
    ]
  },

  home-brick: {
    title: "Hjemme med brikken",
    image: "Brikken passer måske til noget i din bogreol-udstilling.",
    choices: [
      { txt: "Prøv brikken i en gadget i hylden", go: "unlock-secret", effect: { flags_add: 'used_brick' } },
      { txt: "Sæt den i inventaret", go: "store-brick" }
    ]
  },

  collector: {
    title: "Collector",
    image: "En lokal collector lover at betale for brikken, og du får en kontaktliste.",
    choices: [
      { txt: "Sælg brikken", go: "after-cash", effect: { ry:+0 } },
      { txt: "Behold kontaktinfo", go: "keep-contact", effect: { ry:+1 } }
    ]
  },

  store-brick: {
    title: "Brikken i inventaret",
    image: "Den metalbrik ligger nu i dit inventory. Hvad gør du?",
    choices: [
      { txt: "Tag den frem og prøv den i hylden", go: "unlock-secret" },
      { txt: "Glem den et øjeblik", go: "home-alone" }
    ]
  },

  unlock-secret: {
    title: "En låge i hylden åbner",
    image: "Brikken klikker — en lille låge i din bogreol åbner og afslører et gammelt USB-stick.",
    choices: [
      { txt: "Tag stick'en og tilslut den til din PC", go: "read-stick", effect: { inventory_add: 'usb-stick' } },
      { txt: "Undersøg stick'en senere", go: "ending-geek" }
    ]
  },

  read-stick: {
    title: "USB-stick'en",
    image: "På stick'en ligger en prototype af din plugin — og en besked: 'Find mandskabet ved natmarkedet'.",
    choices: [
      { txt: "Tag til natmarkedet", go: "night-market", effect: { energy:-1, flags_add: 'has_prototype' } },
      { txt: "Ignorér — behold det hemmeligt", go: "ending-geek" }
    ]
  },

  night-market: {
    title: "Natmarkedet",
    image: "Et mørkt marked, boder med elektronik. En person genkender plugin-navnet.",
    choices: [
      { txt: "Tal med personen", go: "stranger-meets", effect: { hygge:+1 } },
      { txt: "Hold afstand — forpligtelser kalder", go: "ending-geek", effect: { ry:+1 } }
    ]
  },

  stranger-meets: {
    title: "Møde med en skygge",
    image: "Personen afslører en hemmelig konkurrerende servergruppe og tilbyder at hjælpe — for en pris.",
    choices: [
      { txt: "Indgå samarbejde (hemmeligt)", go: "secret-deal", effect: { flags_add: 'made_deal' } },
      { txt: "Afvis og bevar dit projekt", go: "protect-plugin", effect: { ry:+1 } }
    ]
  },

  secret-deal: {
    title: "Den hemmelige aftale",
    image: "I laver en kort aftale — men personen beder dig tage en 'prøve' i en lagerbygning.",
    choices: [
      { txt: "Gå med til prøven", go: "warehouse", effect: { energy:-2 } },
      { txt: "Drop aftalen", go: "protect-plugin" }
    ]
  },

  warehouse: {
    title: "Lagerbygningen",
    image: "I rodet finder du en kiste. Den indeholder en mærkelig amulet — og et brev med en kode: 'DAN-SECRET'.",
    choices: [
      { txt: "Tag amuletten (hemmelig vej)", go: "secret-ending-1", effect: { flags_add: 'amulet_taken' } },
      { txt: "Gå tilbage og fokus på familien", go: "afterwork-good" }
    ]
  },

  // ekstra sidequests (tattoo, DJ gig, plante-redning, radio)
  tattoo-studio: {
    title: "Tattoo-studiet",
    image: "En gammel ven tilbyder en tatovering som tak for hjælp. Det er et valg om selvudtryk.",
    choices: [
      { txt: "Få tatoveringen", go: "tattoo-get", effect: { ry:+1, hygge:+1 } },
      { txt: "Afslå", go: "afterwork-good" }
    ]
  },

  tattoo-get: {
    title: "Ny tatovering",
    image: "Du får en diskret streg-tatovering der symboliserer familie.",
    choices: [
      { txt: "Fejr med familie", go: "ending-family" },
      { txt: "Tag hjem og plug på serveren", go: "ending-geek" }
    ]
  },

  dj-gig: {
    title: "DJ-optræden",
    image: "En lokal bar spørger om du vil spille en kort mix — god chance for penge og hygge.",
    choices: [
      { txt: "Spil et sæt", go: "dj-success", effect: { ry:+1, hygge:+2 } },
      { txt: "Afslå — jobbet kalder", go: "repair-shop" }
    ]
  },

  dj-success: {
    title: "Fedt sæt",
    image: "Folk elsker dit mix. Du tjener lidt ekstra og får ny energi.",
    choices: [
      { txt: "Kør til mor med gaver", go: "afterwork-good", effect: { energy:+1 } },
      { txt: "Arbejd videre på plugin", go: "ending-geek" }
    ]
  },

  plant-rescue: {
    title: "Plante-redning",
    image: "En klatreplante i din reol holder på en gammel nøgle i potten.",
    choices: [
      { txt: "Grav nøglen frem", go: "home-brick", effect: { inventory_add: 'potte-nøgle' } },
      { txt: "Lad potten være", go: "home-alone" }
    ]
  },

  radio-fix: {
    title: "Den gamle radio",
    image: "En neighbor giver dig en defekt radio fuld af minder.",
    choices: [
      { txt: "Reparer radioen (teknisk puslespil)", go: "radio-fixed", effect: { ry:+1 } },
      { txt: "Giv den videre", go: "collector" }
    ]
  },

  radio-fixed: {
    title: "Radioen spiller",
    image: "Radioen spiller en gammel sang — det vækker minder og hygge.",
    choices: [
      { txt: "Del musikken med familien", go: "afterwork-good", effect: { hygge:+2 } },
      { txt: "Gem den og kod videre", go: "ending-geek" }
    ]
  },

  // hemmelige slutninger
  "secret-ending-1": {
    title: "Hemmelig slutning: Amulettens arv",
    image: "Amuletten aktiverer en række gamle noter — du finder en hemmelig arvsfortælling om din familie.",
    ending: "secret-family",
    choices: [{ txt: "Spil igen", go: "start" }]
  },

  "secret-ending-2": {
    title: "Hemmelig slutning: Server-legende",
    image: "Din plugin bliver implementeret i en legendarisk server, dit alias bliver en urban legend.",
    ending: "secret-server",
    choices: [{ txt: "Spil igen", go: "start" }]
  },

  // fallback
  home-alone: {
    title: "Hjemme alene",
    image: "Stuen er stille, lyskæden blinker roligt.",
    choices: [
      { txt: "Ring til Emma senere", go: "ask-photo", effect: { hygge:+1 } },
      { txt: "Gå i seng tidligt", go: "ending-aloof", effect: { energy:+2 } }
    ]
  },

  send-guide: {
    title: "Sendte en guide",
    image: "Du sendte en guide og sparer tid, men taber goodwill.",
    choices: [
      { txt: "Arbejd videre", go: "ending-geek" },
      { txt: "Ring til familien", go: "afterwork-good" }
    ]
  },

  after-cash: {
    title: "Lidt ekstra i lommen",
    image: "Du tjente lidt på at sælge brikken, men er nysgerrig.",
    choices: [
      { txt: "Brug pengene til en gave til Emma", go: "afterwork-good", effect: { hygge:+1 } },
      { txt: "Investér i serveren", go: "ending-geek", effect: { ry:+1 } }
    ]
  },

  keep-contact: {
    title: "Kontakt gemt",
    image: "Du har nu en kontaktliste som kan åbne andre spor senere.",
    choices: [
      { txt: "Ring til kontakten", go: "collector", effect: { ry:+1 } },
      { txt: "Gem info for senere", go: "home-alone" }
    ]
  }
};

// Engine & Renderer
const el = {
  text: document.getElementById("text-area"),
  choices: document.getElementById("choices"),
  image: document.getElementById("scene-image"),
  inv: document.getElementById("inventory-list"),
  energy: document.getElementById("stat-energy"),
  hygge: document.getElementById("stat-hygge"),
  ry: document.getElementById("stat-ry"),
  saveBtn: document.getElementById("save-btn"),
  loadBtn: document.getElementById("load-btn"),
  restartBtn: document.getElementById("restart-btn")
};

function render() {
  const scene = scenes[state.scene];
  if(!scene){ console.warn("Missing scene:", state.scene); state.scene='start'; return render(); }
  el.text.innerHTML = `<h2>${scene.title}</h2><p>${scene.image}</p>`;
  el.image.style.backgroundImage = `linear-gradient(180deg, rgba(0,0,0,0.0), rgba(0,0,0,0.3))`;
  el.choices.innerHTML = "";
  scene.choices.forEach((c, idx) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.innerText = c.txt;
    btn.onclick = () => choose(c);
    el.choices.appendChild(btn);
  });

  // stats
  el.energy.textContent = state.stats.energy;
  el.hygge.textContent = state.stats.hygge;
  el.ry.textContent = state.stats.ry;

  // inventory
  if(state.inventory.length === 0){
    el.inv.innerHTML = "<li>(tom)</li>";
  } else {
    el.inv.innerHTML = "";
    state.inventory.forEach(it => {
      const li = document.createElement("li");
      li.textContent = it;
      el.inv.appendChild(li);
    })
  }
}

function applyEffect(effect) {
  if(!effect) return;
  if(effect.energy) state.stats.energy = clamp(state.stats.energy + effect.energy, 0, 10);
  if(effect.hygge) state.stats.hygge = clamp(state.stats.hygge + effect.hygge, 0, 10);
  if(effect.ry) state.stats.ry = clamp(state.stats.ry + effect.ry, 0, 10);
  if(effect.inventory_add) {
    state.inventory.push(effect.inventory_add);
  }
  if(effect.inventory_remove) {
    state.inventory = state.inventory.filter(i => i !== effect.inventory_remove);
  }
  if(effect.flags_add){
    if(!state.flags[effect.flags_add]) state.flags[effect.flags_add] = 0;
    state.flags[effect.flags_add] += 1;
  }
}

function choose(choice){
  applyEffect(choice.effect);
  // special checks for secret endings
  if(choice.go === 'unlock-secret' && state.inventory.includes('usb-stick') ){
    // if usb-stick and used_brick -> secret server ending possible later
    state.flags['secret_path'] = (state.flags['secret_path'] || 0) + 1;
  }
  // if amulet_taken goes to secret
  state.scene = choice.go;
  const sc = scenes[state.scene];
  if(sc && sc.ending){
    if(sc.ending === 'family') state.stats.hygge = clamp(state.stats.hygge + 2, 0, 10);
    if(sc.ending === 'bad') state.stats.ry = clamp(state.stats.ry - 2, 0, 10);
    if(sc.ending === 'secret-server'){
      // mark flag so player can revisit secret later
      state.flags['saw_legend'] = true;
    }
  }
  // if player took amulet earlier and has prototype, trigger secret server ending sometimes
  if(state.flags['amulet_taken'] && state.flags['has_prototype'] && Math.random() < 0.45){
    state.scene = 'secret-ending-2';
  }
  render();
}

function save(){
  localStorage.setItem("daniel_choice_save", JSON.stringify(state));
  alert("Spillet er gemt lokalt i din browser.");
}
function load(){
  const raw = localStorage.getItem("daniel_choice_save");
  if(!raw) return null;
  try { return JSON.parse(raw); } catch(e){ return null; }
}

function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }

// UI buttons
el.saveBtn.onclick = () => { localStorage.setItem("daniel_choice_save", JSON.stringify(state)); alert("Gemt!"); }
el.loadBtn.onclick = () => {
  const s = load();
  if(s){ state = s; render(); alert("Gemt spil indlæst."); }
  else alert("Ingen gemt spil fundet.");
}
el.restartBtn.onclick = () => { if(confirm("Vil du starte forfra?")) { state = structuredClone(initialState); render(); } }

// initial load or start
(function init(){
  const s = load();
  if(s) state = s;
  render();
})();
