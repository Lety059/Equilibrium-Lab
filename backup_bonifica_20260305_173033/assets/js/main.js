// Gestione menu attivo
document.addEventListener('DOMContentLoaded', function() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.main-nav a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (currentPath.includes(href) && href !== '') {
      link.classList.add('active');
    }
  });

  // Frase dinamica (se presente)
  const frasi = [
    "Il blocco non è pigrizia: è un meccanismo di difesa.",
    "L'iperfocus è un dono, ma anche una trappola.",
    "La chiusura protetta è il vero segreto della continuità.",
    "La soglia è dove tutto inizia.",
    "Dopo il crash, arriva sempre il recupero."
  ];
  const fraseEl = document.getElementById('random-phrase');
  if (fraseEl) {
    fraseEl.innerText = frasi[Math.floor(Math.random() * frasi.length)];
  }
});
