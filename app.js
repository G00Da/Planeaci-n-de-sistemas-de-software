document.addEventListener("DOMContentLoaded", () => {
  loadHeader();
  loadFooter();
});

async function loadHeader() {
  const headerSlot = document.getElementById("header-slot");

  if (!headerSlot) return;

  try {
    const response = await fetch("header.html");

    if (!response.ok) {
      throw new Error("No se pudo cargar header.html");
    }

    const headerHTML = await response.text();
    headerSlot.innerHTML = headerHTML;
  } catch (error) {
    console.error("Error cargando header:", error);
  }
}

async function loadFooter() {
  const footerSlot = document.getElementById("footer-slot");

  if (!footerSlot) return;

  try {
    const response = await fetch("footer.html");

    if (!response.ok) {
      throw new Error("No se pudo cargar footer.html");
    }

    const footerHTML = await response.text();
    footerSlot.innerHTML = footerHTML;
  } catch (error) {
    console.error("Error cargando footer:", error);
  }
}