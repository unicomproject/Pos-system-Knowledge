window.OV = window.OV || {};
OV.VERSION = "OO-04b-pick-item-production-prototype-v2";
OV.escape = function(value){
  return String(value)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
};
