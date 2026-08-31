window.OV = window.OV || {};
OV.VERSION = "OO-05-review-pack-production-prototype-v1";

OV.escape = function(value){
  return String(value)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
};
