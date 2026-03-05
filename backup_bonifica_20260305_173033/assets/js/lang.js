(function(){
  const currentLang = localStorage.getItem("eq_lang");

  if(!currentLang){
    localStorage.setItem("eq_lang","it");
  }

  window.setLang = function(lang){
    localStorage.setItem("eq_lang",lang);
    if(lang === "en"){
      if(!location.pathname.startsWith("/en")){
        window.location.href = "/en/index.html";
      }
    } else {
      if(location.pathname.startsWith("/en")){
        window.location.href = "/";
      }
    }
  };
})();
