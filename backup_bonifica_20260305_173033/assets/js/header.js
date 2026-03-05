document.addEventListener("DOMContentLoaded",function(){

  const header = document.createElement("header");
  header.innerHTML = `
  <div style="display:flex;justify-content:space-between;align-items:center;padding:20px 32px;border-bottom:1px solid rgba(255,255,255,0.05);position:sticky;top:0;background:#0e1117;z-index:1000;">
    <div style="font-weight:600;">Equilibrium Lab</div>
    <div style="display:flex;gap:24px;align-items:center;">
      <a href="/" style="text-decoration:none;color:#cfd6e6;">Home</a>
      <a href="/chi-siamo.html" style="text-decoration:none;color:#cfd6e6;">Chi Siamo</a>
      <a href="/framework.html" style="text-decoration:none;color:#cfd6e6;">Framework</a>
      <a href="/dashboard.html" style="text-decoration:none;color:#cfd6e6;">Dashboard</a>
      <div style="margin-left:20px;">
        <button onclick="setLang('it')" style="background:none;border:1px solid #444;color:#ccc;padding:4px 8px;border-radius:6px;">IT</button>
        <button onclick="setLang('en')" style="background:none;border:1px solid #444;color:#ccc;padding:4px 8px;border-radius:6px;">EN</button>
      </div>
    </div>
  </div>
  `;

  document.body.insertBefore(header, document.body.firstChild);
});
