(() => {
  const API = "https://pokeapi.co/api/v2/pokemon/";

  const input = document.getElementById("searchInput");
  const btn = document.getElementById("searchBtn");
  const status = document.getElementById("searchStatus");

  const resultCard = document.getElementById("resultCard");
  const pokeName = document.getElementById("pokeName");
  const pokeId = document.getElementById("pokeId");
  const pokeTypes = document.getElementById("pokeTypes");
  const pokeExtra = document.getElementById("pokeExtra");
  const pokeImg = document.getElementById("pokeImg");

  if (!input || !btn) return;

  const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

  function setStatus(msg) {
    status.textContent = msg || "";
  }

  function setTypes(types) {
    pokeTypes.innerHTML = "";
    types.forEach((t) => {
      const span = document.createElement("span");
      span.className = "type-pill";
      span.textContent = cap(t);
      pokeTypes.appendChild(span);
    });
  }

  function getSprite(data) {
    return (
      data?.sprites?.other?.["official-artwork"]?.front_default ||
      data?.sprites?.front_default ||
      ""
    );
  }

  async function searchPokemon() {
    const q = (input.value || "").trim().toLowerCase();

    if (!q) {
      setStatus("Escribe un nombre o un número.");
      resultCard.style.display = "none";
      return;
    }

    setStatus("Buscando...");
    resultCard.style.display = "none";

    try {
      const res = await fetch(API + encodeURIComponent(q));
      if (!res.ok) {
        throw new Error("No encontrado");
      }
      const data = await res.json();

      const name = cap(data.name);
      const id = data.id;
      const types = (data.types || []).map(x => x.type.name);
      const img = getSprite(data);

      pokeName.textContent = name;
      pokeId.textContent = `#${id}`;
      setTypes(types);

      const heightM = (data.height / 10).toFixed(1);
      const weightKg = (data.weight / 10).toFixed(1);
      pokeExtra.textContent = `Altura: ${heightM} m · Peso: ${weightKg} kg`;

      pokeImg.src = img;
      pokeImg.alt = `Imagen de ${name}`;

      resultCard.style.display = "block";
      setStatus("");

    } catch (err) {
      setStatus("No encontré ese Pokémon. Prueba con otro nombre o número.");
      resultCard.style.display = "none";
      console.error(err);
    }
  }

  btn.addEventListener("click", searchPokemon);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchPokemon();
  });

})();