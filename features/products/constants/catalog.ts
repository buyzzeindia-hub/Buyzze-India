export const PHONE_CATALOG: Record<string, any> = {
  Apple: {
    // 2020
    "iPhone 12": {
      ram: ["4GB"],
      storage: ["64GB", "128GB", "256GB"],
    },
    "iPhone 12 Pro": {
      ram: ["6GB"],
      storage: ["128GB", "256GB", "512GB"],
    },
    "iPhone SE (2020)": {
      ram: ["3GB"],
      storage: ["64GB", "128GB", "256GB"],
    },
    
    // 2021
    "iPhone 13": {
      ram: ["4GB"],
      storage: ["128GB", "256GB", "512GB"],
    },
    "iPhone 13 Pro": {
      ram: ["6GB"],
      storage: ["128GB", "256GB", "512GB", "1TB"],
    },
    
    // 2022
    "iPhone 14": {
      ram: ["6GB"],
      storage: ["128GB", "256GB", "512GB"],
    },
    "iPhone 14 Pro": {
      ram: ["6GB"],
      storage: ["128GB", "256GB", "512GB", "1TB"],
    },
    "iPhone SE (2022)": {
      ram: ["4GB"],
      storage: ["64GB", "128GB", "256GB"],
    },
    
    // 2023
    "iPhone 15": {
      ram: ["6GB"],
      storage: ["128GB", "256GB", "512GB"],
    },
    "iPhone 15 Pro": {
      ram: ["8GB"],
      storage: ["128GB", "256GB", "512GB", "1TB"],
    },
    
    // 2024
    "iPhone 16": {
      ram: ["8GB"],
      storage: ["128GB", "256GB", "512GB", "1TB"],
    },
  },

  Samsung: {
    // 2020
    "Galaxy S20": {
      ram: ["8GB", "12GB"],
      storage: ["128GB", "256GB", "512GB"],
    },
    "Galaxy Note 20": {
      ram: ["8GB"],
      storage: ["128GB", "256GB"],
    },
    "Galaxy A51": {
      ram: ["4GB", "6GB", "8GB"],
      storage: ["64GB", "128GB"],
    },
    
    // 2021
    "Galaxy S21": {
      ram: ["8GB"],
      storage: ["128GB", "256GB"],
    },
    "Galaxy Z Fold 3": {
      ram: ["12GB"],
      storage: ["256GB", "512GB"],
    },
    "Galaxy A52": {
      ram: ["4GB", "6GB", "8GB"],
      storage: ["128GB", "256GB"],
    },
    
    // 2022
    "Galaxy S22": {
      ram: ["8GB"],
      storage: ["128GB", "256GB"],
    },
    "Galaxy S22 Ultra": {
      ram: ["8GB", "12GB"],
      storage: ["128GB", "256GB", "512GB", "1TB"],
    },
    "Galaxy A53": {
      ram: ["6GB", "8GB"],
      storage: ["128GB", "256GB"],
    },
    "Galaxy Z Fold 4": {
      ram: ["12GB"],
      storage: ["256GB", "512GB", "1TB"],
    },
    
    // 2023
    "Galaxy S23": {
      ram: ["8GB"],
      storage: ["128GB", "256GB", "512GB"],
    },
    "Galaxy S23 Ultra": {
      ram: ["8GB", "12GB"],
      storage: ["256GB", "512GB", "1TB"],
    },
    "Galaxy Z Fold 5": {
      ram: ["12GB"],
      storage: ["256GB", "512GB", "1TB"],
    },
    "Galaxy A54": {
      ram: ["6GB", "8GB"],
      storage: ["128GB", "256GB"],
    },
    
    // 2024
    "Galaxy S24": {
      ram: ["8GB"],
      storage: ["128GB", "256GB", "512GB"],
    },
    "Galaxy S24 Ultra": {
      ram: ["12GB"],
      storage: ["256GB", "512GB", "1TB"],
    },
    "Galaxy Z Fold 6": {
      ram: ["12GB", "16GB"],
      storage: ["256GB", "512GB", "1TB"],
    },
  },

  Xiaomi: {
    // 2020
    "Redmi Note 9": {
      ram: ["3GB", "4GB", "6GB"],
      storage: ["64GB", "128GB"],
    },
    "Mi 10": {
      ram: ["8GB", "12GB"],
      storage: ["128GB", "256GB"],
    },
    
    // 2021
    "Redmi Note 10": {
      ram: ["4GB", "6GB"],
      storage: ["64GB", "128GB"],
    },
    "Mi 11": {
      ram: ["8GB", "12GB"],
      storage: ["128GB", "256GB"],
    },
    
    // 2022
    "Redmi Note 11": {
      ram: ["4GB", "6GB", "8GB"],
      storage: ["64GB", "128GB"],
    },
    "Xiaomi 12": {
      ram: ["8GB", "12GB"],
      storage: ["128GB", "256GB"],
    },
    "Redmi Note 12": {
      ram: ["4GB", "6GB", "8GB"],
      storage: ["64GB", "128GB", "256GB"],
    },
    
    // 2023
    "Redmi Note 13": {
      ram: ["6GB", "8GB", "12GB"],
      storage: ["128GB", "256GB", "512GB"],
    },
    "Xiaomi 13": {
      ram: ["8GB", "12GB"],
      storage: ["128GB", "256GB", "512GB"],
    },
    "Poco X6": {
      ram: ["8GB", "12GB"],
      storage: ["128GB", "256GB", "512GB"],
    },
    
    // 2024
    "Redmi Note 14": {
      ram: ["8GB", "12GB"],
      storage: ["128GB", "256GB", "512GB"],
    },
    "Xiaomi 14": {
      ram: ["12GB", "16GB"],
      storage: ["256GB", "512GB", "1TB"],
    },
  },

  Google: {
    // 2020
    "Pixel 5": {
      ram: ["8GB"],
      storage: ["128GB"],
    },
    
    // 2021
    "Pixel 6": {
      ram: ["8GB"],
      storage: ["128GB", "256GB"],
    },
    "Pixel 6 Pro": {
      ram: ["12GB"],
      storage: ["128GB", "256GB", "512GB"],
    },
    
    // 2022
    "Pixel 7": {
      ram: ["8GB"],
      storage: ["128GB", "256GB"],
    },
    "Pixel 7 Pro": {
      ram: ["12GB"],
      storage: ["128GB", "256GB", "512GB"],
    },
    
    // 2023
    "Pixel 8": {
      ram: ["8GB"],
      storage: ["128GB", "256GB"],
    },
    "Pixel 8 Pro": {
      ram: ["12GB"],
      storage: ["128GB", "256GB", "512GB", "1TB"],
    },
    
    // 2024
    "Pixel 9": {
      ram: ["8GB"],
      storage: ["128GB", "256GB"],
    },
    "Pixel 9 Pro": {
      ram: ["12GB"],
      storage: ["128GB", "256GB", "512GB"],
    },
  },

  OnePlus: {
    // 2020
    "OnePlus 8": {
      ram: ["8GB", "12GB"],
      storage: ["128GB", "256GB"],
    },
    "OnePlus 8 Pro": {
      ram: ["8GB", "12GB"],
      storage: ["128GB", "256GB"],
    },
    "OnePlus Nord": {
      ram: ["6GB", "8GB", "12GB"],
      storage: ["64GB", "128GB", "256GB"],
    },
    
    // 2021
    "OnePlus 9": {
      ram: ["8GB", "12GB"],
      storage: ["128GB", "256GB"],
    },
    "OnePlus 9 Pro": {
      ram: ["8GB", "12GB"],
      storage: ["128GB", "256GB"],
    },
    "OnePlus Nord 2": {
      ram: ["6GB", "8GB", "12GB"],
      storage: ["128GB", "256GB"],
    },
    
    // 2022
    "OnePlus 10 Pro": {
      ram: ["8GB", "12GB"],
      storage: ["128GB", "256GB", "512GB"],
    },
    "OnePlus Nord CE 2": {
      ram: ["6GB", "8GB"],
      storage: ["128GB"],
    },
    
    // 2023
    "OnePlus 11": {
      ram: ["8GB", "16GB"],
      storage: ["128GB", "256GB", "512GB"],
    },
    "OnePlus Nord 3": {
      ram: ["8GB", "16GB"],
      storage: ["128GB", "256GB"],
    },
    
    // 2024
    "OnePlus 12": {
      ram: ["12GB", "16GB"],
      storage: ["256GB", "512GB", "1TB"],
    },
    "OnePlus Open": {
      ram: ["16GB"],
      storage: ["512GB"],
    },
  },

  Oppo: {
    // 2020
    "Oppo Find X2": {
      ram: ["8GB", "12GB"],
      storage: ["256GB", "512GB"],
    },
    "Oppo Reno 4": {
      ram: ["8GB"],
      storage: ["128GB", "256GB"],
    },
    
    // 2021
    "Oppo Find X3 Pro": {
      ram: ["12GB"],
      storage: ["256GB"],
    },
    "Oppo Reno 6": {
      ram: ["8GB", "12GB"],
      storage: ["128GB", "256GB"],
    },
    
    // 2022
    "Oppo Find X5 Pro": {
      ram: ["12GB"],
      storage: ["256GB", "512GB"],
    },
    "Oppo Reno 8": {
      ram: ["8GB", "12GB"],
      storage: ["128GB", "256GB"],
    },
    
    // 2023
    "Oppo Find X6 Pro": {
      ram: ["12GB", "16GB"],
      storage: ["256GB", "512GB"],
    },
    "Oppo Reno 10": {
      ram: ["8GB", "12GB"],
      storage: ["128GB", "256GB"],
    },
    
    // 2024
    "Oppo Find X7 Ultra": {
      ram: ["12GB", "16GB"],
      storage: ["256GB", "512GB", "1TB"],
    },
    "Oppo Reno 11": {
      ram: ["8GB", "12GB"],
      storage: ["128GB", "256GB", "512GB"],
    },
  },

  Vivo: {
    // 2020
    "Vivo X50 Pro": {
      ram: ["8GB"],
      storage: ["128GB", "256GB"],
    },
    "Vivo V20": {
      ram: ["8GB"],
      storage: ["128GB", "256GB"],
    },
    
    // 2021
    "Vivo X60 Pro": {
      ram: ["12GB"],
      storage: ["256GB"],
    },
    "Vivo V21": {
      ram: ["8GB"],
      storage: ["128GB", "256GB"],
    },
    
    // 2022
    "Vivo X80 Pro": {
      ram: ["12GB"],
      storage: ["256GB", "512GB"],
    },
    "Vivo V25": {
      ram: ["8GB", "12GB"],
      storage: ["128GB", "256GB"],
    },
    
    // 2023
    "Vivo X90 Pro": {
      ram: ["12GB"],
      storage: ["256GB", "512GB"],
    },
    "Vivo V29": {
      ram: ["8GB", "12GB"],
      storage: ["128GB", "256GB"],
    },
    
    // 2024
    "Vivo X100 Pro": {
      ram: ["12GB", "16GB"],
      storage: ["256GB", "512GB", "1TB"],
    },
    "Vivo V30": {
      ram: ["8GB", "12GB"],
      storage: ["128GB", "256GB", "512GB"],
    },
  },

  Realme: {
    // 2020
    "Realme 7 Pro": {
      ram: ["6GB", "8GB"],
      storage: ["128GB"],
    },
    "Realme X50 Pro": {
      ram: ["8GB", "12GB"],
      storage: ["128GB", "256GB"],
    },
    
    // 2021
    "Realme 8 Pro": {
      ram: ["6GB", "8GB"],
      storage: ["128GB"],
    },
    "Realme GT": {
      ram: ["8GB", "12GB"],
      storage: ["128GB", "256GB"],
    },
    
    // 2022
    "Realme 9 Pro": {
      ram: ["6GB", "8GB"],
      storage: ["128GB"],
    },
    "Realme GT 2 Pro": {
      ram: ["8GB", "12GB"],
      storage: ["128GB", "256GB", "512GB"],
    },
    
    // 2023
    "Realme 11 Pro": {
      ram: ["8GB", "12GB"],
      storage: ["128GB", "256GB", "512GB"],
    },
    "Realme GT 3": {
      ram: ["8GB", "16GB"],
      storage: ["128GB", "256GB", "1TB"],
    },
    
    // 2024
    "Realme 12 Pro": {
      ram: ["8GB", "12GB"],
      storage: ["128GB", "256GB", "512GB"],
    },
    "Realme GT 5 Pro": {
      ram: ["12GB", "16GB"],
      storage: ["256GB", "512GB", "1TB"],
    },
  },

  Motorola: {
    // 2020
    "Moto G Power (2020)": {
      ram: ["3GB", "4GB"],
      storage: ["32GB", "64GB"],
    },
    "Motorola Edge": {
      ram: ["6GB"],
      storage: ["128GB"],
    },
    
    // 2021
    "Moto G Power (2021)": {
      ram: ["3GB", "4GB"],
      storage: ["32GB", "64GB"],
    },
    "Motorola Edge 20": {
      ram: ["8GB"],
      storage: ["128GB", "256GB"],
    },
    
    // 2022
    "Moto G Power (2022)": {
      ram: ["4GB"],
      storage: ["64GB"],
    },
    "Motorola Edge 30": {
      ram: ["6GB", "8GB"],
      storage: ["128GB", "256GB"],
    },
    
    // 2023
    "Moto G Power 5G": {
      ram: ["6GB"],
      storage: ["128GB", "256GB"],
    },
    "Motorola Edge 40": {
      ram: ["8GB"],
      storage: ["128GB", "256GB"],
    },
    
    // 2024
    "Moto G Power 5G (2024)": {
      ram: ["8GB"],
      storage: ["128GB"],
    },
    "Motorola Edge 50 Pro": {
      ram: ["12GB"],
      storage: ["256GB", "512GB"],
    },
  },

  Nokia: {
    // 2020
    "Nokia 8.3": {
      ram: ["6GB", "8GB"],
      storage: ["64GB", "128GB"],
    },
    
    // 2021
    "Nokia X20": {
      ram: ["6GB", "8GB"],
      storage: ["128GB"],
    },
    
    // 2022
    "Nokia X30": {
      ram: ["6GB", "8GB"],
      storage: ["128GB", "256GB"],
    },
    "Nokia G60": {
      ram: ["4GB", "6GB"],
      storage: ["64GB", "128GB"],
    },
    
    // 2023
    "Nokia G42": {
      ram: ["4GB", "6GB"],
      storage: ["128GB"],
    },
    "Nokia XR21": {
      ram: ["6GB"],
      storage: ["128GB"],
    },
    
    // 2024
    "Nokia XR30": {
      ram: ["6GB", "8GB"],
      storage: ["128GB", "256GB"],
    },
  },

  Sony: {
    // 2020
    "Xperia 1 II": {
      ram: ["8GB"],
      storage: ["256GB"],
    },
    
    // 2021
    "Xperia 1 III": {
      ram: ["12GB"],
      storage: ["256GB", "512GB"],
    },
    
    // 2022
    "Xperia 1 IV": {
      ram: ["12GB"],
      storage: ["256GB", "512GB"],
    },
    
    // 2023
    "Xperia 1 V": {
      ram: ["12GB"],
      storage: ["256GB", "512GB"],
    },
    "Xperia 10 V": {
      ram: ["6GB"],
      storage: ["128GB"],
    },
    
    // 2024
    "Xperia 1 VI": {
      ram: ["12GB"],
      storage: ["256GB", "512GB", "1TB"],
    },
  },

  Asus: {
    // 2020
    "ROG Phone 3": {
      ram: ["12GB", "16GB"],
      storage: ["256GB", "512GB"],
    },
    "Zenfone 7": {
      ram: ["6GB", "8GB"],
      storage: ["128GB"],
    },
    
    // 2021
    "ROG Phone 5": {
      ram: ["8GB", "12GB", "16GB"],
      storage: ["128GB", "256GB", "512GB"],
    },
    "Zenfone 8": {
      ram: ["6GB", "8GB", "16GB"],
      storage: ["128GB", "256GB"],
    },
    
    // 2022
    "ROG Phone 6": {
      ram: ["12GB", "16GB"],
      storage: ["256GB", "512GB"],
    },
    "Zenfone 9": {
      ram: ["8GB", "16GB"],
      storage: ["128GB", "256GB"],
    },
    
    // 2023
    "ROG Phone 7": {
      ram: ["12GB", "16GB"],
      storage: ["256GB", "512GB"],
    },
    "Zenfone 10": {
      ram: ["8GB", "16GB"],
      storage: ["128GB", "256GB", "512GB"],
    },
    
    // 2024
    "ROG Phone 8": {
      ram: ["12GB", "16GB"],
      storage: ["256GB", "512GB", "1TB"],
    },
  },

  Huawei: {
    // 2020
    "Huawei P40 Pro": {
      ram: ["8GB"],
      storage: ["128GB", "256GB", "512GB"],
    },
    
    // 2021
    "Huawei P50 Pro": {
      ram: ["8GB", "12GB"],
      storage: ["128GB", "256GB", "512GB"],
    },
    
    // 2022
    "Huawei Mate 50": {
      ram: ["8GB"],
      storage: ["128GB", "256GB", "512GB"],
    },
    
    // 2023
    "Huawei P60 Pro": {
      ram: ["8GB", "12GB"],
      storage: ["256GB", "512GB"],
    },
    
    // 2024
    "Huawei Pura 70 Ultra": {
      ram: ["12GB", "16GB"],
      storage: ["256GB", "512GB", "1TB"],
    },
  },

  Nothing: {
    // 2022
    "Phone (1)": {
      ram: ["8GB", "12GB"],
      storage: ["128GB", "256GB"],
    },
    
    // 2023
    "Phone (2)": {
      ram: ["8GB", "12GB"],
      storage: ["128GB", "256GB", "512GB"],
    },
    
    // 2024
    "Phone (2a)": {
      ram: ["8GB", "12GB"],
      storage: ["128GB", "256GB"],
    },
  },

  LG: {
    // 2020
    "LG Velvet": {
      ram: ["6GB"],
      storage: ["128GB"],
    },
    "LG Wing": {
      ram: ["8GB"],
      storage: ["128GB", "256GB"],
    },
    
    // 2021 (LG ने मोबाइल बिज़नेस छोड़ दिया, लेकिन 2021 में कुछ मॉडल आए थे)
    "LG G8X": {
      ram: ["6GB"],
      storage: ["128GB"],
    },
  },

  // Additional Brands
  Tecno: {
    // 2022
    "Tecno Camon 19 Pro": {
      ram: ["8GB"],
      storage: ["128GB", "256GB"],
    },
    
    // 2023
    "Tecno Phantom V Fold": {
      ram: ["12GB"],
      storage: ["256GB", "512GB"],
    },
    
    // 2024
    "Tecno Phantom V Flip": {
      ram: ["8GB", "12GB"],
      storage: ["256GB"],
    },
  },

  Infinix: {
    // 2022
    "Infinix Zero 5G": {
      ram: ["8GB"],
      storage: ["128GB"],
    },
    
    // 2023
    "Infinix Note 30 Pro": {
      ram: ["8GB", "12GB"],
      storage: ["128GB", "256GB"],
    },
    
    // 2024
    "Infinix GT 20 Pro": {
      ram: ["12GB"],
      storage: ["256GB"],
    },
  },

  Poco: {
    // 2020
    "Poco X3 NFC": {
      ram: ["6GB"],
      storage: ["64GB", "128GB"],
    },
    
    // 2021
    "Poco F3": {
      ram: ["6GB", "8GB"],
      storage: ["128GB", "256GB"],
    },
    
    // 2022
    "Poco X4 Pro": {
      ram: ["6GB", "8GB"],
      storage: ["128GB", "256GB"],
    },
    
    // 2023
    "Poco F5": {
      ram: ["8GB", "12GB"],
      storage: ["128GB", "256GB", "512GB"],
    },
    "Poco X6": {
      ram: ["8GB", "12GB"],
      storage: ["128GB", "256GB", "512GB"],
    },
    
    // 2024
    "Poco F6": {
      ram: ["8GB", "12GB"],
      storage: ["128GB", "256GB", "512GB"],
    },
  },

  Honor: {
    // 2021
    "Honor 50": {
      ram: ["6GB", "8GB", "12GB"],
      storage: ["128GB", "256GB"],
    },
    
    // 2022
    "Honor 70": {
      ram: ["8GB", "12GB"],
      storage: ["128GB", "256GB", "512GB"],
    },
    
    // 2023
    "Honor 90": {
      ram: ["8GB", "12GB", "16GB"],
      storage: ["128GB", "256GB", "512GB"],
    },
    
    // 2024
    "Honor Magic 6 Pro": {
      ram: ["12GB", "16GB"],
      storage: ["256GB", "512GB", "1TB"],
    },
  },
};