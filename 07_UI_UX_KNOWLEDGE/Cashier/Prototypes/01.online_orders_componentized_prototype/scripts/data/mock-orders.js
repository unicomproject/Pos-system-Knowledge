OV.mockOrders = [
  {
    id:"#EC250526-1001", placed:"today, 09:15 AM", placedMin:555,
    customer:"Sarah Johnson", email:"sarah.j@email.com", phone:"07123 456789",
    items:3, units:3, collection:"Today 12:00 PM", collectionMin:720,
    collectionSub:"in 1h 45m", urgency:"Upcoming",
    status:"New", payment:"Paid", amount:74.99
  },
  {
    id:"#EC250526-1002", placed:"today, 09:45 AM", placedMin:585,
    customer:"Michael Brown", email:"michael.b@email.com", phone:"07890 123456",
    items:2, units:2, collection:"Today 01:00 PM", collectionMin:780,
    collectionSub:"in 2h 45m", urgency:"Upcoming",
    status:"New", payment:"Paid", amount:23.50
  },
  {
    id:"#EC250526-1003", placed:"today, 08:30 AM", placedMin:510,
    customer:"Emma Williams", email:"emma.w@email.com", phone:"07456 789012",
    items:4, units:4, collection:"Today 11:30 AM", collectionMin:690,
    collectionSub:"in 15m", urgency:"Upcoming",
    status:"Preparing", payment:"Paid", amount:59.98
  },
  {
    id:"#EC250526-1007", placed:"today, 07:50 AM", placedMin:470,
    customer:"Sophia Martinez", email:"sophia.m@email.com", phone:"07912 345678",
    items:2, units:2, collection:"Today 11:00 AM", collectionMin:660,
    collectionSub:"15m overdue", urgency:"Overdue",
    status:"Delayed", payment:"Paid", amount:69.99
  },
  {
    id:"#EC250526-1005", placed:"today, 06:30 AM", placedMin:390,
    customer:"Olivia Davis", email:"olivia.d@email.com", phone:"07700 987654",
    items:1, units:1, collection:"Today 10:00 AM", collectionMin:600,
    collectionSub:"1h 45m ago", urgency:"Overdue",
    status:"Ready", payment:"Paid", amount:89.95
  },
  {
    id:"#EC250526-1008", placed:"yesterday, 06:30 PM", placedMin:-330,
    customer:"William Anderson", email:"william.a@email.com", phone:"07777 889900",
    items:2, units:2, collection:"Yesterday 05:00 PM", collectionMin:-420,
    collectionSub:"Collected", urgency:"Overdue",
    status:"Collected", payment:"Paid", amount:31.00
  },
  {
    id:"#EC250526-1010", placed:"today, 10:10 AM", placedMin:610,
    customer:"Daniel Lee", email:"daniel.lee@email.com", phone:"07111 220033",
    items:5, units:6, collection:"Today 03:00 PM", collectionMin:900,
    collectionSub:"in 4h 45m", urgency:"Upcoming",
    status:"Cancelled", payment:"Paid", amount:102.40
  }
];

OV.stressOrder = {
  id:"#EC250526-VERY-LONG-ORDER-REFERENCE-123456789",
  placed:"today, 10:58 AM",
  placedMin:658,
  customer:"Alexandria-Catherine Montgomery-Wellington International Customer",
  email:"alexandria.montgomery-wellington+long-address@example-enterprise-domain.co.uk",
  phone:"+44 (0) 7700 900 123 extension 5544",
  items:128,
  units:999,
  collection:"Today 11:59 PM — Extended Collection Window",
  collectionMin:1439,
  collectionSub:"in 12h 44m",
  urgency:"Upcoming",
  status:"Preparing",
  payment:"Cash Due",
  amount:9876543.21
};

OV.summaryCounts = {
  New: 8,
  Preparing: 12,
  Ready: 6,
  Delayed: 2,
  Collected: 24,
  Cancelled: 4
};
