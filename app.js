// Robust app.js — paste & replace your existing app.js
// Denne version venter på DOM, binder funktioner til window og logger fejl.

(function(){
  'use strict';

  // basic state + scenes (kort version af dit spil)
  const initialState = {
    player: { name: "Daniel Hagen" },
    stats: { energy: 7, hygge: 6, ry: 5 },
    inventory: [],
    scene: "start",
    flags: {}
  };

  let state = null;

  // scenes (samme som du havde — forkortet ikke nødvendig, jeg beholder dine eksisterende scener)
  const scenes = {
    start: {
      title: "Morgen i lejligheden",
      image: "Du vågner i din lejlighed, lyskæden kaster et blødt skær på bogreolen. Din telefon ringer — det er Sara.",
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
        { txt: "Fortsæt kode — serveren kalder", go: "ending-geek", effect: { ry:+1 } }
      ]
    },
    // fallback scenes from your original file (make sure your full set is here)
    prep-repair: {
      title: "Klar til job",
      image: "Du pakker værktøj og tænker på rutiner.",
      choices: [
        { txt: "Kør til butikken", go: "repair-shop", effect: { energy:-2, ry:+1 } },
        { txt: "Send en guide i stedet", go: "send-guide", effect: { ry:-1 } }
      ]
    },
    repair-shop: {
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
    send-guide: {
      title: "Sendte en guide",
      image: "Du sendte en guide og sparer tid, men taber goodwill.",
      choices: [
        { txt: "Arbejd videre", go: "ending-geek" },
        { txt: "Ring til familien", go: "afterwork-good" }
      ]
    },
    home-alone: {
      title: "Hjemme alene",
      image: "Stuen er stille, lyskæden blinker roligt.",
      choices: [
        { txt: "Ring til Emma senere", go: "ask-photo", effect: { hygge:+1 } },
        { txt: "Gå i seng tidligt", go: "ending-aloof", effect: { energy:+2 } }
      ]
    }
  };

  // DOM refs will be set after DOMContentLoaded
  let el = {};

  function setupDOMRefs(){
    el = {
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
  }

  function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }

  function render() {
    try {
      const scene = scenes[state.scene];
      if(!scene){ console.warn("Missing scene:", state.scene); state.scene="start"; return render(); }
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

      el.energy.textContent = state.stats.energy;
      el.hygge.textContent = state.stats.hygge;
      el.ry.textContent = state.stats.ry;

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
    } catch(err){
      console.error('Render error:', err);
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
      state.flags[effect.flags_add] = (state.flags[effect.flags_add] || 0) + 1;
    }
  }

  function choose(choice){
    try {
      applyEffect(choice.effect);
      state.scene = choice.go;
      const sc = scenes[state.scene];
      if(sc && sc.ending){
        if(sc.ending === 'family') state.stats.hygge = clamp(state.stats.hygge + 2, 0, 10);
        if(sc.ending === 'bad') state.stats.ry = clamp(state.stats.ry - 2, 0, 10);
      }
      render();
    } catch(err){
      console.error('Choose error:', err);
    }
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

  function attachUIBindings(){
    if(el.saveBtn) el.saveBtn.onclick = save;
    if(el.loadBtn) el.loadBtn.onclick = () => {
      const s = load();
      if(s){ state = s; render(); alert("Gemt spil indlæst."); }
      else alert("Ingen gemt spil fundet.");
    };
    if(el.restartBtn) el.restartBtn.onclick = () => { if(confirm("Vil du starte forfra?")) { state = structuredClone(initialState); render(); } };
  }

  // Initialize once DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    try {
      setupDOMRefs();
      state = load() || structuredClone(initialState);
      attachUIBindings();

      // Expose for debugging
      window.render = render;
      window.choose = choose;
      window.state = state;

      // initial render to prepare UI (but game remains hidden until Start pressed)
      render();

      console.log('app.js initialized — render() exposed on window.render');
    } catch(err){
      console.error('Initialization error:', err);
    }
  });

})();