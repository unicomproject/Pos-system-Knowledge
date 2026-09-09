window.OV = window.OV || {};
OV.VERSION = "OO-06-ready-for-collection-production-prototype-v1";

OV.escape = function(value){
  return String(value)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
};
