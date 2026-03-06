(() => {
  window.__pokemonSearchLoaded = true;
  console.log("pokemonSearch.js cargado");

  const API_POKEMON = "https://pokeapi.co/api/v2/pokemon/";
  const API_TYPE = "https://pokeapi.co/api/v2/type/";

  const input = document.getElementById("searchInput");
  const btn = document.getElementById("searchBtn");
  const status = document.getElementById("searchStatus");

  const resultCard = document.getElementById("resultCard");
  const pokeName = document.getElementById("pokeName");
  const pokeId = document.getElementById("pokeId");
  const pokeTypes = document.getElementById("pokeTypes");
  const pokeExtra = document.getElementById("pokeExtra");
  const pokeImg = document.getElementById("pokeImg");
  const pokeAbilities = document.getElementById("pokeAbilities");
  const pokeStats = document.getElementById("pokeStats");

  const typeResultsSection = document.getElementById("typeResultsSection");
  const typeResultsGrid = document.getElementById("typeResultsGrid");
  const typeTitle = document.getElementById("typeTitle");

  if (!input || !btn) {
    console.error("No se encontro searchInput o searchBtn");
    return;
  }

  const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

  const knownTypes = [
    "normal", "fire", "water", "electric", "grass", "ice",
    "fighting", "poison", "ground", "flying", "psychic", "bug",
    "rock", "ghost", "dragon", "dark", "steel", "fairy"
  ];

  function setStatus(msg) {
    if (status) status.textContent = msg || "";
  }

  function clearIndividualResult() {
    if (resultCard) resultCard.style.display = "none";
  }

  function clearTypeResults() {
    if (typeResultsSection) typeResultsSection.style.display = "none";
    if (typeResultsGrid) typeResultsGrid.innerHTML = "";
  }

  function setTypes(types) {
    if (!pokeTypes) return;
    pokeTypes.innerHTML = "";

    types.forEach((t) => {
      const span = document.createElement("span");
      span.className = "type-pill";
      span.textContent = cap(t);
      pokeTypes.appendChild(span);
    });
  }

  function setAbilities(abilities) {
    if (!pokeAbilities) return;
    pokeAbilities.innerHTML = "";

    abilities.forEach((ability) => {
      const span = document.createElement("span");
      span.className = "ability-pill";
      span.textContent = cap(ability);
      pokeAbilities.appendChild(span);
    });
  }

  function setStats(stats) {
    if (!pokeStats) return;
    pokeStats.innerHTML = "";

    stats.forEach((stat) => {
      const row = document.createElement("div");
      row.className = "stat-row";

      row.innerHTML = `
        <span class="stat-name">${cap(stat.name)}</span>
        <span class="stat-value">${stat.value}</span>
      `;

      pokeStats.appendChild(row);
    });
  }

  function getSprite(data) {
    return (
      data?.sprites?.other?.["official-artwork"]?.front_default ||
      data?.sprites?.front_default ||
      ""
    );
  }

  function renderTypeCards(pokemonList, typeName) {
    clearIndividualResult();

    if (!typeResultsGrid || !typeResultsSection || !typeTitle) return;

    typeTitle.textContent = `Pokemones tipo ${cap(typeName)}`;

    typeResultsGrid.innerHTML = pokemonList.map((pokemon) => {
      const name = cap(pokemon.name);
      const img = pokemon.img || "";
      const id = pokemon.id || "?";

      const typesHTML = (pokemon.types || []).map(type => {
        return `<span class="type-pill">${cap(type)}</span>`;
      }).join("");

      const abilitiesHTML = (pokemon.abilities || []).map(ability => {
        return `<span class="ability-pill">${cap(ability)}</span>`;
      }).join("");

      const statsHTML = (pokemon.stats || []).map(stat => {
        return `
          <div class="stat-row">
            <span class="stat-name">${cap(stat.name)}</span>
            <span class="stat-value">${stat.value}</span>
          </div>
        `;
      }).join("");

      return `
        <article class="poke-card">
          <div class="poke-top">
            <div class="poke-id">#${id}</div>
            <img class="poke-img" src="${img}" alt="Imagen de ${name}" />
          </div>

          <h3 class="poke-name">${name}</h3>

          <div class="poke-types">
            ${typesHTML}
          </div>

          <div class="mini-section">
            <h4>Habilidades</h4>
            <div class="poke-abilities">
              ${abilitiesHTML}
            </div>
          </div>

          <div class="mini-section">
            <h4>Stats</h4>
            <div class="poke-stats">
              ${statsHTML}
            </div>
          </div>
        </article>
      `;
    }).join("");

    typeResultsSection.style.display = "block";
  }

  async function searchSinglePokemon(query) {
    clearTypeResults();
    setStatus("Buscando pokemon...");
    clearIndividualResult();

    const res = await fetch(API_POKEMON + encodeURIComponent(query));
    if (!res.ok) {
      throw new Error("Pokemon no encontrado");
    }

    const data = await res.json();

    const name = cap(data.name);
    const id = data.id;
    const types = (data.types || []).map(x => x.type.name);
    const abilities = (data.abilities || []).map(x => x.ability.name);
    const stats = (data.stats || []).map(x => ({
      name: x.stat.name,
      value: x.base_stat
    }));
    const img = getSprite(data);

    pokeName.textContent = name;
    pokeId.textContent = `#${id}`;
    setTypes(types);
    setAbilities(abilities);
    setStats(stats);

    const heightM = (data.height / 10).toFixed(1);
    const weightKg = (data.weight / 10).toFixed(1);
    pokeExtra.textContent = `Altura: ${heightM} m | Peso: ${weightKg} kg`;

    pokeImg.src = img;
    pokeImg.alt = `Imagen de ${name}`;

    resultCard.style.display = "block";
    setStatus("");
  }

  async function searchByType(typeName) {
    clearIndividualResult();
    clearTypeResults();
    setStatus(`Buscando pokemones tipo ${typeName}...`);

    const res = await fetch(API_TYPE + encodeURIComponent(typeName));
    if (!res.ok) {
      throw new Error("Tipo no encontrado");
    }

    const data = await res.json();

    const pokemonEntries = data.pokemon.slice(0, 24);

    const detailedPokemon = await Promise.all(
      pokemonEntries.map(async (entry) => {
        const pokemonRes = await fetch(entry.pokemon.url);
        const pokemonData = await pokemonRes.json();

        return {
          id: pokemonData.id,
          name: pokemonData.name,
          img: getSprite(pokemonData),
          types: (pokemonData.types || []).map(x => x.type.name),
          abilities: (pokemonData.abilities || []).map(x => x.ability.name),
          stats: (pokemonData.stats || []).map(x => ({
            name: x.stat.name,
            value: x.base_stat
          }))
        };
      })
    );

    renderTypeCards(detailedPokemon, typeName);
    setStatus(`Se encontraron ${detailedPokemon.length} pokemones tipo ${typeName}`);
  }

  async function handleSearch() {
    const q = (input.value || "").trim().toLowerCase();

    if (!q) {
      setStatus("Escribe un nombre, numero o tipo.");
      clearIndividualResult();
      clearTypeResults();
      return;
    }

    try {
      if (knownTypes.includes(q)) {
        await searchByType(q);
      } else {
        await searchSinglePokemon(q);
      }
    } catch (err) {
      console.error(err);
      setStatus("No se encontro un pokemon o tipo valido.");
      clearIndividualResult();
      clearTypeResults();
    }
  }

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    handleSearch();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  });
})();