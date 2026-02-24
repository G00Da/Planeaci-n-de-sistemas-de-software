async function loadPartials() {
    const headerSlot = document.getElementById("header-slot");
    const footerSlot = document.getElementById("footer-slot");
  
    if (headerSlot) {
      const headerHtml = await fetch("header.html").then(r => r.text());
      headerSlot.innerHTML = headerHtml;
    }
  
    if (footerSlot) {
      const footerHtml = await fetch("footer.html").then(r => r.text());
      footerSlot.innerHTML = footerHtml;
    }
  
    setupUserUI();
  }
  
  function getSession() {
    const token = sessionStorage.getItem("token");
    const user = sessionStorage.getItem("user");
    return { token, user };
  }
  
  function setupUserUI() {
    const { token, user } = getSession();
  
    const userLabel = document.getElementById("userLabel");
    const logoutBtn = document.getElementById("logoutBtn");
  
    if (!userLabel || !logoutBtn) return; // por si alguna página no tiene header
  
    if (token && user) {
      userLabel.textContent = `Hola, ${user}`;
      logoutBtn.style.display = "inline-block";
      logoutBtn.onclick = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        window.location.href = "LOGIN.html";
      };
    } else {
      userLabel.textContent = "Invitado";
      logoutBtn.style.display = "none";
    }
  }
  
  function requireAuth() {
    const { token } = getSession();
    if (!token) {
      window.location.href = "LOGIN.html";
    }
  }
  
  document.addEventListener("DOMContentLoaded", loadPartials);