OV.screenData = {
  orderId:"#EC250526-1001",
  customer:"Sarah Johnson",
  collectionText:"Today, 12:00 PM (in 2h 15m)",
  items:3,
  picked:0,
  remaining:"2h 15m",
  units:3,
  pending:3,
  issues:0,
  itemsList:[
    {
      id:"1",
      type:"jersey",
      title:"1. Man City Home Jersey 24/25",
      subtitle:"Size: M  •  Player: Haaland 9",
      sku:"SKU: MCJ-2425-S",
      location:"Aisle 12  •  Rack 04",
      locationCode:"A12-R04",
      picked:"0 / 1",
      active:true
    },
    {
      id:"2",
      type:"shirt",
      title:"2. Man City Core T-Shirt",
      subtitle:"Size: M  •  Color: Black",
      sku:"SKU: MCT-BLK-M",
      location:"Aisle 08  •  Rack 02",
      locationCode:"A08-R02",
      picked:"0 / 1",
      active:false
    },
    {
      id:"3",
      type:"cap",
      title:"3. Man City Cap",
      subtitle:"Size: One Size  •  Color: Black",
      sku:"SKU: MCC-BLK-OS",
      location:"Aisle 05  •  Rack 01",
      locationCode:"A05-R01",
      picked:"0 / 1",
      active:false
    }
  ]
};

OV.stressScreenData = {
  ...OV.screenData,
  orderId:"#EC250526-1001-EXTREMELY-LONG-IDENTIFIER-FOR-STRESS-TEST",
  customer:"Sarah Johnson-Montgomery-Wellington International Loyalty Customer",
  collectionText:"Today, 12:00 PM (in 2h 15m) — VIP Priority Collection Window",
  itemsList:[
    {
      ...OV.screenData.itemsList[0],
      title:"1. Man City Home Jersey 24/25 Limited Championship Long Product Name Edition",
      subtitle:"Size: Medium Tall  •  Player: Erling Braut Haaland 9  •  Custom Sleeve Badge",
      sku:"SKU: MCJ-2425-S-LONG-VARIANT-CUSTOM-001",
      location:"Aisle 12  •  Rack 04  •  Shelf B  •  Bin 19",
      locationCode:"A12-R04-SB19"
    },
    ...OV.screenData.itemsList.slice(1)
  ]
};
