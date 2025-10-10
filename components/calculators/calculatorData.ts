// FIX: Populated this file with pricing data to resolve import errors.
export const cloudServerPricing = {
  amdGen4: {
    tiers: ['premium', 'enterprise', 'dedicated'],
    subscription: {
      cpu: { premium: 140000, enterprise: 190000, dedicated: 560000 },
      ram: { premium: 85000, enterprise: 85000, dedicated: 85000 },
    },
    onDemand: {
      on: {
        cpu: { premium: 292, enterprise: 396, dedicated: 1167 },
        ram: { premium: 177, enterprise: 177, dedicated: 177 },
      },
      off: {
        cpu: { premium: 58, enterprise: 79, dedicated: 233 },
        ram: { premium: 35, enterprise: 35, dedicated: 35 },
      },
    },
    disk: {
      subscription: {
        hdd: { under100GB: 2000, over100GB: 1000 },
        ssd: { under100GB: 7000, over100GB: 4600 },
        nvme: { under100GB: 10500, over100GB: 6900 },
      },
      onDemand: {
        hdd: { under100GB: 3.6, over100GB: 1.8 },
        ssd: { under100GB: 12.6, over100GB: 8.3 },
        nvme: { under100GB: 19.0, over100GB: 12.5 },
      },
    }
  },
  intelGen2: {
    tiers: ['basic', 'premium', 'enterprise', 'dedicated'],
    subscription: {
      basic: {
        cpu: [ { cores: 1, price: 35000 }, { cores: 2, price: 71000 }, { cores: 3, price: 125000 }, { cores: 4, price: 222000 }, { cores: 6, price: 590000 }, { cores: 8, price: 850000 }, { cores: 12, price: 1600000 } ],
        ram: [ { gb: 1, price: 60000 }, { gb: 2, price: 80000 }, { gb: 3, price: 111000 }, { gb: 4, price: 246000 }, { gb: 6, price: 357000 }, { gb: 8, price: 459000 }, { gb: 12, price: 679000 }, { gb: 16, price: 949000 }, { gb: 24, price: 1600000 } ],
        disk: {
          hdd: { under100GB: 1091, over100GB: 818 },
          ssd: { price: 3482 },
        }
      },
      premium: {
        cpu: [ { cores: 1, price: 70102 }, { cores: 2, price: 233673 }, { cores: 3, price: 373876 }, { cores: 4, price: 560815 }, { cores: 5, price: 701018 }, { cores: 6, price: 841222 }, { cores: 8, price: 1215098 }, { cores: 10, price: 1729178 }, { cores: 12, price: 2243258 }, { cores: 16, price: 2991011 }, { cores: 18, price: 3364887 }, { cores: 24, price: 4486516 }, { cores: 32, price: 5982022 } ],
        ram: [ { gb: 1, price: 117818 }, { gb: 2, price: 196364 }, { gb: 3, price: 274909 }, { gb: 4, price: 353455 }, { gb: 5, price: 432000 }, { gb: 6, price: 510545 }, { gb: 8, price: 667636 }, { gb: 10, price: 824727 }, { gb: 12, price: 981818 }, { gb: 16, price: 1296000 }, { gb: 20, price: 1610182 }, { gb: 24, price: 1924364 }, { gb: 32, price: 2552727 }, { gb: 48, price: 3809455 }, { gb: 64, price: 5529600 }, { gb: 96, price: 7579636 }, { gb: 128, price: 10093091 } ],
      },
      enterprise: {
        cpu: [ { cores: 1, price: 112163 }, { cores: 2, price: 373876 }, { cores: 3, price: 598202 }, { cores: 4, price: 897304 }, { cores: 5, price: 1121629 }, { cores: 6, price: 1345955 }, { cores: 8, price: 1944157 }, { cores: 10, price: 2766685 }, { cores: 12, price: 3589213 }, { cores: 16, price: 4785617 }, { cores: 18, price: 5383820 }, { cores: 24, price: 7178425 }, { cores: 32, price: 9571235 }, { cores: 40, price: 13160448 }, { cores: 48, price: 15792538 }, { cores: 56, price: 18424627 }, { cores: 64, price: 21056717 }, { cores: 96, price: 31585075 } ],
        ram: [ { gb: 1, price: 188509 }, { gb: 2, price: 314182 }, { gb: 3, price: 439855 }, { gb: 4, price: 565527 }, { gb: 5, price: 691200 }, { gb: 6, price: 816873 }, { gb: 8, price: 1068218 }, { gb: 10, price: 1319564 }, { gb: 12, price: 1570909 }, { gb: 16, price: 2073600 }, { gb: 20, price: 2576291 }, { gb: 24, price: 3078982 }, { gb: 32, price: 4084364 }, { gb: 48, price: 6095127 }, { gb: 64, price: 8847360 }, { gb: 96, price: 12127418 }, { gb: 128, price: 16148945 }, { gb: 192, price: 26611200 }, { gb: 256, price: 35458560 }, { gb: 512, price: 70848000 } ],
      },
      dedicated: {
        cpu: [ { cores: 1, price: 325000 }, { cores: 2, price: 650000 }, { cores: 3, price: 975000 }, { cores: 4, price: 1300000 }, { cores: 5, price: 1625000 }, { cores: 6, price: 1950000 }, { cores: 8, price: 2600000 }, { cores: 10, price: 3250000 }, { cores: 12, price: 3900000 }, { cores: 16, price: 5200000 }, { cores: 18, price: 5850000 }, { cores: 24, price: 7800000 }, { cores: 32, price: 10400000 } ],
        ram: [ { gb: 1, price: 140000 }, { gb: 2, price: 263529 }, { gb: 3, price: 420000 }, { gb: 4, price: 510588 }, { gb: 5, price: 669118 }, { gb: 6, price: 840000 }, { gb: 8, price: 1120000 }, { gb: 10, price: 1400000 }, { gb: 12, price: 1680000 }, { gb: 16, price: 2240000 }, { gb: 20, price: 2800000 }, { gb: 24, price: 3360000 }, { gb: 32, price: 4480000 }, { gb: 48, price: 6720000 }, { gb: 64, price: 8960000 }, { gb: 96, price: 13440000 }, { gb: 128, price: 17920000 }, { gb: 192, price: 26880000 }, { gb: 256, price: 36480000 }, { gb: 512, price: 71680000 } ],
      },
      disk: {
        hdd: { under100GB: 2000, over100GB: 1000 },
        ssd: { under100GB: 7000, over100GB: 4600 },
        nvme: { under100GB: 10500, over100GB: 6900 },
      }
    },
    onDemand: {
      basic: {
        cpu: [ { cores: 1, on: 75, off: 15 }, { cores: 2, on: 150, off: 30 }, { cores: 3, on: 263, off: 53 }, { cores: 4, on: 465, off: 93 }, { cores: 6, on: 1230, off: 246 }, { cores: 8, on: 1785, off: 357 }, { cores: 12, on: 3330, off: 666 } ],
        ram: [ { gb: 1, on: 128, off: 26 }, { gb: 2, on: 165, off: 33 }, { gb: 3, on: 233, off: 47 }, { gb: 4, on: 518, off: 104 }, { gb: 6, on: 750, off: 150 }, { gb: 8, on: 960, off: 192 }, { gb: 12, on: 1410, off: 282 }, { gb: 16, on: 1980, off: 396 }, { gb: 24, on: 3300, off: 660 } ],
        disk: {
          hdd: { price: 2.0 },
          ssd: { price: 6.2 },
        }
      },
      premium: {
        cpu: [ { cores: 1, on: 150, off: 30 }, { cores: 2, on: 488, off: 98 }, { cores: 3, on: 780, off: 156 }, { cores: 4, on: 1170, off: 234 }, { cores: 6, on: 1755, off: 351 }, { cores: 8, on: 2535, off: 507 }, { cores: 10, on: 3600, off: 720 }, { cores: 12, on: 4680, off: 936 }, { cores: 16, on: 6225, off: 1245 }, { cores: 18, on: 7020, off: 1404 }, { cores: 24, on: 9360, off: 1872 }, { cores: 32, on: 12465, off: 2493 } ],
        ram: [ { gb: 1, on: 248, off: 50 }, { gb: 2, on: 405, off: 81 }, { gb: 3, on: 570, off: 114 }, { gb: 4, on: 735, off: 147 }, { gb: 6, on: 1065, off: 213 }, { gb: 8, on: 1395, off: 279 }, { gb: 10, on: 1725, off: 345 }, { gb: 12, on: 2040, off: 408 }, { gb: 16, on: 2700, off: 540 }, { gb: 20, on: 3360, off: 672 }, { gb: 24, on: 4020, off: 804 }, { gb: 32, on: 5325, off: 1065 }, { gb: 48, on: 7935, off: 1587 }, { gb: 64, on: 11520, off: 2304 }, { gb: 96, on: 15795, off: 3159 }, { gb: 128, on: 21150, off: 4230 } ],
      },
      enterprise: {
        cpu: [ { cores: 1, on: 233, off: 47 }, { cores: 2, on: 780, off: 156 }, { cores: 3, on: 1245, off: 249 }, { cores: 4, on: 1868, off: 374 }, { cores: 6, on: 2805, off: 561 }, { cores: 8, on: 4050, off: 810 }, { cores: 10, on: 5760, off: 1152 }, { cores: 12, on: 7485, off: 1497 }, { cores: 16, on: 9975, off: 1995 }, { cores: 18, on: 11220, off: 2244 }, { cores: 24, on: 14955, off: 2991 }, { cores: 32, on: 19935, off: 3987 }, { cores: 40, on: 27420, off: 5484 }, { cores: 48, on: 32910, off: 6582 }, { cores: 56, on: 38385, off: 7677 }, { cores: 64, on: 43868, off: 8774 }, { cores: 96, on: 65805, off: 13161 } ],
        ram: [ { gb: 1, on: 398, off: 80 }, { gb: 2, on: 660, off: 132 }, { gb: 3, on: 930, off: 186 }, { gb: 4, on: 1185, off: 237 }, { gb: 6, on: 1703, off: 341 }, { gb: 8, on: 2228, off: 446 }, { gb: 10, on: 2753, off: 551 }, { gb: 12, on: 3270, off: 654 }, { gb: 16, on: 4320, off: 864 }, { gb: 20, on: 5370, off: 1074 }, { gb: 24, on: 6420, off: 1284 }, { gb: 32, on: 8520, off: 1704 }, { gb: 48, on: 12698, off: 2540 }, { gb: 64, on: 18435, off: 3687 }, { gb: 96, on: 25268, off: 5054 }, { gb: 128, on: 33645, off: 6729 }, { gb: 192, on: 55440, off: 11088 }, { gb: 256, on: 73875, off: 14775 }, { gb: 512, on: 147600, off: 29520 } ],
      },
      dedicated: {
        cpu: [ { cores: 1, on: 675, off: 135 }, { cores: 2, on: 1350, off: 270 }, { cores: 3, on: 2033, off: 407 }, { cores: 4, on: 2715, off: 543 }, { cores: 6, on: 4065, off: 813 }, { cores: 8, on: 5415, off: 1083 }, { cores: 10, on: 6780, off: 1356 }, { cores: 12, on: 8130, off: 1626 }, { cores: 16, on: 10830, off: 2166 }, { cores: 18, on: 12195, off: 2439 }, { cores: 24, on: 16260, off: 3252 }, { cores: 32, on: 21668, off: 4334 }, { cores: 40, on: 27083, off: 5417 }, { cores: 48, on: 32505, off: 6501 }, { cores: 56, on: 37920, off: 7584 }, { cores: 64, on: 43335, off: 8667 }, { cores: 96, on: 65010, off: 13002 } ],
        ram: [ { gb: 1, on: 293, off: 59 }, { gb: 2, on: 548, off: 110 }, { gb: 3, on: 878, off: 176 }, { gb: 4, on: 1065, off: 213 }, { gb: 6, on: 1755, off: 351 }, { gb: 8, on: 2340, off: 468 }, { gb: 10, on: 2918, off: 584 }, { gb: 12, on: 3503, off: 701 }, { gb: 16, on: 4665, off: 933 }, { gb: 20, on: 5835, off: 1167 }, { gb: 24, on: 7005, off: 1401 }, { gb: 32, on: 9338, off: 1868 }, { gb: 48, on: 14003, off: 2801 }, { gb: 64, on: 18668, off: 3734 }, { gb: 96, on: 28005, off: 5601 }, { gb: 128, on: 37335, off: 7467 }, { gb: 192, on: 56003, off: 11201 }, { gb: 256, on: 74670, off: 14934 }, { gb: 512, on: 149333, off: 29867 } ],
      },
      disk: {
        hdd: { under100GB: 3.6, over100GB: 1.8 },
        ssd: { under100GB: 12.6, over100GB: 8.3 },
        nvme: { under100GB: 19.0, over100GB: 12.5 },
      }
    }
  }
};

export const wanIpPricing = {
  subscription: 100000,
  onDemand: 100000,
};

export const snapshotPricing = {
  pricePerGB: 1500,
};

export const backupSchedulePricing = {
  price: 50000,
};

export const customImagePricing = {
  pricePerGB: 1000,
};

export const databasePricing = {
  hoursPerMonth: 730,
  cpu: {
    premium: [{ cores: 2, price: 340 }, { cores: 4, price: 680 }, { cores: 8, price: 1360 }],
    enterprise: [{ cores: 4, price: 1020 }, { cores: 8, price: 2040 }, { cores: 16, price: 4080 }],
    dedicated: [{ cores: 8, price: 2720 }, { cores: 16, price: 5440 }, { cores: 32, price: 10880 }],
  },
  ram: {
    premium: [{ gb: 4, price: 170 }, { gb: 8, price: 340 }, { gb: 16, price: 680 }],
    enterprise: [{ gb: 16, price: 680 }, { gb: 32, price: 1360 }, { gb: 64, price: 2720 }],
    dedicated: [{ gb: 32, price: 1820 }, { gb: 64, price: 3640 }, { gb: 128, price: 7280 }],
  },
  disk: {
    pricePerGBHourFirst100GB: 1.5,
    pricePerGBHourAfter100GB: 1.2,
  },
  backup: {
    pricePerGBHour: 0.8,
  },
};

export const simpleStoragePricing = {
  subscription: {
    standard: [
      { gb: 500, price: 350000 },
      { gb: 1024, price: 650000 },
      { gb: 5120, price: 3000000 },
    ],
    cold: [
      { gb: 1024, price: 300000 },
      { gb: 5120, price: 1400000 },
      { gb: 10240, price: 2500000 },
    ],
  },
  payAsYouGo: {
    standard: { pricePerGBHour: 1.0 },
    cold: { pricePerGBHour: 0.5 },
  },
  dataTransferPricePerGB: 2000,
};

export const loadBalancerPricing = {
  packages: [
    { name: 'Small', connections: 1500, freeDataTB: 5, price: 500000 },
    { name: 'Medium', connections: 4000, freeDataTB: 5, price: 1760000 },
    { name: 'Large', connections: 8000, freeDataTB: 5, price: 3550000 },
  ],
  dataTransferOveragePricePerGB: 280,
};

export const kubernetesPricing = {
  standard: [
    { name: 'Standard-0', price: 0 },
    { name: 'Standard-1', price: 1260000 },
  ],
  everywhere: [
    { name: 'Everywhere-1', maxNodes: 20, ram: 8, price: 1700000 },
    { name: 'Everywhere-2', maxNodes: 50, ram: 16, price: 3000000 },
    { name: 'Everywhere-3', maxNodes: 150, ram: 24, price: 5000000 },
  ],
};

export const kafkaPricing = {
  cpu: {
    premium: 180000,
    enterprise: 250000,
    dedicated: 490000,
  },
  ram: {
    premium: 150000,
    enterprise: 200000,
    dedicated: 260000,
  },
  disk: {
    price: 4600,
  },
  wanIP: {
    price: 100000,
  }
};

export const callCenterPricing = {
  packages: [
    { name: 'V10', details: '10 extensions, 5GB storage, 2 numbers', price: 300000 },
    { name: 'V20', details: '20 extensions, 10GB storage, 3 numbers', price: 500000 },
    { name: 'V30', details: '30 extensions, 15GB storage, 4 numbers', price: 750000 },
    { name: 'V50', details: '50 extensions, 25GB storage, 5 numbers', price: 1200000 },
    { name: 'V100', details: '100 extensions, 50GB storage, 7 numbers', price: 2200000 },
  ],
};

export const businessEmailPricing = {
  packages: [
    { id: 1, storageGB: 10, emailsPerDay: 2000, price: 100000 },
    { id: 2, storageGB: 30, emailsPerDay: 2000, price: 190000 },
    { id: 3, storageGB: 50, emailsPerDay: 2000, price: 320000 },
    { id: 4, storageGB: 150, emailsPerDay: 5000, price: 460000 },
    { id: 5, storageGB: 300, emailsPerDay: 10000, price: 730000 },
    { id: 6, storageGB: 500, emailsPerDay: 10000, price: 910000 },
    { id: 7, storageGB: 1000, emailsPerDay: 10000, price: 1640000 },
    { id: 8, storageGB: 2000, emailsPerDay: 10000, price: 3280000 },
    { id: 9, storageGB: 3000, emailsPerDay: 10000, price: 5100000 },
    { id: 10, storageGB: 4000, emailsPerDay: 10000, price: 7100000 },
    { id: 11, storageGB: 5000, emailsPerDay: 10000, price: 10730000 },
    { id: 12, storageGB: 6000, emailsPerDay: 10000, price: 15280000 },
    { id: 13, storageGB: 7000, emailsPerDay: 10000, price: 19820000 },
    { id: 14, storageGB: 8000, emailsPerDay: 10000, price: 24370000 },
    { id: 15, storageGB: 9000, emailsPerDay: 10000, price: 28900000 },
    { id: 16, storageGB: 10000, emailsPerDay: 10000, price: 33450000 },
  ]
};

export const emailPricing = {
  shared: {
    pricePerEmail: 3.5,
  },
  dedicated: [
    { name: 'ET20', emailsPerDay: 20000, price: 900000 },
    { name: 'ET40', emailsPerDay: 40000, price: 1800000 },
    { name: 'ET60', emailsPerDay: 60000, price: 2640000 },
    { name: 'ET80', emailsPerDay: 80000, price: 3600000 },
    { name: 'ET100', emailsPerDay: 100000, price: 4500000 },
  ],
};

export const lmsPricing = {
    packages: [
        { name: 'Pack 10 CCU', ccu: 10, freeStorageGB: 5, price: 1380000 },
        { name: 'Pack 30 CCU', ccu: 30, freeStorageGB: 15, price: 3280000 },
        { name: 'Pack 50 CCU', ccu: 50, freeStorageGB: 20, price: 4850000 },
        { name: 'Pack 100 CCU', ccu: 100, freeStorageGB: 50, price: 7750000 },
        { name: 'Pack 200 CCU', ccu: 200, freeStorageGB: 100, price: 11500000 },
        { name: 'Pack 300 CCU', ccu: 300, freeStorageGB: 150, price: 15300000 },
        { name: 'Pack 400 CCU', ccu: 400, freeStorageGB: 200, price: 19000000 },
        { name: 'Pack 500 CCU', ccu: 500, freeStorageGB: 250, price: 22850000 },
        { name: 'Pack 600 CCU', ccu: 600, freeStorageGB: 300, price: 26550000 },
        { name: 'Pack 700 CCU', ccu: 700, freeStorageGB: 350, price: 30300000 },
        { name: 'Pack 800 CCU', ccu: 800, freeStorageGB: 400, price: 34100000 },
        { name: 'Pack 900 CCU', ccu: 900, freeStorageGB: 450, price: 37850000 },
        { name: 'Pack 1000 CCU', ccu: 1000, freeStorageGB: 500, price: 41650000 },
    ],
    additionalStorage: {
        blockSizeGB: 100,
        pricePerBlock: 800000,
    }
};