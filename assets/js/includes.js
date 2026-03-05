(async () => {
  const includes = document.querySelectorAll('[data-include]');
  for (const el of includes) {
    const file = el.getAttribute('data-include');
    try {
      const res = await fetch(`assets/partials/${file}.html`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Errore caricamento');
      el.innerHTML = await res.text();
    } catch (e) {
      console.warn(`Include fallito: ${file}`);
    }
  }
})();
