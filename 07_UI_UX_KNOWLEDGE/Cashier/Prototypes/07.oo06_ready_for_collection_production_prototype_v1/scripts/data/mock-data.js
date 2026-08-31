OV.mock = {
  orderId:"#EC250526-1001",
  customer:"Sarah Johnson",
  collectionStore:"Etihad Stadium Store",
  collectionTime:"Today, 12:00 PM",
  remaining:"15m remaining",
  step:"3 of 3",

  summary:{
    items:3,
    picked:"3 / 3",
    remaining:"15m",
    units:3
  },

  progress:{
    picked:3,
    pending:0,
    issues:0
  }
};

OV.mockStress = {
  ...OV.mock,
  orderId:"#EC250526-1001-LONG-REFERENCE-FOR-STRESS",
  customer:"Sarah Johnson-Montgomery-Wellington International Loyalty Customer",
  collectionStore:"Etihad Stadium Store — North Concourse Click & Collect Pickup Point"
};
