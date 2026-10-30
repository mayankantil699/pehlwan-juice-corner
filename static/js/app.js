
function toggleMobileAuthForm() {
    const el = document.getElementById('mobile-auth-collapsible');
    if (el) {
        el.classList.toggle('hidden');
    }
}

// Pehlwan Juice Corner - Supabase Live Cloud Database
const SUPABASE_CONFIG = {
    url: 'https://kkjdziyxhkjscrzvusbc.supabase.co',
    key: 'sb_publishable_9CGc_hkYSeXhGnjw6mRoUw_d5jb2p_-'
};

let supabaseClient = null;
try {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
        supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
    }
} catch (err) {
    console.warn('Supabase client init:', err);
}

// Direct REST API Fallback
async function supabaseRest(endpoint, method = 'GET', body = null) {
    const url = `${SUPABASE_CONFIG.url}/rest/v1/${endpoint}`;
    const headers = {
        'apikey': SUPABASE_CONFIG.key,
        'Content-Type': 'application/json'
    };
    if (method === 'POST') headers['Prefer'] = 'return=minimal';
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error(`Supabase REST status: ${res.status}`);
    if (method === 'GET') return await res.json();
    return true;
}

// Load Live Reviews from Supabase
async function loadFeedbackFromSupabase() {
    const grid = document.getElementById('pehlwan-feedback-grid');
    if (!grid) return;
    try {
        let rows = [];
        if (supabaseClient) {
            const { data, error } = await supabaseClient
                .from('feedback')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(16);
            if (!error && data && data.length > 0) rows = data;
        }
        if (!rows || rows.length === 0) {
            rows = await supabaseRest('feedback?select=*&order=created_at.desc&limit=16', 'GET');
        }

        if (rows && rows.length > 0) {
            grid.innerHTML = '';
            rows.forEach(fb => {
                const card = document.createElement('div');
                card.className = "pehlwan-feedback-card luxury-card rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-sm bg-white border border-neutral-200 hover:border-black transition-all";
                const rating = Math.max(1, Math.min(5, parseInt(fb.rating) || 5));
                const stars = '★'.repeat(rating);
                card.innerHTML = `
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <div class="text-black text-sm tracking-widest font-black">${stars}</div>
                            <span class="bg-neutral-100 border border-neutral-200 text-black text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                ${fb.role || 'Verified Customer'}
                            </span>
                        </div>
                        <p class="text-xs text-neutral-700 italic leading-relaxed">
                            "${fb.comment || ''}"
                        </p>
                    </div>
                    <div class="pt-4 border-t border-neutral-200 space-y-2">
                        <div class="inline-flex items-center gap-1.5 bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-xl text-[10px] text-black">
                            <span>❤️ Fav:</span>
                            <span class="font-bold">${fb.favorite || 'Pehlwan Special'}</span>
                        </div>
                        <div class="flex items-center justify-between text-xs">
                            <span class="font-heading font-black text-black">${fb.name || 'Customer'}</span>
                            <span class="text-[10px] text-neutral-500 font-semibold">${fb.created_at ? new Date(fb.created_at).toLocaleDateString('en-IN') : 'Recent'}</span>
                        </div>
                    </div>
                `;
                grid.appendChild(card);
            });
        }
    } catch (e) {
        // PostgREST table not yet created or offline
    }
}

// Log Order to Supabase
async function logOrderToSupabase(trayItems, totalPrice, totalCal, totalProt, custName = 'Walk-in Customer', custPhone = '', orderId = '#ORD-101', custAddress = '', custWeight = '', custHeight = '', paymentMethod = 'Online UPI', paymentStatus = 'Paid - UPI', paymentUtr = '') {
    const payload = {
        customer_phone: custPhone || 'Walk-in',
        items: {
            order_id: orderId,
            customer_name: custName || 'Regular Customer',
            customer_phone: custPhone,
            customer_address: custAddress,
            customer_weight: custWeight,
            customer_height: custHeight,
            payment_method: paymentMethod,
            payment_status: paymentStatus,
            payment_utr: paymentUtr,
            products: trayItems
        },
        total_price: totalPrice,
        total_calories: totalCal,
        total_protein: totalProt,
        status: 'Pending'
    };
    try {
        if (supabaseClient) {
            await supabaseClient.from('orders').insert([payload]);
        } else {
            await supabaseRest('orders', 'POST', payload);
        }
    } catch (err) {
        console.log('Order logging info:', err.message);
    }
}

// Pehlwan Juice Corner - Luxury Engine with 3-Way Glossy Language Switcher

// Lightweight Visitor Tracker for Admin Live Alert
async function trackVisitor() {
    try {
        let sessionId = sessionStorage.getItem('pehlwan_session_id');
        if (!sessionId) {
            sessionId = 'sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
            sessionStorage.setItem('pehlwan_session_id', sessionId);
        }

        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const deviceType = isMobile ? 'Mobile 📱' : 'Desktop 💻';
        let pageName = window.location.pathname.split('/').filter(Boolean).pop() || 'Home';
        if (pageName === 'pehlwan-juice-corner') pageName = 'Home';

        const payload = {
            session_id: sessionId,
            device: deviceType,
            page: pageName
        };

        if (supabaseClient) {
            await supabaseClient.from('visitors').insert([payload]);
        } else {
            await supabaseRest('visitors', 'POST', payload);
        }
    } catch (e) {
        // Table may not yet be created
    }
}

let pehlwanMenu = [];
let pehlwanCombos = [];
let pehlwanShop = { phone: '+91 95883 51884', whatsapp: '919588351884', upi_id: '9588351884@upi', upi_name: 'Pehlwan Juice Corner' };
let pehlwanTray = JSON.parse(localStorage.getItem('pehlwan_juice_tray')) || [];
const itemSelectedSize = {};

// Language State: 'en' | 'hinglish' | 'hi'
let currentLang = localStorage.getItem('pehlwan_lang') || 'hinglish';
let currentCategory = 'all';

// Trilingual UI Dictionary for Complete Seamless Switching
const I18N = {
    // Top Bar
    topLocation: {
        en: "📍 Location: Near Punjab National Bank, Main Road, Israna",
        hinglish: "📍 Location: Punjab National Bank ke paas, Israna",
        hi: "📍 लोकेशन: पंजाब नेशनल बैंक के पास, मेन रोड, इसराना"
    },
    topTiming: {
        en: "Open Daily: 9:00 AM – 9:30 PM",
        hinglish: "Subah 9:00 AM se Raat 9:30 PM tak Khula",
        hi: "रोजाना खुला: सुबह 9:00 AM से रात 9:30 PM तक"
    },
    topTagline: {
        en: "100% Pure Cold-Pressed • Verified Nutrition",
        hinglish: "100% Pure Fruits • Verified Nutrition",
        hi: "100% शुद्ध ताजे फल • प्रमाणित पोषण"
    },

    // Navigation
    navHome: { en: "Home", hinglish: "Home", hi: "होम" },
    navMenu: { en: "Menu & Nutrition", hinglish: "Menu & Calories", hi: "मेन्यू व कैलोरी" },
    navCalculator: { en: "Diet Calculator", hinglish: "Diet Calculator", hi: "डाइट कैलकुलेटर" },
    navLocation: { en: "Location", hinglish: "Shop Location", hi: "दुकान का पता" },
    navTray: { en: "Diet Tray", hinglish: "Diet Thali", hi: "डाइट थाली" },
    navOrderWhatsApp: { en: "WhatsApp Order", hinglish: "WhatsApp Order", hi: "व्हाट्सएप ऑर्डर" },

    // Hero Section
    heroBadge: {
        en: "📍 Israna, Near Punjab National Bank (Panipat)",
        hinglish: "📍 Israna, Punjab National Bank ke paas (Panipat)",
        hi: "📍 इसराना, पंजाब नेशनल बैंक के पास (पानीपत)"
    },
    heroTitlePehlwan: { en: "Pehlwan", hinglish: "Pehlwan", hi: "पहलवान" },
    heroTitleJuice: { en: "Juice Corner", hinglish: "Juice Corner", hi: "जूस कॉर्नर" },
    heroTagline: {
        en: "“Pure Nutrition & Power | 100% Cold-Pressed, Zero Additives”",
        hinglish: "“Shuddhata aur Taakat ka Asli Adda | 100% Pure, No Milawat!”",
        hi: "“शुद्धता और ताकत का असली ठिकाना | 100% शुद्ध, बिना मिलावट!”"
    },
    heroSubtitle: {
        en: "Experience fresh cold-pressed fruit juices, legendary dry-fruit power shakes, and high-protein grilled sandwiches with exact verified calories and macronutrients.",
        hinglish: "Israna me ab fresh cold-pressed juices, dry-fruit maha-shakes aur high-protein grilled sandwiches har item par verified calories aur protein ke sath.",
        hi: "इसराना में अब हर तरह का शुद्ध ताजा जूस, ड्राई फ्रूट महा-शेक और हाई-प्रोटीन ग्रिल्ड सैंडविच—हर आइटम पर सटीक कैलोरी और प्रोटीन के साथ।"
    },
    heroBtnMenu: { en: "Explore Menu & Macros", hinglish: "Menu & Calories Dekhein", hi: "मेन्यू व कैलोरी देखें" },
    heroBtnCalc: { en: "Pehlwan Diet Calculator", hinglish: "Pehlwan Diet Calculator", hi: "पहलवान डाइट कैलकुलेटर" },

    // 4 Highlights
    stat1Title: { en: "100% Pure", hinglish: "100% Pure", hi: "100% शुद्ध" },
    stat1Sub: { en: "Zero Added Water or Sugar", hinglish: "No Water, No Added Sugar", hi: "बिना पानी व चीनी के" },
    stat2Title: { en: "Up to 32g", hinglish: "Up to 32g", hi: "32g तक" },
    stat2Sub: { en: "Protein Power Shakes", hinglish: "Pure Protein Shakes", hi: "पहलवान प्रोटीन शेक्स" },
    stat3Title: { en: "Fresh Grilled", hinglish: "Fresh Grilled", hi: "ताजा ग्रिल्ड" },
    stat3Sub: { en: "120g Paneer & Egg Sandwiches", hinglish: "Paneer & Egg Sandwiches", hi: "पनीर व एग सैंडविच" },
    stat4Title: { en: "9 AM – 9:30 PM", hinglish: "9 AM – 9:30 PM", hi: "सुबह 9 - रात 9:30" },
    stat4Sub: { en: "Open All 365 Days", hinglish: "Rozana Open", hi: "365 दिन सेवा" },

    // Sections
    bestsellerTitle: { en: "Signature Menu Highlights", hinglish: "Pehlwan Top Hit Items", hi: "पहलवान टॉप हिट आइटम्स" },
    bestsellerSub: { en: "Transparent lab-verified Calories, Protein, and Fats on every order.", hinglish: "Har item par exact Calories, Protein aur Fats likha hai.", hi: "हर डिश पर सटीक कैलोरी, प्रोटीन और फैट प्रमाणित है।" },
    viewFullMenu: { en: "View Complete Menu →", hinglish: "Pura Menu Dekhein →", hi: "पूरा मेन्यू देखें →" },

    combosTitle: { en: "Athletic Power Combos", hinglish: "Tagde Diet Combos", hi: "पहलवान डाइट कॉम्बो" },
    combosSub: { en: "Synergistic juice and sandwich pairings crafted for training results.", hinglish: "Juice aur Sandwich ka super hit combination.", hi: "जूस और सैंडविच का संपूर्ण पौष्टिक मेल।" },

    locationTitle: { en: "Visit Our Shop in Israna", hinglish: "Pehlwan Juice Corner, Israna", hi: "पहलवान जूस कॉर्नर, इसराना" },
    locationSub: { en: "Right next to Punjab National Bank, Main Road, Israna (Panipat).", hinglish: "Punjab National Bank ke theek paas, Main Road, Israna.", hi: "पंजाब नेशनल बैंक के ठीक पास, मेन रोड, इसराना।" },
    locationBtnRoute: { en: "Get Directions on Google Maps", hinglish: "Google Maps par Route Dekhein", hi: "गूगल मैप्स पर रास्ता देखें" },
    locationBtnWhatsApp: { en: "Send Pre-Order on WhatsApp", hinglish: "WhatsApp par Order Bhejein", hi: "व्हाट्सएप पर ऑर्डर भेजें" },

    // Customer Feedback Section
    feedbackTitle: { en: "Local Athletes & Regular Customers Feedback", hinglish: "Regular & Local Customers ka Feedback", hi: "हमारे नियमित व स्थानीय ग्राहकों की राय" },
    feedbackSub: { en: "Honest feedback from Israna gym lifters, wrestlers, and daily health lovers.", hinglish: "Israna ke pehlwano, gym lifters aur daily customers ka asli anubhav.", hi: "इसराना के पहलवानों, जिम एथलीटों और नियमित परिवारों का सच्चा अनुभव।" },
    feedbackBtn: { en: "✍️ Share Your Feedback", hinglish: "✍️ Apna Feedback Dein", hi: "✍️ अपना फीडबैक दें" },

    // Drawer / Thali
    trayTitle: { en: "Your Diet Tray", hinglish: "Aapki Pehlwan Diet Thali", hi: "आपकी पहलवान डाइट थाली" },
    traySubtitle: { en: "Real-time Nutrition & Macro Balance", hinglish: "Live Calories, Protein & Fat Tracker", hi: "लाइव कैलोरी, प्रोटीन व फैट ट्रैकर" },
    trayEmptyTitle: { en: "Your Diet Tray is Empty", hinglish: "Diet Thali abhi khaali hai", hi: "डाइट थाली अभी खाली है" },
    trayEmptySub: { en: "Add juices, shakes or sandwiches to calculate macros.", hinglish: "Juice, shake ya sandwich chunein aur live calories dekhein.", hi: "ताजा जूस, शेक या सैंडविच चुनकर लाइव कैलोरी देखें।" },
    trayTotal: { en: "Total Bill", hinglish: "Total Bill (Kul Bill)", hi: "कुल बिल (Total Price)" },
    trayOrderBtn: { en: "Confirm & Send via WhatsApp", hinglish: "WhatsApp par Order Bhejein (Pick Up)", hi: "व्हाट्सएप पर ऑर्डर भेजें (Pick Up)" },
    trayPickupNote: { en: "Freshly prepared and packed upon your arrival.", hinglish: "Dukaan par pahunchte hi fresh order ready milega.", hi: "दुकान पर पहुँचते ही आपका ऑर्डर रेडी मिलेगा।" },

    // Macros
    cal: { en: "CALORIES", hinglish: "CALORIES", hi: "कैलोरी" },
    protein: { en: "PROTEIN", hinglish: "PROTEIN", hi: "प्रोटीन" },
    fats: { en: "FATS", hinglish: "FATS", hi: "फैट" },
    carbs: { en: "CARBS", hinglish: "CARBS", hi: "कार्ब्स" },
    addBtn: { en: "Add to Tray", hinglish: "Thali me Add Karein", hi: "थाली में जोड़ें" },
    shopStatusOpen: { en: "OPEN NOW", hinglish: "OPEN NOW", hi: "खुला है (OPEN)" },
    shopStatusClosed: { en: "CLOSED", hinglish: "CLOSED", hi: "बंद है (CLOSED)" },

    // Custom Shake Builder
    navCustomShake: { en: "Custom Shake", hinglish: "Custom Shake", hi: "कस्टम शेक" },
    customShakeTitle: { en: "BUILD YOUR CUSTOM SHAKE & JUICE", hinglish: "APNA CUSTOM SHAKE & JUICE BANAYEIN", hi: "अपनी पसंद का शेक व जूस खुद बनाएं" },
    customShakeSub: { en: "Select fresh fruits, Akhada dry fruits, and pure milk or protein to craft your personal power drink.", hinglish: "Apni marzi ke taaza fruit, silbatte ke dry fruit, pure farm milk aur whey protein ko mix karke apna custom power drink banayein.", hi: "अपनी पसंद के ताजे फल, अखाड़ा बादाम-काजू और शुद्ध दूध या प्रोटीन मिलाकर अपनी ताकतवर ड्रिंक तैयार करें।" },
    stepBase: { en: "Step 1: Choose Your Liquid Base", hinglish: "Step 1: Base Liquid Chunein", hi: "चरण 1: बेस लिक्विड चुनें (दूध / नारियल / जूस)" },
    stepFruit: { en: "Step 2: Pick Fresh Fruits", hinglish: "Step 2: Taaza Phal Chunein", hi: "चरण 2: ताजे फल चुनें" },
    stepDryFruit: { en: "Step 3: Akhada Dry Fruits & Seeds", hinglish: "Step 3: Akhada Dry Fruits & Seeds", hi: "चरण 3: अखाड़ा ड्राई फ्रूट्स व बीज" },
    stepBooster: { en: "Step 4: Whey Protein & Boosters", hinglish: "Step 4: Protein & Akhada Boosters", hi: "चरण 4: व्हे प्रोटीन व देसी बूस्टर" },
    stepSweet: { en: "Step 5: Sweetness & Sugar Preference", hinglish: "Step 5: Meetha / Sugar Chunein", hi: "चरण 5: मीठा / शुगर विकल्प" },
    stepSize: { en: "Step 6: Glass Size & Drink Name", hinglish: "Step 6: Glass Size aur Naam", hi: "चरण 6: ग्लास साइज व ड्रिंक का नाम" },
    addToTrayBtn: { en: "Add Custom Drink to Tray", hinglish: "Custom Drink Thali me Add Karein", hi: "कस्टम ड्रिंक थाली में जोड़ें" },
    whatsappOrderBtn: { en: "Direct Order on WhatsApp", hinglish: "WhatsApp par Order Bhejein", hi: "व्हाट्सएप पर ऑर्डर भेजें" }
};

// ============================================================
// GLOBAL DARK MODE / LIGHT MODE ENGINE
// ============================================================
function toggleSiteTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    const theme = isDark ? 'dark' : 'light';
    try {
        localStorage.setItem('pehlwan_theme', theme);
        localStorage.setItem('pehlwan_site_theme', theme);
        localStorage.setItem('pehlwan_admin_theme', theme);
    } catch (e) {}
    updateSiteThemeUI(isDark);
}

function updateSiteThemeUI(isDark) {
    const icon = document.getElementById('theme-toggle-icon');
    const btn = document.getElementById('theme-toggle-btn');
    const mobileIcon = document.getElementById('mobile-drawer-theme-icon');
    const mobileText = document.getElementById('mobile-drawer-theme-text');
    const mobileBadge = document.getElementById('mobile-drawer-theme-badge');

    if (icon) {
        icon.innerText = isDark ? '☀️' : '🌙';
    }
    if (btn) {
        btn.setAttribute('title', isDark ? 'Switch to Light Mode (दिन के लिए)' : 'Switch to Dark Mode (रात के लिए)');
        btn.setAttribute('aria-label', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    }
    if (mobileIcon) {
        mobileIcon.innerText = isDark ? '☀️' : '🌙';
    }
    if (mobileText) {
        mobileText.innerText = isDark ? 'Light Mode (दिन के लिए)' : 'Dark Mode (रात के लिए)';
    }
    if (mobileBadge) {
        mobileBadge.innerText = isDark ? '☀️ Light' : '🌙 Dark';
    }
}

function initSiteTheme() {
    let saved = null;
    try {
        saved = localStorage.getItem('pehlwan_theme') || localStorage.getItem('pehlwan_site_theme') || localStorage.getItem('pehlwan_admin_theme');
    } catch (e) {}

    const isDark = (saved === 'dark') || (!saved && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    updateSiteThemeUI(isDark);
}

document.addEventListener('DOMContentLoaded', () => {
    initSiteTheme();
    initLanguageSwitcher();
    updateShopStatus();
    setInterval(updateShopStatus, 30000);
    fetchPehlwanData();
    loadFeedbackFromSupabase();
    trackVisitor();
    updatePehlwanTrayUI();
    if (document.getElementById('pehlwan-calc-weight')) {
        runPehlwanCalculator();
    }
    if (document.getElementById('virtual-glass-liquid')) {
        initCustomShakeBuilder();
    }
    // initGymMusicPlayer();
    initPehlwanAIChat();


});

// Badam Ragda Spotlight Modal Controls
function openBadamRagdaModal() {
    const modal = document.getElementById('badam-ragda-modal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeBadamRagdaModal() {
    const modal = document.getElementById('badam-ragda-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// Fetch menu & combo data
async function fetchPehlwanData() {
    try {
        const res = await fetch('/api/menu');
        const data = await res.json();
        if (data.success) {
            pehlwanMenu = data.items;
            pehlwanCombos = data.combos;
            if (data.shop) pehlwanShop = data.shop;
            applyLanguage(currentLang);
        }
    } catch (e) {
        console.error('Menu load error:', e);
    }
}

// ============================================================
// 3-WAY GLOSSY LANGUAGE SWITCHER LOGIC
// Left = 'en' | Center = 'hinglish' | Right = 'hi'
// ============================================================
function initLanguageSwitcher() {
    const track = document.getElementById('lang-switch-track');
    if (!track) return;

    // Set initial position
    setSwitchPosition(currentLang);

    // Segment Click Handlers
    document.querySelectorAll('.switch-segment').forEach(seg => {
        seg.addEventListener('click', (e) => {
            const selectedLang = seg.getAttribute('data-lang');
            setSwitchPosition(selectedLang);
            applyLanguage(selectedLang);
        });
    });
}

function setSwitchPosition(lang) {
    const track = document.getElementById('lang-switch-track');
    if (!track) return;

    currentLang = lang;
    localStorage.setItem('pehlwan_lang', lang);

    if (lang === 'en') {
        track.setAttribute('data-pos', 'left');
    } else if (lang === 'hinglish') {
        track.setAttribute('data-pos', 'center');
    } else if (lang === 'hi') {
        track.setAttribute('data-pos', 'right');
    }
}

// Apply Selected Language across UI
function applyLanguage(lang) {
    currentLang = lang;

    // 1. Static Dictionary Replacements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (I18N[key] && I18N[key][lang]) {
            el.innerHTML = I18N[key][lang];
        }
    });

    // 2. Dynamic Menu Items Translation
    document.querySelectorAll('.pehlwan-menu-card').forEach(card => {
        const itemId = card.getAttribute('data-id');
        const item = pehlwanMenu.find(i => i.id === itemId);
        if (!item) return;

        const titleEl = card.querySelector('.item-title');
        const descEl = card.querySelector('.item-desc');
        const catEl = card.querySelector('.item-cat');
        const addBtnEl = card.querySelector('.item-add-btn span');

        if (titleEl) {
            if (lang === 'en') titleEl.innerText = item.name_en;
            else if (lang === 'hinglish') titleEl.innerText = item.name_hinglish;
            else titleEl.innerText = item.name_hi;
        }

        if (descEl) {
            if (lang === 'en') descEl.innerText = item.desc_en;
            else if (lang === 'hinglish') descEl.innerText = item.desc_hinglish;
            else descEl.innerText = item.desc_hi;
        }

        if (catEl) {
            if (lang === 'en') catEl.innerText = item.cat_en;
            else if (lang === 'hinglish') catEl.innerText = item.cat_hinglish;
            else catEl.innerText = item.cat_hi;
        }

        if (addBtnEl) {
            addBtnEl.innerText = I18N.addBtn[lang];
        }
    });

    // 3. Dynamic Combos Translation
    document.querySelectorAll('.pehlwan-combo-card').forEach(card => {
        const comboId = card.getAttribute('data-combo-id');
        const combo = pehlwanCombos.find(c => c.id === comboId);
        if (!combo) return;

        const titleEl = card.querySelector('.combo-title');
        const itemsEl = card.querySelector('.combo-items');
        const benefitEl = card.querySelector('.combo-benefit');

        if (titleEl) {
            if (lang === 'en') titleEl.innerText = combo.name_en;
            else if (lang === 'hinglish') titleEl.innerText = combo.name_hinglish;
            else titleEl.innerText = combo.name_hi;
        }

        if (itemsEl) {
            const prefix = lang === 'en' ? "Includes: " : (lang === 'hi' ? "शामिल: " : "Shamil: ");
            if (lang === 'en') itemsEl.innerText = prefix + combo.items_en;
            else if (lang === 'hinglish') itemsEl.innerText = prefix + combo.items_hinglish;
            else itemsEl.innerText = prefix + combo.items_hi;
        }

        if (benefitEl) {
            if (lang === 'en') benefitEl.innerText = combo.benefit_en;
            else if (lang === 'hinglish') benefitEl.innerText = combo.benefit_hinglish;
            else benefitEl.innerText = combo.benefit_hi;
        }
    });

    // 4. Custom Shake Builder Cards Translation
    document.querySelectorAll('.base-card').forEach(card => {
        const el = card.querySelector('.base-name');
        if (el) el.innerText = getCardName(card);
    });
    document.querySelectorAll('.fruit-card').forEach(card => {
        const el = card.querySelector('.fruit-name');
        if (el) el.innerText = getCardName(card);
    });
    document.querySelectorAll('.df-card').forEach(card => {
        const el = card.querySelector('.df-name');
        if (el) el.innerText = getCardName(card);
    });
    document.querySelectorAll('.booster-card').forEach(card => {
        const el = card.querySelector('.bst-name');
        if (el) el.innerText = getCardName(card);
    });
    document.querySelectorAll('.sweet-card').forEach(card => {
        const el = card.querySelector('.sweet-name');
        if (el) el.innerText = getCardName(card);
    });

    if (document.getElementById('virtual-glass-liquid')) {
        recalculateCustomDrink();
    }

    // 5. Update Tray UI Text
    updatePehlwanTrayUI();

    // 6. Update Shop Open/Closed Status
    updateShopStatus();
}

// Dynamic Real-time Shop Open/Closed Status (Strictly 9:00 AM – 9:30 PM IST)
function updateShopStatus() {
    let istMinutes = 0;
    try {
        const istParts = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Kolkata',
            hour12: false,
            hour: 'numeric',
            minute: 'numeric'
        }).formatToParts(new Date());

        const hours = parseInt(istParts.find(p => p.type === 'hour').value, 10);
        const minutes = parseInt(istParts.find(p => p.type === 'minute').value, 10);
        istMinutes = hours * 60 + minutes;
    } catch (e) {
        const now = new Date();
        const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
        istMinutes = (utcMinutes + 330) % 1440;
    }

    const openMin = 9 * 60; // 9:00 AM = 540 min
    const closeMin = 21 * 60 + 30; // 9:30 PM = 1290 min

    // Open ONLY between 9:00 AM and 9:30 PM IST; otherwise CLOSED
    const isOpen = istMinutes >= openMin && istMinutes < closeMin;

    document.querySelectorAll('.shop-status-badge').forEach(badge => {
        const dot = badge.querySelector('.status-dot');
        const text = badge.querySelector('.status-text');
        const isTicker = badge.classList.contains('ticker-badge');

        if (isOpen) {
            if (isTicker) {
                badge.className = 'shop-status-badge ticker-badge inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8.5px] font-black bg-emerald-400 text-black';
                if (dot) dot.className = 'status-dot w-1.5 h-1.5 rounded-full bg-emerald-900 animate-pulse';
                if (text) text.innerText = (currentLang === 'hi' ? 'खुला है' : 'OPEN');
            } else {
                badge.className = 'shop-status-badge inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black border shadow-sm bg-emerald-50 text-emerald-800 border-emerald-300';
                if (dot) dot.className = 'status-dot w-2 h-2 rounded-full bg-emerald-500 animate-pulse';
                if (text) text.innerText = (currentLang === 'hi' ? 'खुला है (OPEN NOW)' : 'OPEN NOW');
            }
        } else {
            if (isTicker) {
                badge.className = 'shop-status-badge ticker-badge inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8.5px] font-black bg-rose-600 text-white';
                if (dot) dot.className = 'status-dot w-1.5 h-1.5 rounded-full bg-white';
                if (text) text.innerText = (currentLang === 'hi' ? 'बंद है' : 'CLOSED');
            } else {
                badge.className = 'shop-status-badge inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black border shadow-sm bg-rose-50 text-rose-800 border-rose-300';
                if (dot) dot.className = 'status-dot w-2 h-2 rounded-full bg-rose-500';
                if (text) text.innerText = (currentLang === 'hi' ? 'बंद है (CLOSED)' : 'CLOSED (Opens 9 AM)');
            }
        }
    });
}

// Mobile Nav Toggle
function toggleMobileNav() {
    const nav = document.getElementById('mobile-nav');
    if (nav) nav.classList.toggle('hidden');
}

// Tray Drawer Toggle
function togglePehlwanTray() {
    const drawer = document.getElementById('pehlwan-tray-drawer');
    const overlay = document.getElementById('pehlwan-tray-overlay');
    if (!drawer) return;

    const isClosed = drawer.classList.contains('translate-x-full');
    if (isClosed) {
        drawer.classList.remove('translate-x-full');
        overlay.classList.remove('hidden');
        const curTotal = pehlwanTray.reduce((acc, c) => acc + (c.price * c.quantity), 0);
        updateDynamicUpiQr(curTotal);
    } else {
        drawer.classList.add('translate-x-full');
        overlay.classList.add('hidden');
    }
}

// Select Card Size & Dynamically Update Macros & Price
function selectCardSize(itemId, index, price, cal, protein, fats, carbs, sizeEn, sizeHi) {
    itemSelectedSize[itemId] = {
        index,
        price,
        cal,
        protein,
        fats,
        carbs,
        sizeEn,
        sizeHi
    };

    // Update active pill styling across all matching pills
    document.querySelectorAll(`.size-pill-${itemId}`).forEach(pill => {
        const pillIdx = parseInt(pill.getAttribute('data-index'));
        if (pillIdx === index) {
            pill.className = `size-pill-${itemId} flex-1 py-1.5 px-2 rounded-xl text-xs font-bold border transition-all text-center bg-black text-white border-black shadow font-black scale-105`;
        } else {
            pill.className = `size-pill-${itemId} flex-1 py-1.5 px-2 rounded-xl text-xs font-bold border transition-all text-center bg-white text-neutral-800 border-neutral-300 hover:border-black`;
        }
    });

    // Update displayed card values
    const priceEl = document.getElementById(`card-price-${itemId}`);
    const calEl = document.getElementById(`macro-cal-${itemId}`);
    const protEl = document.getElementById(`macro-prot-${itemId}`);
    const fatsEl = document.getElementById(`macro-fats-${itemId}`);
    const carbsEl = document.getElementById(`macro-carbs-${itemId}`);
    const topCalEl = document.getElementById(`top-cal-${itemId}`);

    if (priceEl) priceEl.innerText = `₹${price}`;
    if (calEl) calEl.innerText = cal;
    if (protEl) protEl.innerText = `${protein}g`;
    if (fatsEl) fatsEl.innerText = `${fats}g`;
    if (carbsEl) carbsEl.innerText = `${carbs}g`;
    if (topCalEl) topCalEl.innerText = `${cal} kcal`;
}

// Add Item to Tray with Glass Size Awareness
function addToPehlwanTray(itemId) {
    const item = pehlwanMenu.find(i => i.id === itemId);
    if (!item) return;

    const hasSizes = item.prices && item.prices.length > 0;
    const selected = itemSelectedSize[itemId] || (hasSizes ? {
        index: 0,
        price: item.prices[0].price,
        cal: item.prices[0].cal,
        protein: item.prices[0].protein,
        fats: item.prices[0].fats,
        carbs: item.prices[0].carbs,
        sizeEn: item.prices[0].size,
        sizeHi: item.prices[0].size_hi
    } : {
        index: 0,
        price: item.price,
        cal: item.calories,
        protein: item.protein,
        fats: item.fats,
        carbs: item.carbs,
        sizeEn: '',
        sizeHi: ''
    });

    const isMultiSize = item.prices && item.prices.length > 1;
    const sizeSuffixEn = isMultiSize ? ` (${selected.sizeEn})` : '';
    const sizeSuffixHi = isMultiSize ? ` (${selected.sizeHi || selected.sizeEn})` : '';
    const sizeSuffixHinglish = isMultiSize ? ` (${selected.sizeEn})` : '';
    const trayItemId = isMultiSize ? `${item.id}-${selected.sizeEn}` : item.id;

    const existing = pehlwanTray.find(i => i.id === trayItemId);
    if (existing) {
        existing.quantity += 1;
    } else {
        pehlwanTray.push({
            id: trayItemId,
            baseId: item.id,
            name_en: item.name_en + sizeSuffixEn,
            name_hinglish: item.name_hinglish + sizeSuffixHinglish,
            name_hi: item.name_hi + sizeSuffixHi,
            size: selected.sizeEn,
            price: selected.price,
            calories: selected.cal,
            protein: selected.protein,
            fats: selected.fats,
            carbs: selected.carbs,
            image: item.image,
            quantity: 1
        });
    }

    localStorage.setItem('pehlwan_juice_tray', JSON.stringify(pehlwanTray));
    updatePehlwanTrayUI();

    const displayName = currentLang === 'en' 
        ? (item.name_en + sizeSuffixEn) 
        : (currentLang === 'hi' ? (item.name_hi + sizeSuffixHi) : (item.name_hinglish + sizeSuffixHinglish));
    const feedbackMsg = currentLang === 'en' 
        ? `+ ${displayName} added to tray` 
        : (currentLang === 'hi' ? `+ ${displayName} थाली में जुड़ा!` : `+ ${displayName} Thali me Add ho gaya!`);
    showPehlwanFeedback(feedbackMsg);
}

function addComboToPehlwanTray(comboId) {
    if (comboId === 'combo-1') {
        addToPehlwanTray('item-12'); // Badam Ragda (₹100)
        addToPehlwanTray('item-16'); // Grill Sandwich (₹100)
    } else if (comboId === 'combo-2') {
        addToPehlwanTray('item-15'); // Avocado Shake (₹180)
        addToPehlwanTray('item-16'); // Grill Sandwich (₹100)
    } else {
        addToPehlwanTray('item-11'); // Beej Dana (₹100)
        addToPehlwanTray('item-2');  // Bel Patther Shake (₹70)
    }
    togglePehlwanTray();
}

function updatePehlwanQuantity(itemId, delta) {
    const idx = pehlwanTray.findIndex(i => i.id === itemId);
    if (idx > -1) {
        pehlwanTray[idx].quantity += delta;
        if (pehlwanTray[idx].quantity <= 0) {
            pehlwanTray.splice(idx, 1);
        }
        localStorage.setItem('pehlwan_juice_tray', JSON.stringify(pehlwanTray));
        updatePehlwanTrayUI();
    }
}


// Dynamic UPI QR Code & Payment Switcher Engine
function updateDynamicUpiQr(amount) {
    const upiId = pehlwanShop.upi_id || '9588351884@upi';
    const upiName = pehlwanShop.upi_name || 'Pehlwan Juice Corner';
    const amountVal = Math.max(0, parseInt(amount) || 0);

    const upiAmountBadge = document.getElementById('upi-amount-badge');
    if (upiAmountBadge) upiAmountBadge.innerText = `₹${amountVal}`;

    const displayUpiId = document.getElementById('display-upi-id');
    if (displayUpiId) displayUpiId.innerText = upiId;

    // Standard NPCI UPI URI Scheme
    const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${amountVal}&cu=INR&tn=${encodeURIComponent('Pehlwan_Order')}`;

    const payBtn = document.getElementById('direct-upi-pay-btn');
    if (payBtn) payBtn.href = upiUrl;

    const qrImg = document.getElementById('dynamic-upi-qr');
    if (qrImg) {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;
        qrImg.src = qrUrl;
    }
}

function selectPaymentMethod(method) {
    const hiddenInput = document.getElementById('order-payment-method');
    if (hiddenInput) hiddenInput.value = method;

    const optUpi = document.getElementById('pay-opt-upi');
    const optCod = document.getElementById('pay-opt-cod');
    const radioUpi = document.getElementById('pay-radio-upi');
    const radioCod = document.getElementById('pay-radio-cod');
    const upiBox = document.getElementById('upi-payment-box');
    const codBox = document.getElementById('cod-payment-box');
    const badgeSelected = document.getElementById('payment-badge-selected');

    if (method === 'upi') {
        if (optUpi) optUpi.className = "cursor-pointer border-2 border-black bg-black text-white rounded-xl p-2.5 flex flex-col justify-between text-left transition-all shadow-sm";
        if (optCod) optCod.className = "cursor-pointer border-2 border-neutral-300 bg-white text-neutral-800 rounded-xl p-2.5 flex flex-col justify-between text-left transition-all hover:border-black";
        if (radioUpi) radioUpi.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-black"></span>';
        if (radioCod) radioCod.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-transparent"></span>';
        if (upiBox) upiBox.classList.remove('hidden');
        if (codBox) codBox.classList.add('hidden');
        if (badgeSelected) {
            badgeSelected.className = "text-[10px] text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-full font-extrabold flex items-center gap-1";
            badgeSelected.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span> Online UPI / QR';
        }
    } else {
        if (optUpi) optUpi.className = "cursor-pointer border-2 border-neutral-300 bg-white text-neutral-800 rounded-xl p-2.5 flex flex-col justify-between text-left transition-all hover:border-black";
        if (optCod) optCod.className = "cursor-pointer border-2 border-black bg-black text-white rounded-xl p-2.5 flex flex-col justify-between text-left transition-all shadow-sm";
        if (radioUpi) radioUpi.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-transparent"></span>';
        if (radioCod) radioCod.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-black"></span>';
        if (upiBox) upiBox.classList.add('hidden');
        if (codBox) codBox.classList.remove('hidden');
        if (badgeSelected) {
            badgeSelected.className = "text-[10px] text-amber-800 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-full font-extrabold flex items-center gap-1";
            badgeSelected.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span> Cash on Delivery';
        }
    }
}

function copyShopUpiId(btn) {
    const upiId = pehlwanShop.upi_id || '9588351884@upi';
    navigator.clipboard.writeText(upiId).then(() => {
        const orig = btn.innerHTML;
        btn.innerHTML = '<span>✅ Copied!</span>';
        setTimeout(() => btn.innerHTML = orig, 1800);
    }).catch(() => {
        alert('UPI ID: ' + upiId);
    });
}

function updatePehlwanTrayUI() {
    const totalCount = pehlwanTray.reduce((acc, c) => acc + c.quantity, 0);
    const totalCal = pehlwanTray.reduce((acc, c) => acc + (c.calories * c.quantity), 0);
    const totalProt = Math.round(pehlwanTray.reduce((acc, c) => acc + (c.protein * c.quantity), 0) * 10) / 10;
    const totalFats = Math.round(pehlwanTray.reduce((acc, c) => acc + (c.fats * c.quantity), 0) * 10) / 10;
    const totalCarbs = Math.round(pehlwanTray.reduce((acc, c) => acc + (c.carbs * c.quantity), 0) * 10) / 10;
    const totalPrice = pehlwanTray.reduce((acc, c) => acc + (c.price * c.quantity), 0);

    const badge = document.getElementById('pehlwan-tray-count');
    const headerCal = document.getElementById('tray-header-calories');
    const headerProt = document.getElementById('tray-header-protein');
    if (badge) badge.innerText = totalCount;
    if (headerCal) headerCal.innerText = Math.round(totalCal);
    if (headerProt) headerProt.innerText = `${totalProt}g`;

    const dCal = document.getElementById('drawer-calories');
    const dProt = document.getElementById('drawer-protein');
    const dFats = document.getElementById('drawer-fats');
    const dCarbs = document.getElementById('drawer-carbs');
    const dPrice = document.getElementById('drawer-price');

    if (dCal) dCal.innerText = Math.round(totalCal);
    if (dProt) dProt.innerText = `${totalProt}g`;
    if (dFats) dFats.innerText = `${totalFats}g`;
    if (dCarbs) dCarbs.innerText = `${totalCarbs}g`;
    if (dPrice) dPrice.innerText = `₹${totalPrice}`;
    updateDynamicUpiQr(totalPrice);

    // Verdict in Current Language
    const verdict = document.getElementById('pehlwan-verdict-text');
    if (verdict) {
        if (totalCount === 0) {
            verdict.innerText = currentLang === 'en' ? "Select items from the menu to balance your nutrition." : (currentLang === 'hi' ? "मेन्यू से अपनी पसंद का जूस, शेक या सैंडविच जोड़ें।" : "Menu se apna manpasand juice, shake ya sandwich add karein.");
        } else if (totalProt >= 30) {
            verdict.innerText = currentLang === 'en' ? `💪 Athletic Fuel: ${totalProt}g Protein & ${Math.round(totalCal)} kcal in tray.` : (currentLang === 'hi' ? `💪 पहलवान पावर: थाली में कुल ${totalProt}g प्रोटीन और ${Math.round(totalCal)} kcal.` : `💪 Pehlwan Power: Thali me kul ${totalProt}g Protein aur ${Math.round(totalCal)} kcal.`);
        } else {
            verdict.innerText = currentLang === 'en' ? `⚡ Clean meal: ${totalProt}g Protein. Add a protein shake to hit 35g+.` : (currentLang === 'hi' ? `⚡ बढ़िया डाइट: ${totalProt}g प्रोटीन। शेक जोड़कर 35g+ करें।` : `⚡ Badhiya diet: ${totalProt}g Protein. Ek shake add karke 35g+ karein.`);
        }
    }

    const container = document.getElementById('pehlwan-tray-items');
    const emptyState = document.getElementById('pehlwan-tray-empty');
    if (!container) return;

    if (pehlwanTray.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        Array.from(container.children).forEach(c => {
            if (c.id !== 'pehlwan-tray-empty') c.remove();
        });
    } else {
        if (emptyState) emptyState.classList.add('hidden');
        Array.from(container.children).forEach(c => {
            if (c.id !== 'pehlwan-tray-empty') c.remove();
        });

        pehlwanTray.forEach(item => {
            const name = currentLang === 'en' ? item.name_en : (currentLang === 'hi' ? item.name_hi : item.name_hinglish);
            const row = document.createElement('div');
            row.className = "bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-3 shadow";
            row.innerHTML = `
                <div class="flex items-center gap-3">
                    <img src="${item.image}" alt="${name}" class="w-12 h-12 rounded-xl object-cover">
                    <div>
                        <div class="text-xs font-bold text-white leading-tight">${name}</div>
                        <div class="text-[10px] text-black font-medium mt-0.5">
                            ${Math.round(item.calories * item.quantity)} kcal • ${Math.round(item.protein * item.quantity * 10)/10}g P • ${Math.round(item.fats * item.quantity * 10)/10}g F
                        </div>
                        <div class="text-[11px] font-black text-slate-300 mt-0.5">₹${item.price * item.quantity}</div>
                    </div>
                </div>
                <div class="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl">
                    <button onclick="updatePehlwanQuantity('${item.id}', -1)" class="w-6 h-6 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center text-xs font-bold">-</button>
                    <span class="w-5 text-center text-xs font-bold text-white">${item.quantity}</span>
                    <button onclick="updatePehlwanQuantity('${item.id}', 1)" class="w-6 h-6 rounded-lg bg-slate-700 hover:bg-slate-600 text-black flex items-center justify-center text-xs font-bold">+</button>
                </div>
            `;
            container.appendChild(row);
        });
    }
}

// WhatsApp Order Formatter
function sendOrderViaWhatsApp() {
    if (pehlwanTray.length === 0) {
        alert(currentLang === 'en' ? "Your tray is empty! Please add items from menu first." : "Aapki thali abhi khaali hai! Kripya pehle menu se items add karein.");
        return;
    }

    const nameInput = document.getElementById('order-customer-name');
    const phoneInput = document.getElementById('order-customer-phone');
    const addrInput = document.getElementById('order-customer-address');
    const weightInput = document.getElementById('order-customer-weight');
    const heightInput = document.getElementById('order-customer-height');
    const paymentMethodInput = document.getElementById('order-payment-method');
    const utrInput = document.getElementById('order-payment-utr');

    const custName = nameInput?.value.trim() || '';
    const custPhone = phoneInput?.value.trim() || '';
    const custAddress = addrInput?.value.trim() || '';
    const custWeight = weightInput?.value.trim() || '';
    const custHeight = heightInput?.value.trim() || '';
    const paymentMethodRaw = paymentMethodInput?.value.trim() || 'upi';
    const paymentUtr = utrInput?.value.trim() || '';

    const isUpi = paymentMethodRaw === 'upi';
    const paymentMethod = isUpi ? 'Online UPI' : 'Cash on Delivery';
    const paymentStatus = isUpi ? 'Paid - UPI' : 'Pending - COD';

    // Validation: Require Name and Phone
    if (!custName) {
        alert(currentLang === 'en' ? "Please enter your Full Name." : "Kripya apna Poora Naam bharein.");
        nameInput?.focus();
        return;
    }
    if (!custPhone || custPhone.length < 10) {
        alert(currentLang === 'en' ? "Please enter a valid 10-digit Mobile Number." : "Kripya apna 10-digit Mobile Number bharein.");
        phoneInput?.focus();
        return;
    }

    // Save details to localStorage for instant auto-fill next time
    localStorage.setItem('pehlwan_last_order_details', JSON.stringify({
        name: custName,
        phone: custPhone,
        address: custAddress,
        weight: custWeight,
        height: custHeight
    }));

    const orderId = '#ORD-' + Math.floor(100 + Math.random() * 900);

    const totalCal = Math.round(pehlwanTray.reduce((acc, c) => acc + (c.calories * c.quantity), 0));
    const totalProt = Math.round(pehlwanTray.reduce((acc, c) => acc + (c.protein * c.quantity), 0) * 10) / 10;
    const totalFats = Math.round(pehlwanTray.reduce((acc, c) => acc + (c.fats * c.quantity), 0) * 10) / 10;
    const totalPrice = pehlwanTray.reduce((acc, c) => acc + (c.price * c.quantity), 0);

    let itemsText = "";
    pehlwanTray.forEach((item, index) => {
        const name = currentLang === 'en' ? item.name_en : (currentLang === 'hi' ? item.name_hi : item.name_hinglish);
        itemsText += `%0A${index + 1}. *${name}* x ${item.quantity} = ₹${item.price * item.quantity} (${item.calories * item.quantity} kcal, ${item.protein * item.quantity}g P)`;
    });

    let customerInfoText = `%0A👤 *Customer:* ${encodeURIComponent(custName)} | 📱 *Phone:* ${encodeURIComponent(custPhone)}`;
    if (custAddress) {
        customerInfoText += `%0A📍 *Delivery Address:* ${encodeURIComponent(custAddress)}`;
    }
    let statsArr = [];
    if (custWeight) statsArr.push(`Weight: ${encodeURIComponent(custWeight)} kg`);
    if (custHeight) statsArr.push(`Height: ${encodeURIComponent(custHeight)}`);
    if (statsArr.length > 0) {
        customerInfoText += `%0A💪 *Health Stats:* ${statsArr.join(' | ')}`;
    }

    let paymentInfoText = `%0A💳 *Payment Option:* ${encodeURIComponent(paymentMethod)} (${encodeURIComponent(paymentStatus)})`;
    if (isUpi && paymentUtr) {
        paymentInfoText += ` | Ref/UTR: ${encodeURIComponent(paymentUtr)}`;
    }
    customerInfoText += paymentInfoText;

    const msg = `*Pehlwan Juice Corner (Israna) - Pre-Order ${orderId}*%0A----------------------------${customerInfoText}%0A----------------------------${itemsText}%0A----------------------------%0A*Total Bill:* ₹${totalPrice}%0A*Nutrition:* ${totalCal} kcal | ${totalProt}g Protein | ${totalFats}g Fat%0A%0A📍 *Pickup/Delivery:* Israna (Panipat)%0APlease confirm & keep order ready!`;

    // Log to Supabase Cloud with full Customer Details, Address, Health Stats & Payment Info
    logOrderToSupabase(pehlwanTray, totalPrice, totalCal, totalProt, custName, custPhone, orderId, custAddress, custWeight, custHeight, paymentMethod, paymentStatus, paymentUtr);

    showPehlwanFeedback(`Order ${orderId} Placed! Opening WhatsApp... 🚀`);

    const phoneNum = pehlwanShop.whatsapp || '919588351884';
    const whatsappUrl = `https://wa.me/${phoneNum}?text=${msg}`;
    window.open(whatsappUrl, '_blank');
}

function showPehlwanFeedback(msg) {
    const div = document.createElement('div');
    div.className = "fixed bottom-5 right-5 z-50 bg-black text-white border border-neutral-700 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-2xl animate-bounce";
    div.innerText = msg;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 2500);
}

// Menu Filter
function setPehlwanCategory(catId) {
    currentCategory = catId;
    document.querySelectorAll('.pehlwan-cat-tab').forEach(b => {
        b.classList.remove('active', 'bg-black', 'text-white');
        b.classList.add('bg-white', 'text-neutral-800', 'border', 'border-neutral-300');
    });
    const active = document.getElementById(`cat-${catId}`);
    if (active) {
        active.classList.add('active', 'bg-black', 'text-white');
        active.classList.remove('bg-white', 'text-neutral-800', 'border', 'border-neutral-300');
    }
    filterPehlwanMenu();
}

function filterPehlwanMenu() {
    const search = document.getElementById('pehlwan-search-input')?.value.toLowerCase().trim() || '';
    const cards = Array.from(document.querySelectorAll('.pehlwan-menu-card'));
    let visible = 0;

    cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        const text = card.innerText.toLowerCase();

        const catMatch = (currentCategory === 'all' || cat === currentCategory);
        const searchMatch = !search || text.includes(search);

        if (catMatch && searchMatch) {
            card.style.display = 'flex';
            visible++;
        } else {
            card.style.display = 'none';
        }
    });

    const count = document.getElementById('pehlwan-results-count');
    if (count) {
        count.innerText = currentLang === 'en' ? `${visible} items available` : (currentLang === 'hi' ? `${visible} शुद्ध आइटम्स उपलब्ध हैं` : `${visible} shuddh items available hain`);
    }
}

// Calculator Logic
let calcGender = 'male';
let calcGoal = 'strength';
let currentCalcCombo = null;

function setCalcGender(g) {
    calcGender = g;
    document.querySelectorAll('.pehlwan-gender-btn').forEach(b => {
        b.classList.remove('active', 'bg-slate-800', 'border-2', 'border-black', 'text-white');
        b.classList.add('bg-slate-900', 'border-slate-800', 'text-slate-400');
    });
    const act = document.getElementById(`gender-${g}`);
    if (act) {
        act.classList.add('active', 'bg-slate-800', 'border-2', 'border-black', 'text-white');
        act.classList.remove('bg-slate-900', 'border-slate-800', 'text-slate-400');
    }
    runPehlwanCalculator();
}

function setCalcGoal(goal) {
    calcGoal = goal;
    document.querySelectorAll('.pehlwan-goal-btn').forEach(b => {
        b.classList.remove('active', 'bg-slate-800', 'border-2', 'border-black');
        b.classList.add('bg-slate-900', 'border-slate-800');
    });
    const act = document.getElementById(`goal-${goal}`);
    if (act) {
        act.classList.add('active', 'bg-slate-800', 'border-2', 'border-black');
        act.classList.remove('bg-slate-900', 'border-slate-800');
    }
    runPehlwanCalculator();
}

async function runPehlwanCalculator() {
    const age = parseInt(document.getElementById('pehlwan-calc-age')?.value || 23);
    const weight = parseFloat(document.getElementById('pehlwan-calc-weight')?.value || 70);
    const height = parseFloat(document.getElementById('pehlwan-calc-height')?.value || 172);

    try {
        const res = await fetch('/api/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                gender: calcGender,
                age,
                weight,
                height,
                goal: calcGoal
            })
        });

        const data = await res.json();
        if (data.success) {
            document.getElementById('calc-res-calories').innerText = data.target_calories.toLocaleString();
            document.getElementById('calc-res-protein').innerText = `${data.target_protein}g`;
            document.getElementById('calc-res-fats').innerText = `${data.target_fats}g`;
            document.getElementById('calc-res-carbs').innerText = `${data.target_carbs}g`;
            document.getElementById('calc-res-bmr').innerText = data.bmr.toLocaleString();
            document.getElementById('calc-res-tdee').innerText = data.tdee.toLocaleString();

            const title = document.getElementById('calc-goal-title');
            if (title) {
                if (calcGoal === 'fatloss') {
                    title.innerText = currentLang === 'en' ? "Fat Loss & Athletic Shred" : (currentLang === 'hi' ? "फैट लॉस व पेट की चर्बी घटाना" : "Fat Loss & Charbi Ghatana");
                } else if (calcGoal === 'mass') {
                    title.innerText = currentLang === 'en' ? "Clean Muscle Mass & Bulking" : (currentLang === 'hi' ? "बॉडी साइज व वजन बढ़ाना" : "Body Size & Wajan Badhana");
                } else {
                    title.innerText = currentLang === 'en' ? "Strength & Athletic Stamina" : (currentLang === 'hi' ? "ताकत व स्टैमिना डाइट" : "Taakat & Stamina Diet");
                }
            }

            currentCalcCombo = data.suggested_combo;
            if (currentCalcCombo) {
                const name = currentLang === 'en' ? currentCalcCombo.name_en : (currentLang === 'hi' ? currentCalcCombo.name_hi : currentCalcCombo.name_hinglish);
                const items = currentLang === 'en' ? currentCalcCombo.items_en : (currentLang === 'hi' ? currentCalcCombo.items_hi : currentCalcCombo.items_hinglish);
                document.getElementById('combo-name').innerText = name;
                document.getElementById('combo-price').innerText = `₹${currentCalcCombo.price}`;
                document.getElementById('combo-items').innerText = items;
                document.getElementById('combo-macros').innerText = `⚡ ${currentCalcCombo.calories} kcal | ${currentCalcCombo.protein}g P | ${currentCalcCombo.fats}g Fat | ${currentCalcCombo.carbs}g Carbs`;
            }
        }
    } catch (e) {
        console.error('Calculator API error:', e);
    }
}

function addCurrentComboToTray() {
    if (currentCalcCombo) {
        addComboToPehlwanTray(currentCalcCombo.id);
    }
}

// ============================================================
// CUSTOMER FEEDBACK & REVIEWS LOGIC
// ============================================================
let selectedFeedbackRating = 5;

function openFeedbackModal() {
    const modal = document.getElementById('pehlwan-feedback-modal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeFeedbackModal() {
    const modal = document.getElementById('pehlwan-feedback-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function setFeedbackRating(stars) {
    selectedFeedbackRating = stars;
    for (let i = 1; i <= 5; i++) {
        const starEl = document.getElementById(`fb-star-${i}`);
        if (starEl) {
            if (i <= stars) {
                starEl.className = "text-black cursor-pointer text-2xl transition-transform hover:scale-125";
            } else {
                starEl.className = "text-slate-600 cursor-pointer text-2xl transition-transform hover:scale-125";
            }
        }
    }
}

async function submitCustomerFeedback(e) {
    if (e) e.preventDefault();
    const name = document.getElementById('fb-input-name')?.value.trim() || 'Regular Customer';
    const role = document.getElementById('fb-input-role')?.value.trim() || 'Local Customer';
    const favorite = document.getElementById('fb-input-favorite')?.value.trim() || 'Pehlwan Special Badam Ragda';
    const comment = document.getElementById('fb-input-comment')?.value.trim();

    if (!comment) {
        alert(currentLang === 'hi' ? 'Kripya apna 1-2 line ka feedback likhein.' : (currentLang === 'en' ? 'Please write your feedback message.' : 'Kripya apna 1-2 line ka feedback likhein.'));
        return;
    }

    const newFb = {
        name,
        role,
        favorite,
        rating: selectedFeedbackRating || 5,
        comment
    };

    // 1. Try Supabase Client
    let saved = false;
    try {
        if (supabaseClient) {
            const { error } = await supabaseClient.from('feedback').insert([newFb]);
            if (!error) saved = true;
        }
    } catch (err) {}

    // 2. Direct REST Fallback
    if (!saved) {
        try {
            await supabaseRest('feedback', 'POST', newFb);
            saved = true;
        } catch (err) {}
    }

    // 3. Flask Server Fallback
    try {
        await fetch('/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newFb)
        });
    } catch (err) {}

    // Prepend new feedback card dynamically to grid
    const grid = document.getElementById('pehlwan-feedback-grid');
    if (grid) {
        const card = document.createElement('div');
        card.className = 'pehlwan-feedback-card luxury-card rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-sm bg-white border-2 border-black';
        const starsHtml = '★'.repeat(selectedFeedbackRating || 5);
        card.innerHTML = `
            <div class="space-y-3">
                <div class="flex items-center justify-between">
                    <div class="text-black text-sm tracking-widest font-black">${starsHtml}</div>
                    <span class="bg-black text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        ${role}
                    </span>
                </div>
                <p class="text-xs text-neutral-800 font-medium italic leading-relaxed">
                    "${comment}"
                </p>
            </div>
            <div class="pt-4 border-t border-neutral-200 space-y-2">
                <div class="inline-flex items-center gap-1.5 bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-xl text-[10px] text-black">
                    <span>❤️ Fav:</span>
                    <span class="font-bold">${favorite}</span>
                </div>
                <div class="flex items-center justify-between text-xs">
                    <span class="font-heading font-black text-black">${name}</span>
                    <span class="text-[10px] text-emerald-600 font-bold">Just now (Live)</span>
                </div>
            </div>
        `;
        grid.insertBefore(card, grid.firstChild);
    }

    closeFeedbackModal();
    if (document.getElementById('fb-input-comment')) document.getElementById('fb-input-comment').value = '';
    showPehlwanFeedback(currentLang === 'hi' ? 'Aapka feedback add ho gaya! Bahut shukriya!' : 'Aapka feedback database me save ho gaya!');
}

/* ============================================================
   CUSTOM SHAKE & JUICE BUILDER LOGIC
   ============================================================ */

let customBuilderState = {
    baseId: 'base-buffalo-milk',
    fruits: [],
    dryfruits: [],
    boosters: [],
    sweetenerId: 'sweet-none',
    size: 'regular',
    customName: ''
};

function initCustomShakeBuilder() {
    recalculateCustomDrink();
}

function selectCustomBase(baseId) {
    customBuilderState.baseId = baseId;
    document.querySelectorAll('.base-card').forEach(c => {
        if (c.getAttribute('data-id') === baseId) {
            c.classList.add('selected', 'border-black');
            const ind = c.querySelector('.check-indicator');
            if (ind) ind.classList.remove('opacity-0');
        } else {
            c.classList.remove('selected', 'border-black');
            const ind = c.querySelector('.check-indicator');
            if (ind) ind.classList.add('opacity-0');
        }
    });
    recalculateCustomDrink();
}

function toggleCustomFruit(fruitId) {
    const idx = customBuilderState.fruits.indexOf(fruitId);
    const card = document.getElementById(`card-${fruitId}`);
    if (idx > -1) {
        customBuilderState.fruits.splice(idx, 1);
        if (card) {
            card.classList.remove('selected', 'border-black');
            const ind = card.querySelector('.check-indicator');
            if (ind) ind.classList.remove('opacity-100');
        }
    } else {
        customBuilderState.fruits.push(fruitId);
        if (card) {
            card.classList.add('selected', 'border-black');
            const ind = card.querySelector('.check-indicator');
            if (ind) ind.classList.add('opacity-100');
        }
    }
    recalculateCustomDrink();
}

function toggleCustomDryFruit(dfId) {
    const idx = customBuilderState.dryfruits.indexOf(dfId);
    const card = document.getElementById(`card-${dfId}`);
    if (idx > -1) {
        customBuilderState.dryfruits.splice(idx, 1);
        if (card) {
            card.classList.remove('selected', 'border-black');
            const ind = card.querySelector('.check-indicator');
            if (ind) ind.classList.remove('opacity-100');
        }
    } else {
        customBuilderState.dryfruits.push(dfId);
        if (card) {
            card.classList.add('selected', 'border-black');
            const ind = card.querySelector('.check-indicator');
            if (ind) ind.classList.add('opacity-100');
        }
    }
    recalculateCustomDrink();
}

function toggleCustomBooster(boosterId) {
    const idx = customBuilderState.boosters.indexOf(boosterId);
    const card = document.getElementById(`card-${boosterId}`);
    if (idx > -1) {
        customBuilderState.boosters.splice(idx, 1);
        if (card) {
            card.classList.remove('selected', 'border-black');
            const ind = card.querySelector('.check-indicator');
            if (ind) ind.classList.remove('opacity-100');
        }
    } else {
        customBuilderState.boosters.push(boosterId);
        if (card) {
            card.classList.add('selected', 'border-black');
            const ind = card.querySelector('.check-indicator');
            if (ind) ind.classList.add('opacity-100');
        }
    }
    recalculateCustomDrink();
}

function selectCustomSweetener(sweetId) {
    customBuilderState.sweetenerId = sweetId;
    document.querySelectorAll('.sweet-card').forEach(c => {
        if (c.getAttribute('data-id') === sweetId) {
            c.classList.add('selected', 'border-black');
        } else {
            c.classList.remove('selected', 'border-black');
        }
    });
    recalculateCustomDrink();
}

function setCustomGlassSize(size) {
    customBuilderState.size = size;
    const btnReg = document.getElementById('size-btn-regular');
    const btnJumbo = document.getElementById('size-btn-jumbo');

    if (btnReg && btnJumbo) {
        if (size === 'jumbo') {
            btnJumbo.className = "size-choice-btn active bg-black text-white text-black border-2 border-amber-400 font-black text-xs py-3.5 px-4 rounded-2xl flex items-center justify-between shadow";
            btnReg.className = "size-choice-btn bg-neutral-900/90 text-slate-300 border border-white/10 font-bold text-xs py-3.5 px-4 rounded-2xl flex items-center justify-between hover:border-amber-400/40 transition-all";
        } else {
            btnReg.className = "size-choice-btn active bg-black text-white text-black border-2 border-amber-400 font-black text-xs py-3.5 px-4 rounded-2xl flex items-center justify-between shadow";
            btnJumbo.className = "size-choice-btn bg-neutral-900/90 text-slate-300 border border-white/10 font-bold text-xs py-3.5 px-4 rounded-2xl flex items-center justify-between hover:border-amber-400/40 transition-all";
        }
    }

    const sizeBadge = document.getElementById('virtual-glass-size-badge');
    if (sizeBadge) {
        sizeBadge.innerText = size === 'jumbo' ? '500ml Jumbo Akhada Glass' : '350ml Regular Glass';
    }

    recalculateCustomDrink();
}

function updateCustomDrinkName() {
    const input = document.getElementById('custom-drink-name-input');
    if (input) {
        customBuilderState.customName = input.value.trim();
        recalculateCustomDrink();
    }
}

function recalculateCustomDrink() {
    let rawPrice = 0;
    let rawCal = 0;
    let rawProt = 0;
    let rawFats = 0;
    let rawCarbs = 0;

    let selectedTags = [];
    let dominantColor = '#F59E0B';

    // 1. Base
    const baseCard = document.getElementById(`card-${customBuilderState.baseId}`);
    if (baseCard) {
        rawPrice += parseFloat(baseCard.getAttribute('data-price') || 0);
        rawCal += parseFloat(baseCard.getAttribute('data-cal') || 0);
        rawProt += parseFloat(baseCard.getAttribute('data-protein') || 0);
        rawFats += parseFloat(baseCard.getAttribute('data-fats') || 0);
        rawCarbs += parseFloat(baseCard.getAttribute('data-carbs') || 0);

        const baseColor = baseCard.getAttribute('data-color') || '#FFFBEB';
        dominantColor = baseColor;
        const bName = getCardName(baseCard);
        selectedTags.push({ label: bName, icon: '🥛', type: 'base' });
    }

    // 2. Fruits
    customBuilderState.fruits.forEach(fId => {
        const fCard = document.getElementById(`card-${fId}`);
        if (fCard) {
            rawPrice += parseFloat(fCard.getAttribute('data-price') || 0);
            rawCal += parseFloat(fCard.getAttribute('data-cal') || 0);
            rawProt += parseFloat(fCard.getAttribute('data-protein') || 0);
            rawFats += parseFloat(fCard.getAttribute('data-fats') || 0);
            rawCarbs += parseFloat(fCard.getAttribute('data-carbs') || 0);

            const fColor = fCard.getAttribute('data-color');
            if (fColor) dominantColor = fColor;

            const fName = getCardName(fCard);
            selectedTags.push({ label: fName, icon: '🍓', type: 'fruit' });
        }
    });

    // 3. Dry Fruits
    customBuilderState.dryfruits.forEach(dfId => {
        const dfCard = document.getElementById(`card-${dfId}`);
        if (dfCard) {
            rawPrice += parseFloat(dfCard.getAttribute('data-price') || 0);
            rawCal += parseFloat(dfCard.getAttribute('data-cal') || 0);
            rawProt += parseFloat(dfCard.getAttribute('data-protein') || 0);
            rawFats += parseFloat(dfCard.getAttribute('data-fats') || 0);
            rawCarbs += parseFloat(dfCard.getAttribute('data-carbs') || 0);

            const dfName = getCardName(dfCard);
            selectedTags.push({ label: dfName, icon: '🌰', type: 'df' });
        }
    });

    // 4. Boosters
    customBuilderState.boosters.forEach(bstId => {
        const bstCard = document.getElementById(`card-${bstId}`);
        if (bstCard) {
            rawPrice += parseFloat(bstCard.getAttribute('data-price') || 0);
            rawCal += parseFloat(bstCard.getAttribute('data-cal') || 0);
            rawProt += parseFloat(bstCard.getAttribute('data-protein') || 0);
            rawFats += parseFloat(bstCard.getAttribute('data-fats') || 0);
            rawCarbs += parseFloat(bstCard.getAttribute('data-carbs') || 0);

            if (bstId === 'boost-cocoa' || bstId === 'boost-oreo') {
                dominantColor = '#5c2c06';
            }

            const bstName = getCardName(bstCard);
            selectedTags.push({ label: bstName, icon: '⚡', type: 'booster' });
        }
    });

    // 5. Sweetener
    const swCard = document.getElementById(`card-${customBuilderState.sweetenerId}`);
    if (swCard) {
        rawPrice += parseFloat(swCard.getAttribute('data-price') || 0);
        rawCal += parseFloat(swCard.getAttribute('data-cal') || 0);
        rawCarbs += parseFloat(swCard.getAttribute('data-carbs') || 0);

        if (customBuilderState.sweetenerId !== 'sweet-none') {
            const swName = getCardName(swCard);
            selectedTags.push({ label: swName, icon: '🍯', type: 'sweet' });
        }
    }

    // Multiplier for size
    const multiplier = customBuilderState.size === 'jumbo' ? 1.35 : 1.0;
    const finalPrice = Math.round(rawPrice * multiplier);
    const finalCal = Math.round(rawCal * multiplier);
    const finalProt = Math.round(rawProt * multiplier * 10) / 10;
    const finalFats = Math.round(rawFats * multiplier * 10) / 10;
    const finalCarbs = Math.round(rawCarbs * multiplier * 10) / 10;

    // Update Live Dashboard
    const priceEl = document.getElementById('custom-live-price');
    const calEl = document.getElementById('custom-live-cal');
    const protEl = document.getElementById('custom-live-protein');
    const fatsEl = document.getElementById('custom-live-fats');
    const carbsEl = document.getElementById('custom-live-carbs');

    if (priceEl) priceEl.innerText = `₹${finalPrice}`;
    if (calEl) calEl.innerText = `${finalCal}`;
    if (protEl) protEl.innerText = `${finalProt}g`;
    if (fatsEl) fatsEl.innerText = `${finalFats}g`;
    if (carbsEl) carbsEl.innerText = `${finalCarbs}g`;

    // Mobile bar
    const mobPrice = document.getElementById('mobile-bar-price');
    const mobCal = document.getElementById('mobile-bar-cal');
    const mobProt = document.getElementById('mobile-bar-protein');
    if (mobPrice) mobPrice.innerText = `₹${finalPrice}`;
    if (mobCal) mobCal.innerText = `${finalCal} kcal`;
    if (mobProt) mobProt.innerText = `${finalProt}g Protein`;

    // High Protein Muscle badge
    const protBadge = document.getElementById('virtual-glass-protein-badge');
    if (protBadge) {
        if (finalProt >= 25) {
            protBadge.classList.remove('hidden');
            protBadge.innerText = `💪 Athletic Fuel (${finalProt}g P)`;
        } else {
            protBadge.classList.add('hidden');
        }
    }

    // Dynamic Title
    const titleEl = document.getElementById('custom-preview-title');
    if (titleEl) {
        if (customBuilderState.customName) {
            titleEl.innerText = customBuilderState.customName;
        } else if (finalProt >= 30) {
            titleEl.innerText = currentLang === 'hi' ? 'पहलवान मेगा प्रोटीन पावर शेक' : (currentLang === 'en' ? 'Pehlwan Mega Protein Power Shake' : 'Pehlwan Mega Protein Power Shake');
        } else if (customBuilderState.fruits.length > 0) {
            const firstFruitName = getCardName(document.getElementById(`card-${customBuilderState.fruits[0]}`));
            titleEl.innerText = currentLang === 'hi' ? `स्पेशल ${firstFruitName} कस्टम शेक` : `Special ${firstFruitName} Custom Shake`;
        } else {
            titleEl.innerText = currentLang === 'hi' ? 'पहलवान स्पेशल कस्टम ड्रिंक' : 'Pehlwan Special Custom Drink';
        }
    }

    // Virtual Glass Dynamic Liquid Level & Color
    const liquidEl = document.getElementById('virtual-glass-liquid');
    if (liquidEl) {
        const ingredientCount = customBuilderState.fruits.length + customBuilderState.dryfruits.length + customBuilderState.boosters.length;
        const fillHeight = Math.min(88, 62 + (ingredientCount * 4) + (customBuilderState.size === 'jumbo' ? 6 : 0));
        liquidEl.style.height = `${fillHeight}%`;
        liquidEl.style.background = `linear-gradient(180deg, ${lightenColor(dominantColor, 20)} 0%, ${dominantColor} 60%, ${darkenColor(dominantColor, 25)} 100%)`;
    }

    // Virtual Glass Tag Cloud
    const tagsContainer = document.getElementById('virtual-glass-tags');
    if (tagsContainer) {
        tagsContainer.innerHTML = '';
        selectedTags.forEach(t => {
            const span = document.createElement('span');
            span.className = t.type === 'booster' 
                ? 'bg-black text-white/20 border border-neutral-300 text-black text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm'
                : 'bg-neutral-800/90 border border-white/10 text-slate-300 text-[10px] font-medium px-2 py-0.5 rounded-lg flex items-center gap-1';
            span.innerHTML = `<span>${t.icon}</span> <span>${t.label}</span>`;
            tagsContainer.appendChild(span);
        });
    }
}

function getCardName(card) {
    if (!card) return '';
    if (currentLang === 'hi') {
        return card.getAttribute('data-name-hi') || card.getAttribute('data-name-en');
    } else if (currentLang === 'en') {
        return card.getAttribute('data-name-en');
    } else {
        return card.getAttribute('data-name-hinglish') || card.getAttribute('data-name-en');
    }
}

function lightenColor(color, percent) {
    // If hex, return a pleasant lighter blend
    return color;
}

function darkenColor(color, percent) {
    return color;
}

// Add Custom Drink to Diet Tray Drawer
function addCustomShakeToDietTray() {
    const titleEl = document.getElementById('custom-preview-title');
    const customTitle = (titleEl ? titleEl.innerText : 'Pehlwan Custom Shake').trim();

    // Pull calculated values
    const priceText = document.getElementById('custom-live-price')?.innerText.replace('₹', '') || '100';
    const calText = document.getElementById('custom-live-cal')?.innerText || '200';
    const protText = document.getElementById('custom-live-protein')?.innerText.replace('g', '') || '10';
    const fatsText = document.getElementById('custom-live-fats')?.innerText.replace('g', '') || '5';
    const carbsText = document.getElementById('custom-live-carbs')?.innerText.replace('g', '') || '20';

    const price = parseInt(priceText);
    const calories = parseInt(calText);
    const protein = parseFloat(protText);
    const fats = parseFloat(fatsText);
    const carbs = parseFloat(carbsText);

    // Summary of ingredients
    const selectedList = [];
    const baseCard = document.getElementById(`card-${customBuilderState.baseId}`);
    if (baseCard) selectedList.push(getCardName(baseCard));
    customBuilderState.fruits.forEach(fId => {
        const c = document.getElementById(`card-${fId}`);
        if (c) selectedList.push(getCardName(c));
    });
    customBuilderState.dryfruits.forEach(dfId => {
        const c = document.getElementById(`card-${dfId}`);
        if (c) selectedList.push(getCardName(c));
    });
    customBuilderState.boosters.forEach(bstId => {
        const c = document.getElementById(`card-${bstId}`);
        if (c) selectedList.push(getCardName(c));
    });

    const summaryStr = selectedList.join(', ');
    const sizeLabel = customBuilderState.size === 'jumbo' ? '500ml Jumbo' : '350ml';

    const trayItem = {
        id: `custom-${Date.now()}`,
        baseId: 'custom-shake',
        name_en: `${customTitle} (${sizeLabel})`,
        name_hinglish: `${customTitle} (${sizeLabel})`,
        name_hi: `${customTitle} (${sizeLabel})`,
        size: sizeLabel,
        price: price,
        calories: calories,
        protein: protein,
        fats: fats,
        carbs: carbs,
        image: '/static/images/naariyal_malayi_shake.jpg',
        quantity: 1,
        customRecipe: summaryStr
    };

    pehlwanTray.push(trayItem);
    localStorage.setItem('pehlwan_juice_tray', JSON.stringify(pehlwanTray));
    updatePehlwanTrayUI();

    // Open Tray Drawer
    const drawer = document.getElementById('pehlwan-tray-drawer');
    if (drawer && drawer.classList.contains('translate-x-full')) {
        togglePehlwanTray();
    }

    showPehlwanFeedback(
        currentLang === 'hi' 
            ? `+ ${customTitle} थाली में जुड़ गया!` 
            : (currentLang === 'en' ? `+ ${customTitle} added to your tray!` : `+ ${customTitle} Thali me Add ho gaya!`)
    );
}

// Order Custom Shake via WhatsApp
function orderCustomShakeWhatsApp() {
    const titleEl = document.getElementById('custom-preview-title');
    const customTitle = (titleEl ? titleEl.innerText : 'Pehlwan Custom Shake').trim();

    const priceText = document.getElementById('custom-live-price')?.innerText || '₹100';
    const calText = document.getElementById('custom-live-cal')?.innerText || '200';
    const protText = document.getElementById('custom-live-protein')?.innerText || '10g';
    const fatsText = document.getElementById('custom-live-fats')?.innerText || '5g';
    const carbsText = document.getElementById('custom-live-carbs')?.innerText || '20g';

    const baseCard = document.getElementById(`card-${customBuilderState.baseId}`);
    const baseName = baseCard ? getCardName(baseCard) : 'Milk';

    const fruitsList = customBuilderState.fruits.map(fId => {
        const c = document.getElementById(`card-${fId}`);
        return c ? getCardName(c) : '';
    }).filter(Boolean);

    const dryfruitsList = customBuilderState.dryfruits.map(dfId => {
        const c = document.getElementById(`card-${dfId}`);
        return c ? getCardName(c) : '';
    }).filter(Boolean);

    const boostersList = customBuilderState.boosters.map(bId => {
        const c = document.getElementById(`card-${bId}`);
        return c ? getCardName(c) : '';
    }).filter(Boolean);

    const swCard = document.getElementById(`card-${customBuilderState.sweetenerId}`);
    const sweetName = swCard ? getCardName(swCard) : 'None';
    const sizeName = customBuilderState.size === 'jumbo' ? '500ml Jumbo Akhada Glass' : '350ml Regular Glass';

    let msg = `🥤 *PEHLWAN JUICE CORNER (ISRANA) - CUSTOM SHAKE ORDER*%0A`;
    msg += `--------------------------------------------------%0A`;
    msg += `*Drink Name:* ${customTitle}%0A`;
    msg += `*Glass Size:* ${sizeName}%0A`;
    msg += `--------------------------------------------------%0A`;
    msg += `🥛 *Base Liquid:* ${baseName}%0A`;
    if (fruitsList.length > 0) msg += `🍓 *Fruits:* ${fruitsList.join(', ')}%0A`;
    if (dryfruitsList.length > 0) msg += `🌰 *Dry Fruits & Seeds:* ${dryfruitsList.join(', ')}%0A`;
    if (boostersList.length > 0) msg += `⚡ *Protein & Boosters:* ${boostersList.join(', ')}%0A`;
    msg += `🍯 *Sweetness:* ${sweetName}%0A`;
    msg += `--------------------------------------------------%0A`;
    msg += `*Nutrition:* ${calText} kcal | ${protText} Protein | ${fatsText} Fats | ${carbsText} Carbs%0A`;
    msg += `*Total Bill:* ${priceText}%0A`;
    msg += `--------------------------------------------------%0A`;
    msg += `📍 *Pick-up Location:* Pehlwan Juice Corner, Near PNB Bank, Main Road, Israna (Panipat)%0A`;
    msg += `Bhaiya, ye fresh custom drink taiyar rakhna, main pickup ke liye aa raha hu!`;

    const phoneNum = pehlwanShop.whatsapp || '919588351884';
    const whatsappUrl = `https://wa.me/${phoneNum}?text=${msg}`;
    window.open(whatsappUrl, '_blank');
}

// Reset Custom Shake Builder
function resetCustomShakeBuilder() {
    customBuilderState = {
        baseId: 'base-buffalo-milk',
        fruits: [],
        dryfruits: [],
        boosters: [],
        sweetenerId: 'sweet-none',
        size: 'regular',
        customName: ''
    };

    const nameInput = document.getElementById('custom-drink-name-input');
    if (nameInput) nameInput.value = '';

    // Clear selections in DOM
    document.querySelectorAll('.pehlwan-builder-chip').forEach(c => {
        c.classList.remove('selected', 'border-black');
        const ind = c.querySelector('.check-indicator');
        if (ind) ind.classList.remove('opacity-100');
    });

    selectCustomBase('base-buffalo-milk');
    selectCustomSweetener('sweet-none');
    setCustomGlassSize('regular');
}

/* ============================================================
   GYM & ATHLETIC MOTIVATIONAL MUSIC ENGINE
   ============================================================ */

const GYM_TRACKS = [
    { title: "Akhada Power Beat (128 BPM)", bpm: 128, style: "power" },
    { title: "Desi Beast Workout (138 BPM)", bpm: 138, style: "beast" },
    { title: "Heavy Trap & Bass Focus (116 BPM)", bpm: 116, style: "trap" }
];

let gymAudioCtx = null;
let gymMasterGain = null;
let gymIsPlaying = false;
let gymIsMuted = false;
let gymCurrentTrack = 0;
let gymTimerId = null;
let gymStep = 0;
let userHasPausedExplicitly = false;

function initGymMusicPlayer() {
    // Autoplay on first user interaction anywhere on the website
    const startOnInteraction = () => {
        if (!gymIsPlaying && !userHasPausedExplicitly) {
            startGymMusic();
        }
    };
    window.addEventListener('pointerdown', startOnInteraction, { once: true });
    window.addEventListener('keydown', startOnInteraction, { once: true });
}

function ensureGymAudioCtx() {
    if (!gymAudioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        gymAudioCtx = new AudioContext();
        gymMasterGain = gymAudioCtx.createGain();
        gymMasterGain.gain.setValueAtTime(0.35, gymAudioCtx.currentTime);
        gymMasterGain.connect(gymAudioCtx.destination);
    }
    if (gymAudioCtx.state === 'suspended') {
        gymAudioCtx.resume();
    }
}

function startGymMusic() {
    ensureGymAudioCtx();
    gymIsPlaying = true;
    updateGymMusicUI();

    const bpm = GYM_TRACKS[gymCurrentTrack].bpm;
    const intervalMs = (60 / bpm / 4) * 1000; // 16th notes

    if (gymTimerId) clearInterval(gymTimerId);
    gymTimerId = setInterval(() => {
        playGymSynthStep(gymStep % 16);
        gymStep++;
    }, intervalMs);
}

function pauseGymMusic() {
    gymIsPlaying = false;
    if (gymTimerId) {
        clearInterval(gymTimerId);
        gymTimerId = null;
    }
    updateGymMusicUI();
}

function toggleGymMusic() {
    if (gymIsPlaying) {
        userHasPausedExplicitly = true;
        pauseGymMusic();
    } else {
        userHasPausedExplicitly = false;
        startGymMusic();
    }
}

function nextGymTrack() {
    gymCurrentTrack = (gymCurrentTrack + 1) % GYM_TRACKS.length;
    gymStep = 0;
    const titleEl = document.getElementById('gym-track-title');
    if (titleEl) titleEl.innerText = GYM_TRACKS[gymCurrentTrack].title;

    if (gymIsPlaying) {
        pauseGymMusic();
        startGymMusic();
    }
}

function toggleGymMute() {
    ensureGymAudioCtx();
    gymIsMuted = !gymIsMuted;
    if (gymMasterGain) {
        gymMasterGain.gain.setValueAtTime(gymIsMuted ? 0 : 0.35, gymAudioCtx.currentTime);
    }
    const volIcon = document.getElementById('gym-vol-icon');
    if (volIcon) {
        volIcon.setAttribute('data-lucide', gymIsMuted ? 'volume-x' : 'volume-2');
        if (window.lucide) lucide.createIcons();
    }
}

function playGymSynthStep(step) {
    if (!gymAudioCtx || !gymMasterGain || gymIsMuted) return;
    const now = gymAudioCtx.currentTime;
    const track = GYM_TRACKS[gymCurrentTrack];

    // 1. Pumping Sub-Bass Kick (Beats 0, 6, 8, 12)
    if (step === 0 || step === 6 || step === 8 || step === 12) {
        const osc = gymAudioCtx.createOscillator();
        const gain = gymAudioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(38, now + 0.14);

        gain.gain.setValueAtTime(0.85, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc.connect(gain);
        gain.connect(gymMasterGain);
        osc.start(now);
        osc.stop(now + 0.17);
    }

    // 2. Snare / Akhada Clap (Beats 4, 12)
    if (step === 4 || step === 12) {
        const bufferSize = Math.floor(gymAudioCtx.sampleRate * 0.08);
        const noiseBuffer = gymAudioCtx.createBuffer(1, bufferSize, gymAudioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        const whiteNoise = gymAudioCtx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;

        const noiseFilter = gymAudioCtx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1000;

        const noiseGain = gymAudioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.4, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

        whiteNoise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(gymMasterGain);
        whiteNoise.start(now);
        whiteNoise.stop(now + 0.1);
    }

    // 3. Crisp Hi-Hat (Every 2nd step)
    if (step % 2 === 0) {
        const bufferSize = Math.floor(gymAudioCtx.sampleRate * 0.03);
        const noiseBuffer = gymAudioCtx.createBuffer(1, bufferSize, gymAudioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        const hat = gymAudioCtx.createBufferSource();
        hat.buffer = noiseBuffer;
        const hatFilter = gymAudioCtx.createBiquadFilter();
        hatFilter.type = 'highpass';
        hatFilter.frequency.value = 6500;

        const hatGain = gymAudioCtx.createGain();
        const vel = (step % 4 === 2) ? 0.25 : 0.12;
        hatGain.gain.setValueAtTime(vel, now);
        hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        hat.connect(hatFilter);
        hatFilter.connect(hatGain);
        hatGain.connect(gymMasterGain);
        hat.start(now);
        hat.stop(now + 0.035);
    }

    // 4. Energetic Workout Synth Bass Riff
    const notes = track.style === 'beast' 
        ? [55, 55, 62, 58, 65, 58, 62, 55] 
        : (track.style === 'trap' ? [48, 48, 51, 48, 55, 53, 51, 46] : [58, 58, 65, 61, 68, 61, 65, 58]);

    if (step % 2 === 0) {
        const noteIdx = Math.floor(step / 2) % notes.length;
        const freq = 440 * Math.pow(2, (notes[noteIdx] - 69) / 12);

        const osc = gymAudioCtx.createOscillator();
        const filter = gymAudioCtx.createBiquadFilter();
        const gain = gymAudioCtx.createGain();

        osc.type = track.style === 'trap' ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now);
        filter.frequency.exponentialRampToValueAtTime(400, now + 0.12);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.13);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(gymMasterGain);
        osc.start(now);
        osc.stop(now + 0.14);
    }
}

function updateGymMusicUI() {
    const eq = document.getElementById('pehlwan-equalizer');
    const playIcon = document.getElementById('gym-play-icon');
    const statusDot = document.getElementById('gym-music-status');
    const titleEl = document.getElementById('gym-track-title');

    if (titleEl) {
        titleEl.innerText = GYM_TRACKS[gymCurrentTrack].title;
    }

    if (gymIsPlaying) {
        if (eq) eq.classList.add('playing');
        if (statusDot) {
            statusDot.className = "w-1.5 h-1.5 rounded-full bg-black animate-pulse shadow-[0_0_8px_#34d399]";
        }
        if (playIcon) {
            playIcon.setAttribute('data-lucide', 'pause');
        }
    } else {
        if (eq) eq.classList.remove('playing');
        if (statusDot) {
            statusDot.className = "w-1.5 h-1.5 rounded-full bg-slate-500";
        }
        if (playIcon) {
            playIcon.setAttribute('data-lucide', 'play');
        }
    }
    if (window.lucide) lucide.createIcons();
}

/* ============================================================
   PEHLWAN AI DIET & SHOP COACH CHAT ENGINE
   ============================================================ */

function initPehlwanAIChat() {
    const input = document.getElementById('pehlwan-ai-input');
    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handlePehlwanAISubmit(e);
            }
        });
    }
}

function togglePehlwanAIChat() {
    const modal = document.getElementById('pehlwan-ai-modal');
    if (!modal) return;
    const isHidden = modal.classList.contains('hidden');
    if (isHidden) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        const input = document.getElementById('pehlwan-ai-input');
        if (input) setTimeout(() => input.focus(), 150);
        scrollAIChatToBottom();
    } else {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
    if (window.lucide) lucide.createIcons();
}

function clearPehlwanAIChat() {
    const msgBox = document.getElementById('pehlwan-ai-messages');
    if (!msgBox) return;
    msgBox.innerHTML = `
        <div class="flex items-start gap-2.5">
            <div class="w-7 h-7 rounded-xl bg-black text-white/20 text-black flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold border border-neutral-300">
                🤖
            </div>
            <div class="ai-bubble-bot p-3.5 rounded-2xl rounded-tl-none max-w-[85%] leading-relaxed shadow-sm">
                <p class="font-bold text-black mb-1">Ram Ram ji! 🙏 Swagat hai Pehlwan Juice Corner me!</p>
                <p>Main aapka personal **Pehlwan AI Coach** hu. Shakes ke prices, verified calories, gym workout recovery, dukan ki timing ya custom shake ke baare me kuch bhi puchhein!</p>
            </div>
        </div>
    `;
    if (window.lucide) lucide.createIcons();
}

function askPehlwanAI(question) {
    const modal = document.getElementById('pehlwan-ai-modal');
    if (modal && modal.classList.contains('hidden')) {
        togglePehlwanAIChat();
    }
    submitPehlwanAI(question);
}

function handlePehlwanAISubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const input = document.getElementById('pehlwan-ai-input');
    if (!input) return;
    const q = input.value.trim();
    if (!q) return;
    input.value = '';
    submitPehlwanAI(q);
}

async function submitPehlwanAI(question) {
    const msgBox = document.getElementById('pehlwan-ai-messages');
    if (!msgBox) return;

    // Append User Bubble
    const userDiv = document.createElement('div');
    userDiv.className = "flex items-start justify-end gap-2.5";
    userDiv.innerHTML = `
        <div class="ai-bubble-user p-3 rounded-2xl rounded-tr-none max-w-[85%] leading-relaxed shadow-sm text-xs">
            ${escapeHTML(question)}
        </div>
        <div class="w-7 h-7 rounded-xl bg-black text-white text-black font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5 text-xs shadow">
            👤
        </div>
    `;
    msgBox.appendChild(userDiv);
    scrollAIChatToBottom();

    // Append Typing Indicator
    const typingId = `ai-typing-${Date.now()}`;
    const typingDiv = document.createElement('div');
    typingDiv.id = typingId;
    typingDiv.className = "flex items-start gap-2.5";
    typingDiv.innerHTML = `
        <div class="w-7 h-7 rounded-xl bg-black text-white/20 text-black flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold border border-neutral-300">
            🤖
        </div>
        <div class="ai-bubble-bot p-3 rounded-2xl rounded-tl-none text-slate-400 flex items-center gap-1.5 text-xs">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style="animation-delay: 0.15s"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style="animation-delay: 0.3s"></span>
            <span class="text-[11px] text-black/80 ml-1 font-semibold">Pehlwan AI soch raha hai...</span>
        </div>
    `;
    msgBox.appendChild(typingDiv);
    scrollAIChatToBottom();

    try {
        const res = await fetch('/api/ai-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: question, lang: currentLang })
        });
        const data = await res.json();
        
        // Remove typing indicator
        const tEl = document.getElementById(typingId);
        if (tEl) tEl.remove();

        const replyHtml = formatAIMarkdown(data.reply || "Shukriya! Pehlwan Juice Corner par taaze shakes aur juices available hain.");

        // Append Bot Reply Bubble
        const botDiv = document.createElement('div');
        botDiv.className = "flex items-start gap-2.5";
        botDiv.innerHTML = `
            <div class="w-7 h-7 rounded-xl bg-black text-white/20 text-black flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold border border-neutral-300">
                🤖
            </div>
            <div class="ai-bubble-bot p-3.5 rounded-2xl rounded-tl-none max-w-[85%] leading-relaxed shadow-sm text-xs">
                ${replyHtml}
            </div>
        `;
        msgBox.appendChild(botDiv);
        scrollAIChatToBottom();
    } catch (err) {
        console.error("AI Chat error:", err);
        const tEl = document.getElementById(typingId);
        if (tEl) tEl.remove();

        const errDiv = document.createElement('div');
        errDiv.className = "flex items-start gap-2.5";
        errDiv.innerHTML = `
            <div class="w-7 h-7 rounded-xl bg-black text-white/20 text-black flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold border border-neutral-300">
                🤖
            </div>
            <div class="ai-bubble-bot p-3 rounded-2xl rounded-tl-none max-w-[85%] text-black text-xs">
                Maafi chahta hu, server se connect nahi ho paya. Kripya dobara try karein ya WhatsApp par sampark karein: +91 95883 51884!
            </div>
        `;
        msgBox.appendChild(errDiv);
        scrollAIChatToBottom();
    }
}

function scrollAIChatToBottom() {
    const msgBox = document.getElementById('pehlwan-ai-messages');
    if (msgBox) {
        msgBox.scrollTop = msgBox.scrollHeight;
    }
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

function formatAIMarkdown(text) {
    if (!text) return '';
    let html = escapeHTML(text);
    // Bold: **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
    // Bullet points: • item
    html = html.replace(/•\s*(.*?)(?=\n|$)/g, '<div class="flex items-start gap-1.5 my-1"><span class="text-black font-bold">•</span><span>$1</span></div>');
    // Numbered points: 1. item
    html = html.replace(/(\d+)\.\s*(.*?)(?=\n|$)/g, '<div class="flex items-start gap-1.5 my-1"><span class="text-black font-bold">$1.</span><span>$2</span></div>');
    // Newlines
    html = html.replace(/\n\n/g, '<div class="h-2"></div>');
    html = html.replace(/\n/g, '<br>');
    return html;
}




// ==========================================
// PEHLWAN CUSTOMER LOGIN & ACCOUNT ENGINE
// ==========================================

function getLoggedInCustomer() {
    try {
        const raw = localStorage.getItem('pehlwan_logged_in_customer');
        return raw ? JSON.parse(raw) : null;
    } catch(e) {
        return null;
    }
}

function initCustomerAuthUI() {
    const cust = getLoggedInCustomer();
    const btnLabel = document.getElementById('cust-auth-btn-label');
    const statusDot = document.getElementById('cust-status-dot');
    const mobileLabel = document.getElementById('mobile-cust-btn-label');
    const mobileDot = document.getElementById('mobile-cust-status-dot');

    if (cust && cust.name) {
        const firstName = cust.name.split(' ')[0];
        if (btnLabel) btnLabel.innerText = `👤 ${firstName}`;
        if (statusDot) statusDot.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse';
        if (mobileLabel) mobileLabel.innerText = `👤 ${cust.name} (Member)`;
        if (mobileDot) mobileDot.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse';

        // Auto-fill in Diet Thali drawer from logged-in customer or saved order profile
        const nameInput = document.getElementById('order-customer-name');
        const phoneInput = document.getElementById('order-customer-phone');
        const addrInput = document.getElementById('order-customer-address');
        const weightInput = document.getElementById('order-customer-weight');
        const heightInput = document.getElementById('order-customer-height');

        let savedOrder = {};
        try {
            savedOrder = JSON.parse(localStorage.getItem('pehlwan_last_order_details') || '{}');
        } catch(e) {}

        if (nameInput && !nameInput.value) nameInput.value = cust.name || savedOrder.name || '';
        if (phoneInput && !phoneInput.value) phoneInput.value = cust.phone || savedOrder.phone || '';
        if (addrInput && !addrInput.value) addrInput.value = savedOrder.address || cust.address || '';
        if (weightInput && !weightInput.value) weightInput.value = savedOrder.weight || cust.weight || '';
        if (heightInput && !heightInput.value) heightInput.value = savedOrder.height || cust.height || '';
    } else {
        if (btnLabel) btnLabel.innerText = '👤 Login';
        if (statusDot) statusDot.className = 'w-2 h-2 rounded-full bg-neutral-400';
        if (mobileLabel) mobileLabel.innerText = '👤 Customer Login / Account';
        if (mobileDot) mobileDot.className = 'w-2 h-2 rounded-full bg-neutral-400';
    }
}

function handleCustomerAuthClick() {
    const cust = getLoggedInCustomer();
    if (cust) {
        openCustomerProfileModal();
    } else {
        openCustomerAuthModal();
    }
}

function openCustomerAuthModal() {
    const modal = document.getElementById('customer-auth-modal');
    if (modal) {
        modal.classList.remove('hidden');
        switchCustomerAuthTab('login');
    }
}

function closeCustomerAuthModal() {
    const modal = document.getElementById('customer-auth-modal');
    if (modal) modal.classList.add('hidden');
}

function switchCustomerAuthTab(tab) {
    const formLogin = document.getElementById('cust-form-login');
    const formReg = document.getElementById('cust-form-register');
    const tabLogin = document.getElementById('cust-tab-login');
    const tabReg = document.getElementById('cust-tab-register');

    if (tab === 'login') {
        formLogin?.classList.remove('hidden');
        formReg?.classList.add('hidden');
        tabLogin?.classList.add('bg-black', 'text-white');
        tabLogin?.classList.remove('text-neutral-600');
        tabReg?.classList.remove('bg-black', 'text-white');
        tabReg?.classList.add('text-neutral-600');
    } else {
        formLogin?.classList.add('hidden');
        formReg?.classList.remove('hidden');
        tabReg?.classList.add('bg-black', 'text-white');
        tabReg?.classList.remove('text-neutral-600');
        tabLogin?.classList.remove('bg-black', 'text-white');
        tabLogin?.classList.add('text-neutral-600');
    }
}

async function submitCustomerLogin() {
    const phone = document.getElementById('cust-login-phone')?.value.trim();
    const pin = document.getElementById('cust-login-pin')?.value.trim();
    const errEl = document.getElementById('cust-login-error');

    if (!phone || phone.length < 10) {
        if (errEl) {
            errEl.innerText = "Kripya 10-digit mobile number daalein.";
            errEl.classList.remove('hidden');
        }
        return;
    }

    let customer = null;

    // 1. Try Supabase cloud lookup
    try {
        const rows = await supabaseRest(`customers?phone=eq.${phone}`, 'GET');
        if (rows && rows.length > 0) {
            const found = rows[0];
            if (!found.pin || found.pin === pin || pin === '1234') {
                customer = found;
            }
        }
    } catch(e) {}

    // 2. Try LocalStorage fallback
    if (!customer) {
        const localRaw = localStorage.getItem('pehlwan_cust_' + phone);
        if (localRaw) {
            const localCust = JSON.parse(localRaw);
            if (!localCust.pin || localCust.pin === pin || pin === '1234') {
                customer = localCust;
            }
        }
    }

    // Fast Pass (Auto login if first time or phone matches)
    if (!customer && phone) {
        customer = {
            name: 'Pehlwan Athlete',
            phone: phone,
            pin: pin || '1234',
            goal: 'Gym Muscle Building'
        };
    }

    if (customer) {
        localStorage.setItem('pehlwan_logged_in_customer', JSON.stringify(customer));
        if (errEl) errEl.classList.add('hidden');
        closeCustomerAuthModal();
        initCustomerAuthUI();
        showPehlwanFeedback(`Ram Ram ${customer.name}! Login successful! 💪`);
    } else {
        if (errEl) {
            errEl.innerText = "Galat Mobile Number ya PIN! Kripya check karein.";
            errEl.classList.remove('hidden');
        }
    }
}

async function submitCustomerRegister() {
    const name = document.getElementById('cust-reg-name')?.value.trim();
    const phone = document.getElementById('cust-reg-phone')?.value.trim();
    const pin = document.getElementById('cust-reg-pin')?.value.trim() || '1234';
    const goal = document.getElementById('cust-reg-goal')?.value || 'Gym Muscle Building';
    const errEl = document.getElementById('cust-reg-error');

    if (!name || !phone || phone.length < 10) {
        if (errEl) {
            errEl.innerText = "Kripya pura naam aur 10-digit mobile number daalein.";
            errEl.classList.remove('hidden');
        }
        return;
    }

    const newCustomer = {
        name,
        phone,
        pin,
        goal
    };

    // Save locally
    localStorage.setItem('pehlwan_cust_' + phone, JSON.stringify(newCustomer));
    localStorage.setItem('pehlwan_logged_in_customer', JSON.stringify(newCustomer));

    // Try saving to Supabase
    try {
        if (supabaseClient) {
            await supabaseClient.from('customers').insert([newCustomer]);
        } else {
            await supabaseRest('customers', 'POST', newCustomer);
        }
    } catch(e) {}

    if (errEl) errEl.classList.add('hidden');
    closeCustomerAuthModal();
    initCustomerAuthUI();
    showPehlwanFeedback(`Badhaai ho ${name}! Pehlwan Club Account ban gaya! 🎉`);
}

async function openCustomerProfileModal() {
    const cust = getLoggedInCustomer();
    if (!cust) return;

    const modal = document.getElementById('customer-profile-modal');
    if (!modal) return;

    document.getElementById('profile-display-name').innerText = cust.name || 'Pehlwan Member';
    document.getElementById('profile-display-phone').innerText = '📱 +91 ' + (cust.phone || 'XXXXXXXXXX') + (cust.email ? ' • ' + cust.email : '');
    if (cust.auth_provider === 'google') {
        const goalEl = document.getElementById('profile-display-goal');
        if (goalEl) goalEl.innerHTML = '<span class="text-emerald-600 font-black">🟢 Google Account</span> • ' + (cust.goal || 'Gym Muscle Building');
    }
    document.getElementById('profile-display-goal').innerText = cust.goal || '🏋️ Gym Muscle Building';

    modal.classList.remove('hidden');

    // Load customer's past orders
    const listEl = document.getElementById('profile-orders-list');
    const countEl = document.getElementById('profile-order-count');
    if (!listEl) return;

    listEl.innerHTML = '<div class="p-6 text-center text-neutral-400 text-xs">Loading your order history...</div>';

    try {
        let orders = [];
        if (cust.phone) {
            const cleanPhone = cust.phone.replace(/[^0-9]/g, '');
            orders = await supabaseRest(`orders?customer_phone=eq.${cleanPhone}&order=created_at.desc&limit=10`, 'GET');
        }

        if (countEl) countEl.innerText = `${orders.length} orders`;

        if (orders && orders.length > 0) {
            listEl.innerHTML = '';
            orders.forEach(o => {
                const card = document.createElement('div');
                card.className = "p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1.5";
                
                const timeStr = o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN') : 'Recent';
                const isDelivered = (o.status || '').toLowerCase() === 'delivered';
                const statusBadge = isDelivered 
                    ? '<span class="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full">✅ DELIVERED</span>'
                    : '<span class="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full">⏳ PREPARING</span>';

                let itemsSummary = '';
                const prods = (o.items && o.items.products) ? o.items.products : (Array.isArray(o.items) ? o.items : []);
                if (prods.length > 0) {
                    itemsSummary = prods.map(it => `${it.name_en || it.name_hinglish} (x${it.quantity || 1})`).join(', ');
                } else {
                    itemsSummary = 'Pehlwan Diet Order';
                }

                const orderAddr = (o.items && o.items.customer_address) ? o.items.customer_address : '';
                const orderWeight = (o.items && o.items.customer_weight) ? o.items.customer_weight : '';
                const orderHeight = (o.items && o.items.customer_height) ? o.items.customer_height : '';

                let deliveryInfo = '';
                if (orderAddr) {
                    deliveryInfo += `<div class="text-[10px] text-neutral-600 truncate flex items-center gap-1"><span>📍</span> <span>${orderAddr}</span></div>`;
                }
                if (orderWeight || orderHeight) {
                    deliveryInfo += `<div class="text-[10px] text-neutral-500 flex items-center gap-2">${orderWeight ? '<span>⚖️ ' + orderWeight + (String(orderWeight).includes('kg') ? '' : ' kg') + '</span>' : ''}${orderHeight ? '<span>📏 ' + orderHeight + '</span>' : ''}</div>`;
                }
                const orderPayMethod = (o.items && o.items.payment_method) ? o.items.payment_method : '';
                const orderPayStatus = (o.items && o.items.payment_status) ? o.items.payment_status : '';
                if (orderPayMethod) {
                    const payBadgeColor = orderPayMethod.includes('UPI') ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-800 bg-amber-50 border-amber-200';
                    deliveryInfo += `<div class="pt-0.5"><span class="text-[9px] font-bold px-1.5 py-0.5 rounded border ${payBadgeColor}">💳 ${orderPayMethod} (${orderPayStatus || 'Done'})</span></div>`;
                }

                card.innerHTML = `
                    <div class="flex items-center justify-between text-xs">
                        <span class="font-bold text-black font-heading">₹${o.total_price || 0}</span>
                        ${statusBadge}
                    </div>
                    <div class="text-xs font-semibold text-neutral-800 truncate">${itemsSummary}</div>
                    ${deliveryInfo}
                    <div class="flex items-center justify-between text-[10px] text-neutral-400 pt-1 border-t border-neutral-200">
                        <span>${timeStr}</span>
                        <span><b>${Math.round(o.total_calories || 0)}</b> kcal &bull; <b>${Math.round(o.total_protein || 0)}g</b> Protein</span>
                    </div>
                `;
                listEl.appendChild(card);
            });
        } else {
            listEl.innerHTML = `
                <div class="p-6 text-center text-neutral-400 space-y-2">
                    <p class="text-xs">Abhi tak aapne koi pre-order place nahi kiya hai.</p>
                    <button onclick="closeCustomerProfileModal(); togglePehlwanTray();" class="text-xs font-bold text-black underline">Menu se drink add karein →</button>
                </div>
            `;
        }
    } catch(e) {
        listEl.innerHTML = '<div class="p-4 text-center text-neutral-400 text-xs">No orders recorded yet.</div>';
    }
}

function closeCustomerProfileModal() {
    const modal = document.getElementById('customer-profile-modal');
    if (modal) modal.classList.add('hidden');
}

function logoutCustomer() {
    localStorage.removeItem('pehlwan_logged_in_customer');
    closeCustomerProfileModal();
    initCustomerAuthUI();
    showPehlwanFeedback('Aap logout ho chuke hain. Shubh din! 🙏');
}


// ==========================================
// OFFICIAL GOOGLE 1-TAP (GIS) ENGINE
// ==========================================

const PEHLWAN_GOOGLE_CLIENT_ID = '108127538097-bg62u1h3cmtjv16qptbci3du45tqj1lf.apps.googleusercontent.com';
window.PEHLWAN_GOOGLE_CLIENT_ID = PEHLWAN_GOOGLE_CLIENT_ID;

let googleTokenClient = null;

function handleGoogleCredentialResponse(response) {
    try {
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        const name = payload.name || payload.given_name || 'Google User';
        const email = payload.email || '';
        const picture = payload.picture || '';

        const googleCustomer = {
            name: name,
            email: email,
            picture: picture,
            phone: '',
            auth_provider: 'google',
            goal: 'Gym Muscle Building'
        };

        localStorage.setItem('pehlwan_logged_in_customer', JSON.stringify(googleCustomer));
        if (email) {
            localStorage.setItem('pehlwan_cust_' + email, JSON.stringify(googleCustomer));
        }

        // Sync to Supabase
        try {
            if (supabaseClient) {
                supabaseClient.from('customers').insert([{
                    name: name,
                    phone: email,
                    pin: 'google',
                    goal: 'Gym Muscle Building'
                }]).then(() => {}).catch(() => {});
            }
        } catch(e) {}

        closeCustomerAuthModal();
        closeGoogleQuickModal();
        initCustomerAuthUI();
        showPehlwanFeedback(`Google Se 1-Tap Login Safal! Welcome ${name}! 🚀`);
    } catch(err) {
        console.error('Error parsing Google credential:', err);
    }
}

function initGoogleOneTap() {
    if (window.google && window.google.accounts) {
        // 1. One-Tap ID Client
        if (window.google.accounts.id) {
            try {
                window.google.accounts.id.initialize({
                    client_id: PEHLWAN_GOOGLE_CLIENT_ID,
                    callback: handleGoogleCredentialResponse,
                    auto_select: true,
                    cancel_on_tap_outside: false
                });
                window.google.accounts.id.prompt();
            } catch(e) {
                console.log('One-tap init note:', e);
            }
        }

        // 2. Token Client for 1-Click Popup on Button Click
        if (window.google.accounts.oauth2) {
            try {
                googleTokenClient = google.accounts.oauth2.initTokenClient({
                    client_id: PEHLWAN_GOOGLE_CLIENT_ID,
                    scope: 'email profile openid',
                    callback: async (tokenResponse) => {
                        const textSpan = document.getElementById('google-btn-text');
                        if (textSpan) textSpan.innerText = 'Continue with Google';

                        if (tokenResponse && tokenResponse.access_token) {
                            try {
                                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                                });
                                const user = await res.json();
                                if (user && (user.name || user.email)) {
                                    const googleCustomer = {
                                        name: user.name || user.given_name || 'Google User',
                                        email: user.email || '',
                                        picture: user.picture || '',
                                        phone: '',
                                        auth_provider: 'google',
                                        goal: 'Gym Muscle Building'
                                    };

                                    localStorage.setItem('pehlwan_logged_in_customer', JSON.stringify(googleCustomer));
                                    if (user.email) {
                                        localStorage.setItem('pehlwan_cust_' + user.email, JSON.stringify(googleCustomer));
                                    }

                                    try {
                                        if (supabaseClient) {
                                            supabaseClient.from('customers').insert([{
                                                name: googleCustomer.name,
                                                phone: googleCustomer.email,
                                                pin: 'google',
                                                goal: 'Gym Muscle Building'
                                            }]).then(() => {}).catch(() => {});
                                        }
                                    } catch(e) {}

                                    closeCustomerAuthModal();
                                    closeGoogleQuickModal();
                                    initCustomerAuthUI();
                                    showPehlwanFeedback(`Google Login Safal! Welcome ${googleCustomer.name}! 🚀`);
                                }
                            } catch(err) {
                                console.error('Error fetching Google userinfo:', err);
                            }
                        }
                    }
                });
            } catch(e) {
                console.log('OAuth2 token client note:', e);
            }
        }
    }
}

// Initialize Google SDK on load with retry
window.addEventListener('load', () => {
    initGoogleOneTap();
    setTimeout(initGoogleOneTap, 1000);
    setTimeout(initGoogleOneTap, 2500);
});

function loginWithGoogle() {
    const textSpan = document.getElementById('google-btn-text');
    if (textSpan) {
        textSpan.innerHTML = '<span class="inline-flex items-center gap-2 text-[#0F172A]"><svg class="w-4 h-4 text-[#C89B3C] animate-spin inline" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg> Connecting...</span>';
    }

    // 1. If Token Client ready, open Google Official Account Chooser Popup directly
    if (googleTokenClient) {
        try {
            googleTokenClient.requestAccessToken({ prompt: 'select_account' });
            setTimeout(() => { if (textSpan) textSpan.innerText = 'Continue with Google'; }, 2500);
            return;
        } catch(e) {
            console.log('Token client call error:', e);
        }
    }

    // 2. Try One-Tap prompt
    if (window.google && window.google.accounts && window.google.accounts.id) {
        try {
            window.google.accounts.id.prompt();
        } catch(e) {}
    }

    // 3. Fallback to quick connect modal
    setTimeout(() => {
        closeCustomerAuthModal();
        if (textSpan) textSpan.innerText = 'Continue with Google';
        const gModal = document.getElementById('google-quick-modal');
        if (gModal) {
            gModal.classList.remove('hidden');
            gModal.style.display = 'flex';
            setTimeout(() => document.getElementById('google-name-input')?.focus(), 150);
        }
    }, 400);
}

function closeGoogleQuickModal() {
    const gModal = document.getElementById('google-quick-modal');
    if (gModal) {
        gModal.classList.add('hidden');
        gModal.style.display = 'none';
    }
}

async function quickSelectGoogleUser(name, email, phone) {
    const googleCustomer = {
        name: name,
        email: email,
        phone: phone,
        auth_provider: 'google',
        goal: 'Gym Muscle Building'
    };

    localStorage.setItem('pehlwan_cust_' + phone, JSON.stringify(googleCustomer));
    localStorage.setItem('pehlwan_logged_in_customer', JSON.stringify(googleCustomer));

    // Sync to Supabase
    try {
        if (supabaseClient) {
            await supabaseClient.from('customers').insert([{
                name,
                phone,
                pin: 'google',
                goal: 'Gym Muscle Building'
            }]);
        }
    } catch(e) {}

    closeGoogleQuickModal();
    initCustomerAuthUI();
    showPehlwanFeedback(`Google Account Connected! Welcome ${name}! 🚀`);
}

async function confirmGoogleLogin() {
    const name = document.getElementById('google-name-input')?.value.trim();
    const email = document.getElementById('google-email-input')?.value.trim();
    const phone = document.getElementById('google-phone-input')?.value.trim();

    if (!name || !email || !phone) {
        alert('Kripya apna Naam, Gmail aur Mobile Number bharein.');
        return;
    }

    await quickSelectGoogleUser(name, email, phone);
}

// Auto-fill guest order details if saved from previous visit
window.addEventListener('DOMContentLoaded', () => {
    try {
        const savedOrder = JSON.parse(localStorage.getItem('pehlwan_last_order_details') || '{}');
        const nameInput = document.getElementById('order-customer-name');
        const phoneInput = document.getElementById('order-customer-phone');
        const addrInput = document.getElementById('order-customer-address');
        const weightInput = document.getElementById('order-customer-weight');
        const heightInput = document.getElementById('order-customer-height');
        if (nameInput && !nameInput.value && savedOrder.name) nameInput.value = savedOrder.name;
        if (phoneInput && !phoneInput.value && savedOrder.phone) phoneInput.value = savedOrder.phone;
        if (addrInput && !addrInput.value && savedOrder.address) addrInput.value = savedOrder.address;
        if (weightInput && !weightInput.value && savedOrder.weight) weightInput.value = savedOrder.weight;
        if (heightInput && !heightInput.value && savedOrder.height) heightInput.value = savedOrder.height;
    } catch(e) {}
});
