OV.mock = {
  orderId:"#EC250526-1001",
  customer:"Sarah Johnson",
  collectionStore:"Etihad Stadium Store",
  collectionTime:"Today, 12:00 PM",
  collectionRemaining:"2h 15m remaining",

  title:"Pick: Man City Home Jersey 24/25",
  sequence:"1 of 3",
  meta:"Size: M  •  Player: Haaland 9  •  SKU: MCJ-2425-S",

  summary:{
    items:3,
    picked:"0 / 3",
    remaining:"2h 15m",
    units:3
  },

  currentItem:{
    locationCode:"A12-R04",
    locationText:"Aisle 12  •  Rack 04",
    toPick:1,
    picked:0,
    remaining:1
  },

  progress:{
    picked:0,
    pending:3,
    issues:0
  },

  nextItems:[
    {
      type:"shirt",
      name:"Man City Core T-Shirt",
      sub:"Size: M  •  Black",
      aisle:"Aisle 08",
      rack:"Rack 02"
    },
    {
      type:"cap",
      name:"Man City Cap",
      sub:"One Size  •  Black",
      aisle:"Aisle 05",
      rack:"Rack 01"
    }
  ]
};

OV.mockStress = {
  ...OV.mock,
  orderId:"#EC250526-1001-LONG-REFERENCE-TEST",
  customer:"Sarah Johnson-Montgomery-Wellington International Loyalty Customer",
  collectionStore:"Etihad Stadium Store — North Concourse Click & Collect Pickup Point",
  title:"Pick: Man City Home Jersey 24/25 Limited Championship Personalised Special Edition",
  meta:"Size: Medium Tall  •  Player: Erling Braut Haaland 9  •  SKU: MCJ-2425-S-LONG-CUSTOM-VARIANT-001",
  currentItem:{
    ...OV.mock.currentItem,
    locationCode:"A12-R04-SB19",
    locationText:"Aisle 12  •  Rack 04  •  Shelf B  •  Bin 19"
  }
};
