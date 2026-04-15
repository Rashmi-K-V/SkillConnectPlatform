

export const CATEGORY_DATA = {
  electrician: {
    icon: "⚡",
    label: "Electrician",
    workTypes: [
      { id: "wiring",        label: "New Wiring / Rewiring",          minPrice: 800,  maxPrice: 5000  },
      { id: "repair",        label: "Electrical Repair",              minPrice: 300,  maxPrice: 2000  },
      { id: "switchboard",   label: "Switchboard Installation",       minPrice: 500,  maxPrice: 3000  },
      { id: "fan",           label: "Fan / Light Fitting",            minPrice: 200,  maxPrice: 800   },
      { id: "inverter",      label: "Inverter / UPS Setup",           minPrice: 600,  maxPrice: 3000  },
      { id: "mcb",           label: "MCB / Fuse Box Replacement",     minPrice: 400,  maxPrice: 2500  },
      { id: "ac",            label: "AC Installation / Repair",       minPrice: 700,  maxPrice: 4000  },
      { id: "inspection",    label: "Electrical Inspection",          minPrice: 500,  maxPrice: 2000  },
    ],
  },
  plumber: {
    icon: "🔧",
    label: "Plumber",
    workTypes: [
      { id: "leak",          label: "Pipe Leak Repair",               minPrice: 300,  maxPrice: 2000  },
      { id: "tap",           label: "Tap / Faucet Replacement",       minPrice: 200,  maxPrice: 1000  },
      { id: "drain",         label: "Drain Cleaning / Unclogging",    minPrice: 400,  maxPrice: 2500  },
      { id: "toilet",        label: "Toilet Repair / Installation",   minPrice: 500,  maxPrice: 3000  },
      { id: "geyser",        label: "Geyser / Water Heater",          minPrice: 600,  maxPrice: 3500  },
      { id: "tank",          label: "Water Tank Cleaning",            minPrice: 800,  maxPrice: 4000  },
      { id: "pipeline",      label: "New Pipeline Installation",      minPrice: 1000, maxPrice: 8000  },
      { id: "motor",         label: "Motor / Pump Repair",            minPrice: 500,  maxPrice: 3000  },
    ],
  },
  cleaner: {
    icon: "🧹",
    label: "Cleaner",
    workTypes: [
      { id: "home",          label: "Home Deep Cleaning",             minPrice: 800,  maxPrice: 4000  },
      { id: "kitchen",       label: "Kitchen Cleaning",               minPrice: 500,  maxPrice: 2500  },
      { id: "bathroom",      label: "Bathroom Cleaning",              minPrice: 400,  maxPrice: 2000  },
      { id: "sofa",          label: "Sofa / Carpet Cleaning",         minPrice: 600,  maxPrice: 3000  },
      { id: "office",        label: "Office Cleaning",                minPrice: 1000, maxPrice: 6000  },
      { id: "post_constr",   label: "Post-Construction Cleanup",      minPrice: 2000, maxPrice: 10000 },
      { id: "window",        label: "Window / Glass Cleaning",        minPrice: 400,  maxPrice: 2000  },
      { id: "pest",          label: "Pest Control",                   minPrice: 800,  maxPrice: 5000  },
    ],
  },
  cook: {
    icon: "🍳",
    label: "Cook",
    workTypes: [
      { id: "daily",         label: "Daily Cooking (Home)",           minPrice: 3000, maxPrice: 15000 },
      { id: "party",         label: "Party / Event Catering",         minPrice: 1500, maxPrice: 20000 },
      { id: "tiffin",        label: "Tiffin / Meal Prep Service",     minPrice: 2000, maxPrice: 8000  },
      { id: "baking",        label: "Baking / Cake Making",           minPrice: 500,  maxPrice: 5000  },
      { id: "diet",          label: "Diet / Special Meals",           minPrice: 4000, maxPrice: 18000 },
      { id: "cooking_class", label: "Cooking Classes",                minPrice: 500,  maxPrice: 3000  },
      { id: "corporate",     label: "Corporate Lunch Service",        minPrice: 5000, maxPrice: 30000 },
    ],
  },
  tailor: {
    icon: "🧵",
    label: "Tailor",
    workTypes: [
      { id: "blouse",        label: "Blouse Stitching",               minPrice: 300,  maxPrice: 1500  },
      { id: "salwar",        label: "Salwar / Kameez Stitching",      minPrice: 400,  maxPrice: 2000  },
      { id: "saree_fall",    label: "Saree Fall / Pico",              minPrice: 100,  maxPrice: 500   },
      { id: "alteration",    label: "Alteration / Adjustment",        minPrice: 100,  maxPrice: 800   },
      { id: "lehenga",       label: "Lehenga Stitching",              minPrice: 1000, maxPrice: 8000  },
      { id: "mens_shirt",    label: "Men's Shirt / Trouser",          minPrice: 400,  maxPrice: 2500  },
      { id: "embroidery",    label: "Embroidery Work",                minPrice: 500,  maxPrice: 5000  },
      { id: "kurta",         label: "Kurta / Pyjama Stitching",       minPrice: 400,  maxPrice: 2000  },
    ],
  },
};

export const ALL_CATEGORIES = Object.keys(CATEGORY_DATA);

export function getCategoryData(category) {
  return CATEGORY_DATA[category?.toLowerCase()] || null;
}