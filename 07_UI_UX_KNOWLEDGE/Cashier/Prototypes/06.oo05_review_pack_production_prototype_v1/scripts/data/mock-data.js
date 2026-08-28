OV.mock = {
  orderId:"#EC250526-1001",
  customer:"Sarah Johnson",
  collectionStore:"Etihad Stadium Store",
  collectionTime:"Today, 12:00 PM",
  remaining:"15m remaining",

  step:"2 of 3",
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
  },

  items:[
    {
      type:"jersey",
      name:"Man City Home Jersey 24/25",
      meta:"Size: M  •  Player: Haaland 9",
      sku:"SKU: MCJ-2425-S",
      location:"Aisle 12  •  Rack 04",
      picked:"1 of 1"
    },
    {
      type:"shirt",
      name:"Man City Core T-Shirt",
      meta:"Size: M  •  Color: Black",
      sku:"SKU: MCT-BLK-M",
      location:"Aisle 08  •  Rack 02",
      picked:"1 of 1"
    },
    {
      type:"cap",
      name:"Man City Cap",
      meta:"Size: One Size  •  Color: Black",
      sku:"SKU: MCC-BLK-OS",
      location:"Aisle 05  •  Rack 01",
      picked:"1 of 1"
    }
  ]
};

OV.mockStress = {
  ...OV.mock,
  orderId:"#EC250526-1001-LONG-REFERENCE-FOR-STRESS",
  customer:"Sarah Johnson-Montgomery-Wellington International Loyalty Customer",
  collectionStore:"Etihad Stadium Store — North Concourse Click & Collect Pickup Point",
  items:[
    {
      ...OV.mock.items[0],
      name:"Man City Home Jersey 24/25 Limited Championship Personalised Special Edition",
      meta:"Size: Medium Tall  •  Player: Erling Braut Haaland 9  •  Custom Sleeve Badge",
      sku:"SKU: MCJ-2425-S-LONG-CUSTOM-VARIANT-001",
      location:"Aisle 12  •  Rack 04  •  Shelf B  •  Bin 19"
    },
    ...OV.mock.items.slice(1)
  ]
};
