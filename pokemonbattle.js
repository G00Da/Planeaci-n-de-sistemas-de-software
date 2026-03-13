(() => {
    const API = "https://pokeapi.co/api/v2/pokemon/";
  
    const pokemon1Input = document.getElementById("pokemon1Input");
    const pokemon2Input = document.getElementById("pokemon2Input");
    const startBattleBtn = document.getElementById("startBattleBtn");
    const nextTurnBtn = document.getElementById("nextTurnBtn");
    const resetBattleBtn = document.getElementById("resetBattleBtn");
    const battleStatus = document.getElementById("battleStatus");
  
    const battleArena = document.getElementById("battleArena");
    const winnerSection = document.getElementById("winnerSection");
    const battleLog = document.getElementById("battleLog");
    const turnTitle = document.getElementById("turnTitle");
  
    const p1Name = document.getElementById("p1Name");
    const p1Img = document.getElementById("p1Img");
    const p1HpBar = document.getElementById("p1HpBar");
    const p1HpText = document.getElementById("p1HpText");
  
    const p2Name = document.getElementById("p2Name");
    const p2Img = document.getElementById("p2Img");
    const p2HpBar = document.getElementById("p2HpBar");
    const p2HpText = document.getElementById("p2HpText");
  
    const winnerImg = document.getElementById("winnerImg");
    const winnerName = document.getElementById("winnerName");
  
    let battle = null;
  
    const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  
    function setStatus(msg) {
      battleStatus.textContent = msg || "";
    }
  
    function getSprite(data) {
      return (
        data?.sprites?.other?.["official-artwork"]?.front_default ||
        data?.sprites?.front_default ||
        ""
      );
    }
  
    function statValue(data, statName) {
      const stat = (data.stats || []).find(x => x.stat.name === statName);
      return stat ? stat.base_stat : 50;
    }
  
    async function fetchPokemon(query) {
      const res = await fetch(API + encodeURIComponent(query.trim().toLowerCase()));
      if (!res.ok) throw new Error("Pokemon no encontrado");
      return await res.json();
    }
  
    function makeFighter(data) {
      return {
        id: data.id,
        name: data.name,
        img: getSprite(data),
        hp: 100,
        maxHp: 100,
        turnsTaken: 0,
        attack: statValue(data, "attack"),
        defense: statValue(data, "defense"),
        spAttack: statValue(data, "special-attack"),
        spDefense: statValue(data, "special-defense"),
        speed: statValue(data, "speed"),
        nextDefenseMultiplier: 1
      };
    }
  
    function updateUI() {
      p1Name.textContent = cap(battle.p1.name);
      p1Img.src = battle.p1.img;
      p1Img.alt = `Imagen de ${cap(battle.p1.name)}`;
      p1HpBar.style.width = `${battle.p1.hp}%`;
      p1HpText.textContent = `${battle.p1.hp} / 100`;
  
      p2Name.textContent = cap(battle.p2.name);
      p2Img.src = battle.p2.img;
      p2Img.alt = `Imagen de ${cap(battle.p2.name)}`;
      p2HpBar.style.width = `${battle.p2.hp}%`;
      p2HpText.textContent = `${battle.p2.hp} / 100`;
  
      turnTitle.textContent = `Turno ${battle.turnNumber}`;
    }
  
    function appendLog(text) {
      const p = document.createElement("p");
      p.textContent = text;
      battleLog.prepend(p);
    }
  
    function randomFail() {
      return Math.random() < 0.2;
    }
  
    function randomAction(attacker) {
      const options = ["attack", "defend"];
  
      if (attacker.turnsTaken >= 3) {
        options.push("special-attack");
      }
  
      if (attacker.turnsTaken >= 2) {
        options.push("special-defend");
      }
  
      const index = Math.floor(Math.random() * options.length);
      return options[index];
    }
  
    function calculateDamage(attacker, defender, special) {
      const atk = special ? attacker.spAttack : attacker.attack;
      const def = special ? defender.spDefense : defender.defense;
      const raw = Math.max(8, Math.round((atk / Math.max(1, def)) * 22));
      const scaled = special ? Math.round(raw * 1.35) : raw;
      return Math.max(5, Math.round(scaled * defender.nextDefenseMultiplier));
    }
  
    function processDefense(target, special) {
      if (randomFail()) {
        return {
          ok: false,
          text: special
            ? `${cap(target.name)} intento defensa especial, pero fallo.`
            : `${cap(target.name)} intento defenderse, pero fallo.`
        };
      }
  
      target.nextDefenseMultiplier = special ? 0.35 : 0.55;
  
      return {
        ok: true,
        text: special
          ? `${cap(target.name)} uso defensa especial y reducira mucho el proximo dano.`
          : `${cap(target.name)} se defendio y reducira el proximo dano.`
      };
    }
  
    function processAttack(attacker, defender, special) {
      const actionName = special ? "ataque especial" : "ataque";
      if (randomFail()) {
        defender.nextDefenseMultiplier = 1;
        return {
          text: `${cap(attacker.name)} uso ${actionName}, pero fallo.`
        };
      }
  
      const damage = calculateDamage(attacker, defender, special);
      defender.hp = Math.max(0, defender.hp - damage);
      const remaining = defender.hp;
      defender.nextDefenseMultiplier = 1;
  
      return {
        text: `${cap(attacker.name)} uso ${actionName}, hizo ${damage} de dano y dejo a ${cap(defender.name)} con ${remaining} de 100 de vida.`
      };
    }
  
    function executeTurn() {
      if (!battle || battle.finished) return;
  
      const attacker = battle.current === 1 ? battle.p1 : battle.p2;
      const defender = battle.current === 1 ? battle.p2 : battle.p1;
  
      attacker.turnsTaken += 1;
  
      const action = randomAction(attacker);
  
      let result;
  
      if (action === "attack") {
        result = processAttack(attacker, defender, false);
      } else if (action === "special-attack") {
        result = processAttack(attacker, defender, true);
      } else if (action === "defend") {
        result = processDefense(attacker, false);
      } else {
        result = processDefense(attacker, true);
      }
  
      appendLog(result.text);
      updateUI();
  
      if (battle.p1.hp <= 0 || battle.p2.hp <= 0) {
        battle.finished = true;
        nextTurnBtn.disabled = true;
  
        const winner = battle.p1.hp > 0 ? battle.p1 : battle.p2;
        winnerImg.src = winner.img;
        winnerImg.alt = `Ganador ${cap(winner.name)}`;
        winnerName.textContent = cap(winner.name);
        winnerSection.style.display = "block";
        appendLog(`${cap(winner.name)} gano la batalla.`);
        return;
      }
  
      battle.current = battle.current === 1 ? 2 : 1;
      battle.turnNumber += 1;
      updateUI();
    }
  
    async function startBattle() {
      const q1 = pokemon1Input.value.trim();
      const q2 = pokemon2Input.value.trim();
  
      if (!q1 || !q2) {
        setStatus("Escribe dos Pokemon.");
        return;
      }
  
      setStatus("Cargando batalla...");
      winnerSection.style.display = "none";
      battleArena.style.display = "none";
      battleLog.innerHTML = "";
  
      try {
        const [data1, data2] = await Promise.all([
          fetchPokemon(q1),
          fetchPokemon(q2)
        ]);
  
        battle = {
          p1: makeFighter(data1),
          p2: makeFighter(data2),
          current: statValue(data1, "speed") >= statValue(data2, "speed") ? 1 : 2,
          turnNumber: 1,
          finished: false
        };
  
        updateUI();
        nextTurnBtn.disabled = false;
        battleArena.style.display = "block";
        appendLog(`La batalla comienza entre ${cap(battle.p1.name)} y ${cap(battle.p2.name)}.`);
        appendLog(`Empieza ${battle.current === 1 ? cap(battle.p1.name) : cap(battle.p2.name)} por velocidad.`);
        setStatus("");
      } catch (e) {
        setStatus("No se pudieron cargar los Pokemon.");
      }
    }
  
    function resetBattle() {
      battle = null;
      battleArena.style.display = "none";
      winnerSection.style.display = "none";
      battleLog.innerHTML = "";
      setStatus("");
      pokemon1Input.value = "";
      pokemon2Input.value = "";
    }
  
    startBattleBtn.addEventListener("click", startBattle);
    nextTurnBtn.addEventListener("click", executeTurn);
    resetBattleBtn.addEventListener("click", resetBattle);
  
    pokemon1Input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") startBattle();
    });
  
    pokemon2Input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") startBattle();
    });
  })();