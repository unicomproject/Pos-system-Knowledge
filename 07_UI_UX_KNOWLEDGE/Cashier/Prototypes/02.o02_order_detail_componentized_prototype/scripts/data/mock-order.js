OV.mockOrder = {
  id:"#EC250526-1001",
  status:"NEW",
  placedAt:"26 May 2025, 09:15 AM",
  source:"E-commerce Web",
  customer:{
    name:"Sarah Johnson",
    classification:"Guest"
  },
  collection:{
    outlet:"Etihad Stadium Store",
    displayTime:"Today, 12:00 PM",
    remaining:"2h 15m remaining"
  },
  payment:{
    status:"PAID ONLINE",
    amount:74.99
  },
  itemSummary:{
    itemCount:3,
    unitCount:3
  },
  items:[
    {
      id:"line-1",
      type:"jersey",
      name:"Man City Home Jersey 24/25",
      variant:"Size: M · Player: Haaland 9",
      sku:"MCJ-2425-S",
      quantity:1
    },
    {
      id:"line-2",
      type:"shirt",
      name:"Man City Core T-Shirt",
      variant:"Size: M · Color: Black",
      sku:"MCT-BLK-M",
      quantity:1
    },
    {
      id:"line-3",
      type:"cap",
      name:"Man City Cap",
      variant:"Size: One Size · Color: Black",
      sku:"MCC-BLK-OS",
      quantity:1
    }
  ]
};

OV.stressOrder = {
  id:"#EC250526-VERY-LONG-ORDER-REFERENCE-123456789",
  status:"NEW",
  placedAt:"26 May 2025, 09:15 AM with an intentionally long timestamp description",
  source:"E-commerce Web / Marketplace / Partner Channel",
  customer:{
    name:"Alexandria-Catherine Montgomery-Wellington International Customer Name",
    classification:"Guest Customer Classification With Long Presentation Text"
  },
  collection:{
    outlet:"Etihad Stadium Super Long Store Name — North Concourse Pickup Point",
    displayTime:"Today, 11:59 PM — Extended Collection Window",
    remaining:"12h 55m remaining"
  },
  payment:{
    status:"PAID ONLINE",
    amount:9876543.21
  },
  itemSummary:{
    itemCount:128,
    unitCount:999
  },
  items:[
    {
      id:"line-1",
      type:"jersey",
      name:"Man City Home Jersey 24/25 — Personalised Limited Edition With Very Long Product Name",
      variant:"Size: Extra Extra Large · Player: Very Long Personalisation Text · Colour: Sky Blue",
      sku:"MCJ-2425-VERY-LONG-SKU-REFERENCE-001",
      quantity:99
    },
    {
      id:"line-2",
      type:"shirt",
      name:"Man City Core T-Shirt With Long Promotional Product Description",
      variant:"Size: M · Color: Black · Collection Exclusive",
      sku:"MCT-BLK-M-LONG-REFERENCE",
      quantity:1
    },
    {
      id:"line-3",
      type:"cap",
      name:"Man City Cap — Adjustable Premium Edition",
      variant:"Size: One Size · Color: Black",
      sku:"MCC-BLK-OS-LONG-REF",
      quantity:1
    }
  ]
};
