(() => {
    const input = document.getElementById("pokeInput");
    const btn = document.getElementById("pokeBtn");
    const msg = document.getElementById("pokeMsg");
  
    const result = document.getElementById("pokeResult");
    const img = document.getElementById("pokeImg");
    const nameEl = document.getElementById("pokeName");
  
    // Si la página no tiene el widget, no hacemos nada
    if (!input || !btn || !msg || !result || !img || !nameEl) return;
  
    const API = "https://pokeapi.co/api/v2/pokemon/";
  
    function showMessage(text, isError = false) {
      msg.style.display = "block";
      msg.textContent = text;
      msg.className = isError ? "poke-msg error" : "poke-msg ok";
    }
  
    function clearMessage() {
      msg.style.display = "none";
      msg.textContent = "";
    }
  
    async function loadPokemon(q) {
      clearMessage();
      result.style.display = "none";
  
      const query = (q || "").trim().toLowerCase();
      if (!query) {
        showMessage("Escribe un nombre o ID.", true);
        return;
      }
  
      try {
        btn.disabled = true;
        btn.textContent = "Cargando...";
  
        const res = await fetch(API + encodeURIComponent(query));
        if (!res.ok) throw new Error("No encontrado");
  
        const data = await res.json();
  
        const displayName = data.name.charAt(0).toUpperCase() + data.name.slice(1);
        const sprite =
          data?.sprites?.other?.["official-artwork"]?.front_default ||
          data?.sprites?.front_default;
  
        if (!sprite) {
          showMessage("Encontré el Pokémon, pero no tiene imagen.", true);
          return;
        }
  
        img.src = sprite;
        img.alt = `Imagen de ${displayName}`;
        nameEl.textContent = `${displayName} (#${data.id})`;
  
        result.style.display = "flex";
        showMessage("Listo ✅");
      } catch (e) {
        showMessage("No encontré ese Pokémon. Prueba 'pikachu' o '25'.", true);
      } finally {
        btn.disabled = false;
        btn.textContent = "Buscar";
      }
    }
  
    btn.addEventListener("click", () => loadPokemon(input.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") loadPokemon(input.value);
    });
  
    // Por defecto al abrir:
    loadPokemon("pikachu");
  })();