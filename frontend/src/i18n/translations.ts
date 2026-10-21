import type { Language, ProductCategory, UnitType } from '../types';

export const translations = {
  en: {
    appName: 'Kirana Smart Stock',
    shopName: 'Shri Ram Kirana Store',
    tagline: 'Simple Stock & Reorder for Neighbourhood Stores',
    demoNotice: 'DEMO MODE: Using temporary sample data for Milestone 2. Changes update in-memory.',
    resetDemoData: 'Reset Sample Data',
    
    // Tabs
    tabDashboard: 'Dashboard',
    tabQuickSale: 'Quick Sale',
    tabStock: 'Stock',
    tabReorders: 'Reorders',
    tabSettings: 'Settings',

    // Status & Connectivity
    online: 'Online',
    offline: 'Offline Mode',
    synced: 'All Synced',
    pendingSync: 'Pending Sync',
    simulatedOfflineHelp: 'Toggle offline simulation to test working without internet.',

    // Dashboard Cards & Actions
    addStockBtn: '+ Add Stock',
    recordSaleBtn: 'Record Sale',
    newProductBtn: '+ New Product',
    quickStats: 'Store Overview',
    totalProducts: 'Total Items',
    lowStockAlerts: 'Low Stock Alerts',
    outOfStock: 'Out of Stock',
    urgentReorders: 'Urgent Reorders',
    slowMovingItems: 'Slow-Moving Items',
    slowMovingDesc: 'Products with no sales in past 15+ days. Avoid over-ordering.',
    recentActivity: 'Recent Stock Activity',
    viewAll: 'View All',
    noActivity: 'No stock activity recorded yet.',
    noSalesInDays: 'No sales recorded in the last {days} days',

    // Quick Sale
    quickSaleTitle: 'Record a Quick Sale',
    quickSaleSubtitle: 'Tap an item and enter quantity to deduct stock immediately',
    searchProductPlaceholder: 'Search product by English or Hindi...',
    popularItems: 'Fast Moving Products',
    allProducts: 'All Products',
    quantityToSell: 'Quantity to Sell',
    availableStock: 'Available Stock',
    unitPrice: 'Selling Price',
    totalPrice: 'Total Amount',
    saleRecordedSuccess: 'Sale recorded! Stock updated immediately.',
    insufficientStock: 'Cannot sell more than available stock ({stock} {unit})',
    invalidQuantity: 'Please enter a valid positive quantity',
    completeSale: 'Confirm Sale',

    // Stock Management
    stockTitle: 'Inventory & Stock List',
    filterAll: 'All Items',
    filterLowStock: 'Low Stock Only',
    filterOutOfStock: 'Out of Stock',
    searchPlaceholder: 'Search items...',
    currentQty: 'In Stock',
    threshold: 'Min Threshold',
    addMoreStock: 'Add Stock',
    stockCorrection: 'Correction',
    history: 'History',
    statusOk: 'In Stock',
    statusLow: 'Low Stock',
    statusOut: 'Out of Stock',
    costPrice: 'Purchase Cost',
    sellingPriceLabel: 'Sale Price',
    noProductsFound: 'No products match your search or filter.',

    // Add Stock Modal
    addStockTitle: 'Add Newly Purchased Stock',
    addStockPrompt: 'Enter the quantity received from distributor',
    addedStockSuccess: 'Successfully added {qty} {unit} to {product}!',
    distributorBillOptional: 'Supplier / Bill Note (Optional)',

    // Stock Correction Modal
    correctionTitle: 'Stock Correction / Adjustment',
    correctionPrompt: 'Record physical count discrepancy, damage or return',
    newTotalQuantity: 'New Actual Physical Stock',
    correctionReason: 'Reason for Correction',
    reasonDamaged: 'Damaged / Spoilage (खराब हो गया)',
    reasonDiscrepancy: 'Physical Count Mismatch (गिनती में अंतर)',
    reasonExpired: 'Expired (अवधि समाप्त)',
    reasonCustomerReturn: 'Customer Return (ग्राहक ने लौटाया)',
    reasonOther: 'Other adjustment (अन्य कारण)',
    correctionSuccess: 'Stock corrected to {qty} {unit}.',

    // Add Product Modal
    createProductTitle: 'Add New Product',
    productNameEn: 'Product Name (English)',
    productNameHi: 'Product Name (Hindi)',
    selectCategory: 'Category',
    selectUnit: 'Unit of Measure',
    initialStock: 'Initial Quantity in Stock',
    minStockLevel: 'Minimum Stock Alert Level',
    productAddedSuccess: 'Product added successfully to inventory!',
    nameRequired: 'Product name in English or Hindi is required',

    // Reorders
    reordersTitle: 'Smart Reorder Suggestions',
    reordersSubtitle: 'Actionable estimates based on stock thresholds and sales velocity',
    recommendationBadge: 'Estimated Recommendation',
    reorderNow: 'Suggested Reorder Qty',
    whyThisItem: 'Why order this?',
    reorderReasonLowStock: 'Stock ({stock} {unit}) is at or below minimum threshold ({threshold} {unit}).',
    reorderReasonVelocity: 'Sold {sold} {unit} in the last 7 days. At current rate, stock will run out in ~{days} days.',
    copyReorderList: 'Copy Order List (for WhatsApp / Distributor)',
    listCopied: 'Order list copied to clipboard!',
    noReordersNeeded: 'All stock levels are healthy! No items need reordering right now.',
    urgentTag: 'Urgent',
    moderateTag: 'Upcoming',

    // Units
    unit_piece: 'pcs',
    unit_packet: 'pkt',
    unit_bottle: 'btl',
    unit_box: 'box',
    unit_kg: 'kg',
    unit_g: 'g',
    unit_l: 'L',
    unit_ml: 'ml',

    // Categories
    cat_grocery: 'Grocery & Staples',
    cat_snacks: 'Snacks & Biscuits',
    cat_dairy: 'Dairy & Bakery',
    cat_beverages: 'Tea & Beverages',
    cat_personal_care: 'Personal Care',
    cat_household: 'Household & Cleaning',

    // Movements
    mov_purchase: 'Stock Added',
    mov_sale: 'Sale Recorded',
    mov_adjustment: 'Stock Correction',
    mov_return: 'Return',

    // Common Actions
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    confirm: 'Confirm',
    edit: 'Edit',
    delete: 'Delete',
    loading: 'Loading...',

    // Settings
    settingsTitle: 'Settings & Shop Profile',
    languageSetting: 'App Language / ऐप की भाषा',
    english: 'English',
    hindi: 'हिंदी (Hindi)',
    networkStatus: 'Network & Synchronization Status',
    simulateOffline: 'Simulate Offline Mode',
    simulateOfflineDesc: 'Test how the app works seamlessly without an internet connection.',
    storagePersistence: 'Local Data Storage Persistence',
    storageActive: 'Active & Protected',
    aboutApp: 'About Kirana Smart Stock',
    appVersion: 'Version 1.0 (Milestone 2 Frontend Prototype)',
    devInfo: 'Built for Indian Kirana & Small Retail Stores'
  },
  hi: {
    appName: 'किराना स्मार्ट स्टॉक',
    shopName: 'श्री राम किराना स्टोर',
    tagline: 'पड़ोस की दुकानों के लिए आसान स्टॉक व ऑर्डर प्रबंधन',
    demoNotice: 'डेमो मोड: माइलस्टोन 2 के लिए अस्थायी नमूना डेटा का उपयोग। बदलाव तुरंत स्क्रीन पर दिखेंगे।',
    resetDemoData: 'नमूना डेटा रीसेट करें',

    // Tabs
    tabDashboard: 'डैशबोर्ड',
    tabQuickSale: 'त्वरित बिक्री',
    tabStock: 'स्टॉक सूची',
    tabReorders: 'ऑर्डर सुझाव',
    tabSettings: 'सेटिंग्स',

    // Status & Connectivity
    online: 'ऑनलाइन',
    offline: 'ऑफ़लाइन मोड',
    synced: 'सब सुरक्षित व सिंक',
    pendingSync: 'बाकी सिंक',
    simulatedOfflineHelp: 'बिना इंटरनेट के काम करने का परीक्षण करने के लिए ऑफ़लाइन मोड चालू करें।',

    // Dashboard Cards & Actions
    addStockBtn: '+ नया स्टॉक जोड़ें',
    recordSaleBtn: 'बिक्री दर्ज करें',
    newProductBtn: '+ नया सामान जोड़ें',
    quickStats: 'दुकान का विवरण',
    totalProducts: 'कुल सामान',
    lowStockAlerts: 'कम स्टॉक अलर्ट',
    outOfStock: 'स्टॉक खत्म',
    urgentReorders: 'तुरंत मंगाने योग्य',
    slowMovingItems: 'धीमी बिक्री वाला सामान',
    slowMovingDesc: 'पिछले 15+ दिनों से नहीं बिका सामान। अधिक ऑर्डर करने से बचें।',
    recentActivity: 'हालिया स्टॉक हलचल',
    viewAll: 'सभी देखें',
    noActivity: 'अभी तक कोई स्टॉक हलचल दर्ज नहीं हुई है।',
    noSalesInDays: 'पिछले {days} दिनों में कोई बिक्री नहीं हुई',

    // Quick Sale
    quickSaleTitle: 'तुरंत बिक्री दर्ज करें',
    quickSaleSubtitle: 'सामान चुनें और मात्रा डालकर तुरंत स्टॉक कम करें',
    searchProductPlaceholder: 'सामान का नाम हिंदी या अंग्रेज़ी में खोजें...',
    popularItems: 'रोज़ बिकने वाला सामान',
    allProducts: 'सभी सामान',
    quantityToSell: 'बिक्री की मात्रा',
    availableStock: 'दुकान में उपलब्ध स्टॉक',
    unitPrice: 'बिक्री मूल्य (रेट)',
    totalPrice: 'कुल राशि',
    saleRecordedSuccess: 'बिक्री दर्ज हो गई! स्टॉक तुरंत कम हो गया।',
    insufficientStock: 'उपलब्ध स्टॉक ({stock} {unit}) से अधिक नहीं बेच सकते',
    invalidQuantity: 'कृपया सही मात्रा दर्ज करें',
    completeSale: 'बिक्री पक्की करें',

    // Stock Management
    stockTitle: 'दुकान का पूरा स्टॉक',
    filterAll: 'सभी सामान',
    filterLowStock: 'केवल कम स्टॉक',
    filterOutOfStock: 'खत्म हुआ स्टॉक',
    searchPlaceholder: 'सामान खोजें...',
    currentQty: 'मौजूदा स्टॉक',
    threshold: 'न्यूनतम सीमा',
    addMoreStock: 'स्टॉक बढ़ाएं',
    stockCorrection: 'सुधारें',
    history: 'इतिहास',
    statusOk: 'पर्याप्त स्टॉक',
    statusLow: 'कम स्टॉक',
    statusOut: 'स्टॉक खत्म',
    costPrice: 'खरीद मूल्य',
    sellingPriceLabel: 'बिक्री मूल्य',
    noProductsFound: 'आपकी खोज के अनुसार कोई सामान नहीं मिला।',

    // Add Stock Modal
    addStockTitle: 'नया खरीदा गया स्टॉक जोड़ें',
    addStockPrompt: 'थोक व्यापारी/सप्लायर से आई मात्रा दर्ज करें',
    addedStockSuccess: '{product} में {qty} {unit} स्टॉक सफलतापूर्वक जुड़ गया!',
    distributorBillOptional: 'सप्लायर / बिल विवरण (वैकल्पिक)',

    // Stock Correction Modal
    correctionTitle: 'स्टॉक सुधार (फिजिकल गिनती)',
    correctionPrompt: 'दुकान में वास्तविक गिनती, टूट-फूट या वापसी दर्ज करें',
    newTotalQuantity: 'दुकान में वास्तविक कुल मात्रा',
    correctionReason: 'सुधार का कारण',
    reasonDamaged: 'खराब / टूट-फूट हो गया',
    reasonDiscrepancy: 'गिनती में अंतर',
    reasonExpired: 'एक्सपायर हो गया',
    reasonCustomerReturn: 'ग्राहक ने वापस किया',
    reasonOther: 'अन्य कारण',
    correctionSuccess: 'स्टॉक सुधरकर {qty} {unit} हो गया।',

    // Add Product Modal
    createProductTitle: 'नया सामान जोड़ें',
    productNameEn: 'सामान का नाम (अंग्रेज़ी)',
    productNameHi: 'सामान का नाम (हिंदी)',
    selectCategory: 'श्रेणी (Category)',
    selectUnit: 'मापने की इकाई (Unit)',
    initialStock: 'शुरुआती स्टॉक मात्रा',
    minStockLevel: 'कम से कम कितना स्टॉक रहना चाहिए?',
    productAddedSuccess: 'नया सामान दुकान की सूची में जुड़ गया!',
    nameRequired: 'सामान का नाम लिखना ज़रूरी है',

    // Reorders
    reordersTitle: 'स्मार्ट ऑर्डर सुझाव',
    reordersSubtitle: 'बिक्री की गति और न्यूनतम सीमा के आधार पर तैयार सुझाव',
    recommendationBadge: 'अनुमानित सुझाव',
    reorderNow: 'मंगाने की अनुशंसित मात्रा',
    whyThisItem: 'यह ऑर्डर क्यों मंगाएं?',
    reorderReasonLowStock: 'स्टॉक ({stock} {unit}) न्यूनतम सीमा ({threshold} {unit}) से कम है।',
    reorderReasonVelocity: 'पिछले 7 दिनों में {sold} {unit} बिका। इस गति से लगभग {days} दिन में स्टॉक खत्म हो जाएगा।',
    copyReorderList: 'ऑर्डर पर्ची कॉपी करें (WhatsApp / थोक व्यापारी के लिए)',
    listCopied: 'ऑर्डर सूची क्लिपबोर्ड पर कॉपी हो गई!',
    noReordersNeeded: 'दुकान में सभी सामान पर्याप्त मात्रा में है! अभी कुछ भी मंगाने की ज़रूरत नहीं है।',
    urgentTag: 'तुरंत मंगाएं',
    moderateTag: 'जल्द मंगाएं',

    // Units
    unit_piece: 'नग',
    unit_packet: 'पैकेट',
    unit_bottle: 'बोतल',
    unit_box: 'डिब्बा',
    unit_kg: 'किलो',
    unit_g: 'ग्राम',
    unit_l: 'लीटर',
    unit_ml: 'मिली',

    // Categories
    cat_grocery: 'किराना व अनाज',
    cat_snacks: 'नमकीन व बिस्कुट',
    cat_dairy: 'डेयरी व बेकरी',
    cat_beverages: 'चाय व पेय',
    cat_personal_care: 'साबुन व तेल',
    cat_household: 'सफाई व घरेलू',

    // Movements
    mov_purchase: 'स्टॉक जोड़ा गया',
    mov_sale: 'बिक्री दर्ज',
    mov_adjustment: 'स्टॉक सुधार',
    mov_return: 'वापसी',

    // Common Actions
    save: 'सहेजें',
    cancel: 'रद्द करें',
    close: 'बंद करें',
    confirm: 'पुष्टि करें',
    edit: 'बदलें',
    delete: 'हटाएं',
    loading: 'लोड हो रहा है...',

    // Settings
    settingsTitle: 'सेटिंग्स व दुकान विवरण',
    languageSetting: 'ऐप की भाषा (App Language)',
    english: 'English (अंग्रेज़ी)',
    hindi: 'हिंदी (Hindi)',
    networkStatus: 'नेटवर्क व डेटा स्थिति',
    simulateOffline: 'ऑफ़लाइन मोड का परीक्षण करें',
    simulateOfflineDesc: 'देखें कि बिना इंटरनेट के भी ऐप बिना रुकावट कैसे काम करता है।',
    storagePersistence: 'फ़ोन में डेटा सुरक्षा',
    storageActive: 'सुरक्षित व सक्रिय',
    aboutApp: 'किराना स्मार्ट स्टॉक के बारे में',
    appVersion: 'संस्करण 1.0 (माइलस्टोन 2 प्रोटोटाइप)',
    devInfo: 'भारतीय किराना व छोटे खुदरा दुकानदारों के लिए विशेष रूप से निर्मित'
  }
};

export function getTranslation(lang: Language, key: keyof typeof translations['en'], params?: Record<string, string | number>): string {
  let text = translations[lang][key] || translations['en'][key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }
  return text;
}

export function getCategoryLabel(lang: Language, cat: ProductCategory): string {
  const key = `cat_${cat}` as keyof typeof translations['en'];
  return getTranslation(lang, key);
}

export function getUnitLabel(lang: Language, unit: UnitType): string {
  const key = `unit_${unit}` as keyof typeof translations['en'];
  return getTranslation(lang, key);
}
