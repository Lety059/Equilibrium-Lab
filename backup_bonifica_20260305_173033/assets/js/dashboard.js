// Dashboard dell'Energia - Equilibrium Lab
// Salvataggio in localStorage, grafico e lista ultimi giorni

const STORAGE_KEY = 'equilibrium_dashboard';

function getEntries() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveEntry(energy, focus, closures) {
  const entries = getEntries();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const existingIndex = entries.findIndex(e => e.date === today);
  const newEntry = { date: today, energy, focus, closures };
  if (existingIndex !== -1) {
    entries[existingIndex] = newEntry;
  } else {
    entries.push(newEntry);
  }
  const sorted = entries.sort((a,b) => a.date.localeCompare(b.date)).slice(-90);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
  return sorted;
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}`;
}

function updateEntriesList(entries) {
  const listDiv = document.getElementById('entries-list');
  if (!listDiv) return;
  const last7 = entries.slice(-7).reverse();
  if (last7.length === 0) {
    listDiv.innerHTML = '<p>Nessun dato registrato. Inizia oggi!</p>';
    return;
  }
  let html = '';
  last7.forEach(e => {
    html += `<div class="entry-item">
      <span class="entry-date">${formatDate(e.date)}</span>
      <span>⚡${e.energy} | 🎯${e.focus} | ✅${e.closures}</span>
    </div>`;
  });
  listDiv.innerHTML = html;
}

function updateChart(entries) {
  const ctx = document.getElementById('trend-chart').getContext('2d');
  const last30 = entries.slice(-30);
  const labels = last30.map(e => formatDate(e.date));
  const energyData = last30.map(e => e.energy);
  const focusData = last30.map(e => e.focus);
  const closuresData = last30.map(e => e.closures);

  if (window.myChart) window.myChart.destroy();

  window.myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        { label: 'Energia', data: energyData, borderColor: '#0A2A44', backgroundColor: 'transparent', tension: 0.2 },
        { label: 'Focus', data: focusData, borderColor: '#C6A43F', backgroundColor: 'transparent', tension: 0.2 },
        { label: 'Chiusure', data: closuresData, borderColor: '#2E2E2E', backgroundColor: 'transparent', tension: 0.2 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true, max: 10 } }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const entries = getEntries();
  updateEntriesList(entries);
  if (entries.length > 0) updateChart(entries);

  document.getElementById('save-btn').addEventListener('click', () => {
    const energy = parseInt(document.getElementById('energy').value, 10);
    const focus = parseInt(document.getElementById('focus').value, 10);
    const closures = parseInt(document.getElementById('closures').value, 10);
    const updated = saveEntry(energy, focus, closures);
    updateEntriesList(updated);
    updateChart(updated);
    alert('Giornata salvata!');
  });
});
