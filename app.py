from flask import Flask, render_template, jsonify, request
import json
import os

app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True

FEEDBACK_FILE = os.path.join(os.path.dirname(__file__), "data", "feedback.json")

def load_feedback():
    if os.path.exists(FEEDBACK_FILE):
        try:
            with open(FEEDBACK_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return []

def save_feedback(data):
    try:
        os.makedirs(os.path.dirname(FEEDBACK_FILE), exist_ok=True)
        with open(FEEDBACK_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print("Save feedback error:", e)

# Shop Information in 3 Languages: English, Hinglish, Hindi
SHOP_INFO = {
    "name_en": "Pehlwan Juice Corner",
    "name_hinglish": "Pehlwan Juice Corner",
    "name_hi": "पहलवान जूस कॉर्नर",
    "tagline_en": "Pure Nutrition & Athletic Power | 100% Fresh, Zero Adulteration",
    "tagline_hinglish": "Shuddhata aur Taakat ka Asli Adda | 100% Pure, No Milawat",
    "tagline_hi": "शुद्धता और ताकत का असली ठिकाना | 100% शुद्ध, बिना मिलावट",
    "location_en": "Near Punjab National Bank, Main Road, Israna (Panipat)",
    "location_hinglish": "Punjab National Bank ke paas, Main Road, Israna (Panipat)",
    "location_hi": "पंजाब नेशनल बैंक के पास, मेन रोड, इसराना (पानीपत)",
    "timing_en": "Daily 9:00 AM – 9:30 PM (365 Days Open)",
    "timing_hinglish": "Subah 9:00 AM se Raat 9:30 PM tak (Rozana Open)",
    "timing_hi": "सुबह 9:00 AM से रात 9:30 PM तक (365 दिन खुला)",
    "phone": "+91 95883 51884",
    "whatsapp": "919588351884"
}

# The EXACT 16 Items provided by user with multi-size pricing and verified nutrition
MENU_ITEMS = [
    # 1. MOOSMI JUICE
    {
        "id": "item-1",
        "name_en": "Fresh Moosmi Juice",
        "name_hinglish": "Taaza Moosmi Juice",
        "name_hi": "मौसंबी का शुद्ध जूस",
        "category": "juices",
        "cat_en": "Fresh Juices",
        "cat_hinglish": "Fresh Juices",
        "cat_hi": "ताजे शुद्ध जूस",
        "price": 50,
        "prices": [
            {"size": "Regular", "size_hi": "छोटा", "price": 50, "cal": 90, "protein": 1.8, "fats": 0.2, "carbs": 21.0},
            {"size": "Medium", "size_hi": "मध्यम", "price": 70, "cal": 130, "protein": 2.5, "fats": 0.3, "carbs": 30.0},
            {"size": "Large", "size_hi": "बड़ा", "price": 90, "cal": 170, "protein": 3.2, "fats": 0.4, "carbs": 40.0}
        ],
        "veg_type": "vegan",
        "calories": 90,
        "protein": 1.8,
        "fats": 0.2,
        "carbs": 21.0,
        "desc_en": "100% cold-pressed sweet lime. Zero added water, zero added sugar. High natural Vitamin C.",
        "desc_hinglish": "100% pure taaza nichoda hua Moosmi juice. Bina paani aur bina cheeni ke.",
        "desc_hi": "100% शुद्ध ताजा मौसंबी का रस। बिना पानी और बिना चीनी के, प्राकृतिक विटामिन-सी से भरपूर।",
        "image": "/static/images/moosmi_juice.jpg"
    },

    # 2. BEL PATTHER SHAKE
    {
        "id": "item-2",
        "name_en": "Bel Patther Shake (Wood Apple)",
        "name_hinglish": "Bel Patther Shake",
        "name_hi": "बेल पत्थर शेक",
        "category": "shakes",
        "cat_en": "Traditional Health Shakes",
        "cat_hinglish": "Traditional Shakes",
        "cat_hi": "स्वास्थ्यवर्धक शेक्स",
        "price": 70,
        "prices": [
            {"size": "Special", "size_hi": "स्पेशल", "price": 70, "cal": 210, "protein": 4.2, "fats": 3.5, "carbs": 42.0}
        ],
        "veg_type": "veg",
        "calories": 210,
        "protein": 4.2,
        "fats": 3.5,
        "carbs": 42.0,
        "desc_en": "Traditional Ayurvedic digestive tonic. Cools the internal system, cures acidity, and restores vitality.",
        "desc_hinglish": "Pet ki thandak aur digestion ke liye amrit. Bael fruit ka shuddh malai shake.",
        "desc_hi": "पेट की ठंडक और पाचन के लिए अमृत समान। बेल फल का गाढ़ा और शक्तिवर्धक शेक।",
        "image": "/static/images/bel_pather_shake.jpg"
    },

    # 3. ANANAS SHAKE
    {
        "id": "item-3",
        "name_en": "Fresh Ananas (Pineapple) Shake",
        "name_hinglish": "Ananas Shake (Pineapple)",
        "name_hi": "अनानास शेक (Pineapple)",
        "category": "shakes",
        "cat_en": "Fruit Shakes",
        "cat_hinglish": "Fruit Shakes",
        "cat_hi": "फ्रूट शेक्स",
        "price": 50,
        "prices": [
            {"size": "Regular", "size_hi": "छोटा", "price": 50, "cal": 190, "protein": 4.5, "fats": 3.8, "carbs": 35.0},
            {"size": "Medium", "size_hi": "मध्यम", "price": 70, "cal": 260, "protein": 6.2, "fats": 5.0, "carbs": 48.0},
            {"size": "Large", "size_hi": "बड़ा", "price": 90, "cal": 330, "protein": 7.8, "fats": 6.5, "carbs": 62.0}
        ],
        "veg_type": "veg",
        "calories": 190,
        "protein": 4.5,
        "fats": 3.8,
        "carbs": 35.0,
        "desc_en": "Golden ripe pineapple blended with chilled creamy milk. Contains natural bromelain enzyme.",
        "desc_hinglish": "Pake ananas aur thande doodh ka refreshing shake. Fat cutter aur digestive.",
        "desc_hi": "पके अनानास और ठंडे मलाईदार दूध का स्वादिष्ट शेक। शरीर की सूजन घटाने में मददगार।",
        "image": "/static/images/ananas_shake.jpg"
    },

    # 4. MANGO SHAKE
    {
        "id": "item-4",
        "name_en": "Royal Mango Shake",
        "name_hinglish": "Royal Mango Shake",
        "name_hi": "मैंगो शेक (आम का शेक)",
        "category": "shakes",
        "cat_en": "Fruit Shakes",
        "cat_hinglish": "Fruit Shakes",
        "cat_hi": "फ्रूट शेक्स",
        "price": 50,
        "prices": [
            {"size": "Regular", "size_hi": "छोटा", "price": 50, "cal": 240, "protein": 5.2, "fats": 4.5, "carbs": 46.0},
            {"size": "Medium", "size_hi": "मध्यम", "price": 70, "cal": 320, "protein": 7.0, "fats": 6.0, "carbs": 62.0},
            {"size": "Large", "size_hi": "बड़ा", "price": 90, "cal": 410, "protein": 9.0, "fats": 7.5, "carbs": 78.0}
        ],
        "veg_type": "veg",
        "calories": 240,
        "protein": 5.2,
        "fats": 4.5,
        "carbs": 46.0,
        "desc_en": "Pure sweet mango pulp whipped with fresh dairy milk and crushed nuts. The undisputed king of shakes.",
        "desc_hinglish": "Taaze meethe aam ka gaadha malai shake. Har ghoont me lajawaab swaad.",
        "desc_hi": "ताजा मीठे आम के गूदे और मलाईदार दूध का गाढ़ा शेक। स्वाद और ताजगी का राजा।",
        "image": "/static/images/mango_shake.jpg"
    },

    # 5. BANANA SHAKE
    {
        "id": "item-5",
        "name_en": "Athletic Banana Shake",
        "name_hinglish": "Banana Shake (Kela Shake)",
        "name_hi": "बनाना शेक (केला शेक)",
        "category": "shakes",
        "cat_en": "Fruit Shakes",
        "cat_hinglish": "Fruit Shakes",
        "cat_hi": "फ्रूट शेक्स",
        "price": 50,
        "prices": [
            {"size": "Regular", "size_hi": "छोटा", "price": 50, "cal": 260, "protein": 6.5, "fats": 5.0, "carbs": 49.0},
            {"size": "Medium", "size_hi": "मध्यम", "price": 70, "cal": 350, "protein": 9.0, "fats": 7.0, "carbs": 66.0},
            {"size": "Large", "size_hi": "बड़ा", "price": 90, "cal": 440, "protein": 11.5, "fats": 9.0, "carbs": 82.0}
        ],
        "veg_type": "veg",
        "calories": 260,
        "protein": 6.5,
        "fats": 5.0,
        "carbs": 49.0,
        "desc_en": "Fresh ripe bananas blended in wholesome milk. Rich in potassium, energy carbs, and muscle fueling electrolytes.",
        "desc_hinglish": "Pake kele aur shuddh doodh ka tagda shake. Gym lifters aur athletes ki pehli pasand.",
        "desc_hi": "पके केले और ताजा दूध का गाढ़ा शेक। जिम वर्कआउट और वजन व ताकत बढ़ाने हेतु उत्तम।",
        "image": "/static/images/banana_shake.jpg"
    },

    # 6. CHIKU SHAKE
    {
        "id": "item-6",
        "name_en": "Chiku (Sapodilla) Energy Shake",
        "name_hinglish": "Chiku Shake",
        "name_hi": "चीकू शेक",
        "category": "shakes",
        "cat_en": "Fruit Shakes",
        "cat_hinglish": "Fruit Shakes",
        "cat_hi": "फ्रूट शेक्स",
        "price": 50,
        "prices": [
            {"size": "Regular", "size_hi": "छोटा", "price": 50, "cal": 230, "protein": 4.8, "fats": 4.2, "carbs": 44.0},
            {"size": "Medium", "size_hi": "मध्यम", "price": 70, "cal": 310, "protein": 6.5, "fats": 5.8, "carbs": 58.0},
            {"size": "Large", "size_hi": "बड़ा", "price": 90, "cal": 390, "protein": 8.2, "fats": 7.5, "carbs": 74.0}
        ],
        "veg_type": "veg",
        "calories": 230,
        "protein": 4.8,
        "fats": 4.2,
        "carbs": 44.0,
        "desc_en": "Naturally sweet sapodilla pulp with dense dairy milk. Delivers natural fructose and dietary fiber without crashes.",
        "desc_hinglish": "Meethe chiku aur doodh ka natural shake. Natural energy booster.",
        "desc_hi": "मीठे चीकू और ताजे दूध का नेचुरल शेक। तुरंत और देर तक टिकने वाली ताकत देता है।",
        "image": "/static/images/chiku_shake.jpg"
    },

    # 7. CHIKU AUR PAPAYA SHAKE
    {
        "id": "item-7",
        "name_en": "Chiku & Papaya Dual Shake",
        "name_hinglish": "Chiku aur Papaya Shake",
        "name_hi": "चीकू और पपीता शेक",
        "category": "shakes",
        "cat_en": "Fruit Shakes",
        "cat_hinglish": "Fruit Shakes",
        "cat_hi": "फ्रूट शेक्स",
        "price": 50,
        "prices": [
            {"size": "Regular", "size_hi": "छोटा", "price": 50, "cal": 210, "protein": 5.0, "fats": 3.8, "carbs": 40.0},
            {"size": "Medium", "size_hi": "मध्यम", "price": 70, "cal": 290, "protein": 6.8, "fats": 5.2, "carbs": 54.0},
            {"size": "Large", "size_hi": "बड़ा", "price": 90, "cal": 370, "protein": 8.5, "fats": 6.8, "carbs": 68.0}
        ],
        "veg_type": "veg",
        "calories": 210,
        "protein": 5.0,
        "fats": 3.8,
        "carbs": 40.0,
        "desc_en": "Harmonious blend of sweet chiku and soothing papaya. Combines high natural energy with smooth papain digestion.",
        "desc_hinglish": "Chiku ki mithaas aur papite ka digestion power. Dual fruit hit.",
        "desc_hi": "चीकू की प्राकृतिक मिठास और पपीते की पाचक शक्ति का बेजोड़ संगम। पेट के लिए हल्का।",
        "image": "/static/images/chiku_papaya_shake.jpg"
    },

    # 8. STOBERRY SHAKE
    {
        "id": "item-8",
        "name_en": "Wild Strawberry Shake",
        "name_hinglish": "Strawberry Shake",
        "name_hi": "स्ट्रॉबेरी शेक",
        "category": "shakes",
        "cat_en": "Berry Shakes",
        "cat_hinglish": "Berry Shakes",
        "cat_hi": "बेरी शेक्स",
        "price": 50,
        "prices": [
            {"size": "Regular", "size_hi": "छोटा", "price": 50, "cal": 180, "protein": 4.5, "fats": 4.0, "carbs": 32.0},
            {"size": "Medium", "size_hi": "मध्यम", "price": 80, "cal": 270, "protein": 6.5, "fats": 5.8, "carbs": 48.0},
            {"size": "Large", "size_hi": "बड़ा", "price": 100, "cal": 360, "protein": 8.5, "fats": 7.5, "carbs": 64.0}
        ],
        "veg_type": "veg",
        "calories": 180,
        "protein": 4.5,
        "fats": 4.0,
        "carbs": 32.0,
        "desc_en": "Fresh ripe strawberries with creamy milk. Abundant in polyphenols, antioxidants, and pure berry aroma.",
        "desc_hinglish": "Fresh laal strawberries aur malai doodh ka tasty berry shake.",
        "desc_hi": "ताजी रसीली स्ट्रॉबेरी और मलाईदार दूध का शेक। एंटीऑक्सीडेंट्स और ताजगी से भरपूर।",
        "image": "/static/images/strawberry_shake.jpg"
    },

    # 9. DATE SHAKE (KHAJOOR)
    {
        "id": "item-9",
        "name_en": "Arabian Date (Khajoor) Shake",
        "name_hinglish": "Date Shake (Khajoor Shake)",
        "name_hi": "खजूर शेक (Date Shake)",
        "category": "shakes",
        "cat_en": "Power Shakes",
        "cat_hinglish": "Power Shakes",
        "cat_hi": "ताकतवर शेक्स",
        "price": 50,
        "prices": [
            {"size": "Regular", "size_hi": "छोटा", "price": 50, "cal": 280, "protein": 7.0, "fats": 4.5, "carbs": 54.0},
            {"size": "Medium", "size_hi": "मध्यम", "price": 80, "cal": 390, "protein": 9.5, "fats": 6.2, "carbs": 74.0},
            {"size": "Large", "size_hi": "बड़ा", "price": 100, "cal": 490, "protein": 12.0, "fats": 8.0, "carbs": 92.0}
        ],
        "veg_type": "veg",
        "calories": 280,
        "protein": 7.0,
        "fats": 4.5,
        "carbs": 54.0,
        "desc_en": "Premium soft Arabian dates blended smooth. High in natural iron, zero refined white sugar. Pure organic strength.",
        "desc_hinglish": "Soft Arabian khajoor aur gaadha doodh. Iron aur energy ka asli source, no white sugar.",
        "desc_hi": "प्रीमियम अरेबियन खजूर और गाढ़े दूध का शेक। प्राकृतिक आयरन से भरपूर, बिना सफेद चीनी के।",
        "image": "/static/images/date_shake.jpg"
    },

    # 10. OREO SHAKE
    {
        "id": "item-10",
        "name_en": "Oreo Cookies & Cream Shake",
        "name_hinglish": "Oreo Shake",
        "name_hi": "ओरियो शेक (Oreo Shake)",
        "category": "shakes",
        "cat_en": "Indulgence Shakes",
        "cat_hinglish": "Indulgence Shakes",
        "cat_hi": "स्पेशल शेक्स",
        "price": 50,
        "prices": [
            {"size": "Regular", "size_hi": "छोटा", "price": 50, "cal": 340, "protein": 6.2, "fats": 12.0, "carbs": 52.0},
            {"size": "Medium", "size_hi": "मध्यम", "price": 80, "cal": 480, "protein": 8.5, "fats": 17.0, "carbs": 74.0},
            {"size": "Large", "size_hi": "बड़ा", "price": 100, "cal": 620, "protein": 11.0, "fats": 22.0, "carbs": 95.0}
        ],
        "veg_type": "veg",
        "calories": 340,
        "protein": 6.2,
        "fats": 12.0,
        "carbs": 52.0,
        "desc_en": "Crunchy chocolate Oreo cookies whipped with thick chilled milk and cocoa. Rich, satisfying chocolate treat.",
        "desc_hinglish": "Crispy Oreo biscuits aur chocolate milk ka thick creamy shake.",
        "desc_hi": "क्रंची ओरियो बिस्कुट और ठंडे गाढ़े दूध का क्रीमी चॉकलेट शेक। युवाओं का पसंदीदा।",
        "image": "/static/images/oreo_shake.jpg"
    },

    # 11. BEEJ DANA (NATURAL DRINK)
    {
        "id": "item-11",
        "name_en": "Beej Dana (Natural Herbal Drink)",
        "name_hinglish": "Beej Dana (Natural Drink)",
        "name_hi": "बीज दाना (नेचुरल ड्रिंक)",
        "category": "juices",
        "cat_en": "Traditional Tonics",
        "cat_hinglish": "Traditional Tonics",
        "cat_hi": "पारंपरिक देसी ड्रिंक्स",
        "price": 100,
        "prices": [
            {"size": "Special", "size_hi": "स्पेशल", "price": 100, "cal": 120, "protein": 3.5, "fats": 1.2, "carbs": 24.0}
        ],
        "veg_type": "vegan",
        "calories": 120,
        "protein": 3.5,
        "fats": 1.2,
        "carbs": 24.0,
        "desc_en": "Traditional natural seed elixir. High soluble fiber and ancient cooling herbs for intense heat protection and stamina.",
        "desc_hinglish": "Pehlwano ki purani cooling drink. Shareer ki garmi dur kare aur stamina boost kare.",
        "desc_hi": "पहलवानों की पारंपरिक ठंडक देने वाली नेचुरल ड्रिंक। शरीर की गर्मी शांत करे और स्टैमिना बढ़ाए।",
        "image": "/static/images/beej_dana.jpg"
    },

    # 12. BADAM RAGDA
    {
        "id": "item-12",
        "name_en": "Pehlwan Special Badam Ragda",
        "name_hinglish": "Pehlwan Badam Ragda",
        "name_hi": "पहलवान स्पेशल बादाम रगड़ा",
        "category": "shakes",
        "cat_en": "Traditional Health Shakes",
        "cat_hinglish": "Traditional Shakes",
        "cat_hi": "स्वास्थ्यवर्धक शेक्स",
        "price": 100,
        "prices": [
            {"size": "Pehlwan Glass", "size_hi": "पहलवान ग्लास", "price": 100, "cal": 380, "protein": 14.5, "fats": 18.0, "carbs": 42.0}
        ],
        "veg_type": "veg",
        "calories": 380,
        "protein": 14.5,
        "fats": 18.0,
        "carbs": 42.0,
        "desc_en": "Stone-ground desi badam, saffron, black pepper, cardamom and rich full-cream milk made in traditional kundi-sota. Legendary akhada warrior drink.",
        "desc_hinglish": "Kundi-sote se ghutai karke taiyar shuddh badam, kesar, kali mirch aur doodh. Asli akhada taakat.",
        "desc_hi": "कुंडी-सोटे से घुटाई करके तैयार शुद्ध बादाम, केसर, काली मिर्च और गाढ़ा दूध। अखाड़े के पहलवानों का असली पेय।",
        "image": "/static/images/badam_ragda_kundi_sota.jpg"
    },

    # 13. LICHI SHAKE
    {
        "id": "item-13",
        "name_en": "Fresh Lichi Shake",
        "name_hinglish": "Lichi Shake",
        "name_hi": "लीची शेक (Lichi Shake)",
        "category": "shakes",
        "cat_en": "Fruit Shakes",
        "cat_hinglish": "Fruit Shakes",
        "cat_hi": "फ्रूट शेक्स",
        "price": 50,
        "prices": [
            {"size": "Regular", "size_hi": "छोटा", "price": 50, "cal": 195, "protein": 4.0, "fats": 3.5, "carbs": 38.0},
            {"size": "Medium", "size_hi": "मध्यम", "price": 80, "cal": 285, "protein": 5.8, "fats": 5.2, "carbs": 56.0},
            {"size": "Large", "size_hi": "बड़ा", "price": 100, "cal": 380, "protein": 7.5, "fats": 7.0, "carbs": 74.0}
        ],
        "veg_type": "veg",
        "calories": 195,
        "protein": 4.0,
        "fats": 3.5,
        "carbs": 38.0,
        "desc_en": "Fragrant seasonal lychee fruit blended silky smooth. Crisp, tropical aroma and abundant natural Vitamin C.",
        "desc_hinglish": "Taazi raseeli lichi aur thande doodh ka soothing exotic shake.",
        "desc_hi": "ताजी रसीली लीची और ठंडे दूध का लाजवाब शेक। प्राकृतिक ताजगी और खुशबू से भरपूर।",
        "image": "/static/images/lichi_shake.jpg"
    },

    # 14. NAARIYAL MALAYI SHAKE
    {
        "id": "item-14",
        "name_en": "Naariyal Malayi Shake (Tender Coconut)",
        "name_hinglish": "Naariyal Malayi Shake",
        "name_hi": "नारियल मलाई शेक (Tender Coconut)",
        "category": "shakes",
        "cat_en": "Luxury Superfood",
        "cat_hinglish": "Luxury Superfood",
        "cat_hi": "लग्जरी सुपरफूड शेक्स",
        "price": 150,
        "prices": [
            {"size": "Pure Malai", "size_hi": "प्योर मलाई", "price": 150, "cal": 310, "protein": 5.5, "fats": 16.0, "carbs": 36.0}
        ],
        "veg_type": "veg",
        "calories": 310,
        "protein": 5.5,
        "fats": 16.0,
        "carbs": 36.0,
        "desc_en": "Fresh tender coconut cream (malai) blended with sweet coconut water and milk. Rich in healthy MCT medium-chain fats.",
        "desc_hinglish": "Taaze daab ki soft malai aur coconut water ka ultra-luxury creamy shake.",
        "desc_hi": "ताजे नारियल की मलाई और नारियल पानी का अल्ट्रा-लग्जरी गाढ़ा शेक। हेल्दी फैट्स से भरपूर।",
        "image": "/static/images/naariyal_malayi_shake.jpg"
    },

    # 15. AVOCADO SHAKE
    {
        "id": "item-15",
        "name_en": "Hass Avocado Super-Shake",
        "name_hinglish": "Avocado Shake (Butter Fruit)",
        "name_hi": "एवोकाडो शेक (बटर फ्रूट)",
        "category": "shakes",
        "cat_en": "Luxury Superfood",
        "cat_hinglish": "Luxury Superfood",
        "cat_hi": "लग्जरी सुपरफूड शेक्स",
        "price": 180,
        "prices": [
            {"size": "Regular", "size_hi": "रेगुलर", "price": 180, "cal": 360, "protein": 6.5, "fats": 22.0, "carbs": 35.0},
            {"size": "Jumbo Luxury", "size_hi": "जंबो लग्जरी", "price": 300, "cal": 580, "protein": 11.0, "fats": 36.0, "carbs": 58.0}
        ],
        "veg_type": "veg",
        "calories": 360,
        "protein": 6.5,
        "fats": 22.0,
        "carbs": 35.0,
        "desc_en": "Imported ripe Hass avocado blended velvety smooth with organic honey and milk. World-class heart healthy monounsaturated fats.",
        "desc_hinglish": "Fresh Hass avocado, organic honey aur doodh ka rich creamy superfood shake.",
        "desc_hi": "ताजा हास एवोकाडो, शहद और दूध का सुपरफूड शेक। दुनिया का सबसे हेल्दी और न्यूट्रिशस शेक।",
        "image": "/static/images/avocado_shake.jpg"
    },

    # 16. GRILL SANDWICH
    {
        "id": "item-16",
        "name_en": "Pehlwan Special Grill Sandwich",
        "name_hinglish": "Pehlwan Grill Sandwich",
        "name_hi": "पहलवान स्पेशल ग्रिल्ड सैंडविच",
        "category": "sandwiches",
        "cat_en": "Grilled Sandwiches",
        "cat_hinglish": "Grilled Sandwiches",
        "cat_hi": "ताजा ग्रिल्ड सैंडविच",
        "price": 100,
        "prices": [
            {"size": "Loaded", "size_hi": "लोडेड स्पेशल", "price": 100, "cal": 380, "protein": 18.0, "fats": 14.0, "carbs": 45.0}
        ],
        "veg_type": "veg",
        "calories": 380,
        "protein": 18.0,
        "fats": 14.0,
        "carbs": 45.0,
        "desc_en": "Loaded with 100g fresh dairy paneer, sweet corn, bell peppers, melted cheese and mint glaze, grilled golden crispy.",
        "desc_hinglish": "100g fresh paneer, cheese, shimla mirch aur pudina chutney se bhara crispy grilled sandwich.",
        "desc_hi": "100 ग्राम ताजा पनीर, चीज, शिमला मिर्च और पुदीने की तीखी चटनी से भरा क्रिस्पी ग्रिल्ड सैंडविच।",
        "image": "/static/images/grill_sandwich.jpg"
    },

    # 17. COLD COFFEE
    {
        "id": "item-17",
        "name_en": "Classic Chilled Cold Coffee",
        "name_hinglish": "Cold Coffee (Chilled)",
        "name_hi": "कोल्ड कॉफी (Cold Coffee)",
        "category": "shakes",
        "cat_en": "Chilled Beverages",
        "cat_hinglish": "Chilled Beverages",
        "cat_hi": "कोल्ड कॉफी व शेक्स",
        "price": 100,
        "prices": [
            {"size": "Tall Glass", "size_hi": "टॉल ग्लास", "price": 100, "cal": 240, "protein": 6.5, "fats": 7.0, "carbs": 38.0}
        ],
        "veg_type": "veg",
        "calories": 240,
        "protein": 6.5,
        "fats": 7.0,
        "carbs": 38.0,
        "desc_en": "Bold slow-brewed espresso whipped with thick chilled dairy milk, chocolate swirl and velvety froth. The ultimate energizing refresher.",
        "desc_hinglish": "Kadak espresso coffee aur thande gaadhe doodh ka rich creamy cold coffee shake.",
        "desc_hi": "गाढ़े ठंडे दूध और ताजा ब्रू की गई कॉफी का क्रीमी व एनर्जेटिक शेक। ताजगी और ऊर्जा से भरपूर।",
        "image": "/static/images/cold_coffee.jpg"
    }
]

# Luxury Combos with User's Exact Items
COMBOS = [
    {
        "id": "combo-1",
        "name_en": "Desi Pehlwan Warrior Power Stack",
        "name_hinglish": "Pehlwan Badam Ragda & Grill Sandwich Combo",
        "name_hi": "पहलवान बादाम रगड़ा व ग्रिल्ड सैंडविच कॉम्बो",
        "price": 200,
        "calories": 760,
        "protein": 32.5,
        "fats": 32.0,
        "carbs": 87.0,
        "items_en": "Badam Ragda (₹100) + Pehlwan Grill Sandwich (₹100)",
        "items_hinglish": "Badam Ragda (₹100) + Pehlwan Grill Sandwich (₹100)",
        "items_hi": "बादाम रगड़ा (₹100) + पहलवान ग्रिल्ड सैंडविच (₹100)",
        "benefit_en": "Complete 32.5g protein and natural nut power for heavy training recovery.",
        "benefit_hinglish": "Pura 32.5g protein aur badam ki taakat workout ke baad ke liye.",
        "benefit_hi": "पूरे 32.5 ग्राम प्रोटीन और बादाम की शक्ति वर्कआउट के बाद मसल रिकवरी के लिए।"
    },
    {
        "id": "combo-2",
        "name_en": "Superfood Luxury Vitality Stack",
        "name_hinglish": "Avocado Shake & Grill Sandwich Stack",
        "name_hi": "एवोकाडो शेक व ग्रिल्ड सैंडविच कॉम्बो",
        "price": 280,
        "calories": 740,
        "protein": 24.5,
        "fats": 36.0,
        "carbs": 80.0,
        "items_en": "Avocado Shake (₹180) + Pehlwan Grill Sandwich (₹100)",
        "items_hinglish": "Avocado Shake (₹180) + Pehlwan Grill Sandwich (₹100)",
        "items_hi": "एवोकाडो शेक (₹180) + पहलवान ग्रिल्ड सैंडविच (₹100)",
        "benefit_en": "Clean monounsaturated omega fats and high protein for sustained athletic endurance.",
        "benefit_hinglish": "World-class healthy fats aur high protein ka luxury combo.",
        "benefit_hi": "विश्वस्तरीय हेल्दी फैट्स और हाई प्रोटीन का लग्जरी पौष्टिक कॉम्बो।"
    },
    {
        "id": "combo-3",
        "name_en": "Ayurvedic Gut Health & Cooling Stack",
        "name_hinglish": "Beej Dana Natural Drink & Bel Patther Shake",
        "name_hi": "बीज दाना नेचुरल ड्रिंक व बेल पत्थर शेक",
        "price": 170,
        "calories": 330,
        "protein": 7.7,
        "fats": 4.7,
        "carbs": 66.0,
        "items_en": "Beej Dana Natural Drink (₹100) + Bel Patther Shake (₹70)",
        "items_hinglish": "Beej Dana Drink (₹100) + Bel Patther Shake (₹70)",
        "items_hi": "बीज दाना नेचुरल ड्रिंक (₹100) + बेल पत्थर शेक (₹70)",
        "benefit_en": "Ancient cooling elixir that heals digestive track and prevents dehydration.",
        "benefit_hinglish": "Pet ki garmi khatam karne aur cooling hydration ke liye best.",
        "benefit_hi": "पेट की गर्मी शांत करने और पाचन तंत्र को दुरुस्त रखने का सबसे असरदार देसी तोड़।"
    }
]

# Custom Shake & Juice Builder Ingredients
CUSTOM_BASES = [
    {
        "id": "base-buffalo-milk",
        "name_en": "Desi Buffalo Full Cream Milk",
        "name_hinglish": "Desi Bhains ka Gaadha Doodh",
        "name_hi": "देसी भैंस का गाढ़ा फुल क्रीम दूध",
        "price": 35,
        "cal": 160,
        "protein": 8.0,
        "fats": 9.0,
        "carbs": 12.0,
        "color": "#FFFBEB",
        "icon": "🥛",
        "badge": "High Protein & Energy"
    },
    {
        "id": "base-cow-milk",
        "name_en": "Pure Cow Toned Milk",
        "name_hinglish": "Shuddh Gaay ka Toned Doodh",
        "name_hi": "शुद्ध गाय का टोंड दूध",
        "price": 25,
        "cal": 110,
        "protein": 6.0,
        "fats": 3.0,
        "carbs": 10.0,
        "color": "#FEF3C7",
        "icon": "🥛",
        "badge": "Light & Lean"
    },
    {
        "id": "base-coconut-water",
        "name_en": "Fresh Tender Coconut Water",
        "name_hinglish": "Taaza Nariyal Paani",
        "name_hi": "ताज़ा नारियल पानी",
        "price": 40,
        "cal": 45,
        "protein": 1.5,
        "fats": 0.2,
        "carbs": 9.0,
        "color": "#ECFDF5",
        "icon": "🥥",
        "badge": "Electrolytes"
    },
    {
        "id": "base-coconut-malai",
        "name_en": "Tender Coconut Malai Puree",
        "name_hinglish": "Taazi Nariyal Malai Puree",
        "name_hi": "ताज़ा नारियल मलाई बेस",
        "price": 60,
        "cal": 180,
        "protein": 3.0,
        "fats": 14.0,
        "carbs": 11.0,
        "color": "#F8FAFC",
        "icon": "🥥",
        "badge": "Ultra Velvety"
    },
    {
        "id": "base-mosambi-juice",
        "name_en": "Cold-Pressed Mosambi Juice",
        "name_hinglish": "Taaza Mosambi Juice Base",
        "name_hi": "मौसंबी का शुद्ध ताज़ा रस",
        "price": 40,
        "cal": 80,
        "protein": 1.5,
        "fats": 0.2,
        "carbs": 18.0,
        "color": "#FEF08A",
        "icon": "🍊",
        "badge": "Pure Citrus"
    },
    {
        "id": "base-ice-water",
        "name_en": "Chilled Mineral Ice & Water",
        "name_hinglish": "Chilled Ice & Mineral Water",
        "name_hi": "चिल्ड बर्फ व मिनरल वाटर",
        "price": 15,
        "cal": 0,
        "protein": 0.0,
        "fats": 0.0,
        "carbs": 0.0,
        "color": "#E0F2FE",
        "icon": "🧊",
        "badge": "Zero Calorie"
    }
]

CUSTOM_FRUITS = [
    {
        "id": "fruit-banana",
        "name_en": "Fresh Ripe Banana",
        "name_hinglish": "Taaza Kela (Banana)",
        "name_hi": "ताज़ा पका केला",
        "price": 15,
        "cal": 105,
        "protein": 1.3,
        "fats": 0.3,
        "carbs": 27.0,
        "icon": "🍌",
        "color": "#FDE047"
    },
    {
        "id": "fruit-mango",
        "name_en": "Royal Alphonso Mango Pulp",
        "name_hinglish": "Shuddh Aam ka Pulp",
        "name_hi": "शाही आम का गूदा",
        "price": 30,
        "cal": 110,
        "protein": 1.0,
        "fats": 0.4,
        "carbs": 28.0,
        "icon": "🥭",
        "color": "#F59E0B"
    },
    {
        "id": "fruit-strawberry",
        "name_en": "Fresh Wild Strawberry",
        "name_hinglish": "Taazi Strawberry",
        "name_hi": "ताज़ी स्ट्रॉबेरी",
        "price": 35,
        "cal": 50,
        "protein": 1.0,
        "fats": 0.3,
        "carbs": 12.0,
        "icon": "🍓",
        "color": "#F43F5E"
    },
    {
        "id": "fruit-chikoo",
        "name_en": "Sweet Chikoo (Sapodilla)",
        "name_hinglish": "Meetha Taaza Chiku",
        "name_hi": "मीठा ताज़ा चीकू",
        "price": 20,
        "cal": 90,
        "protein": 0.8,
        "fats": 0.4,
        "carbs": 22.0,
        "icon": "🥔",
        "color": "#B45309"
    },
    {
        "id": "fruit-papaya",
        "name_en": "Ripe Sweet Papaya",
        "name_hinglish": "Paka Papita (Papaya)",
        "name_hi": "मीठा पपीता",
        "price": 20,
        "cal": 60,
        "protein": 0.9,
        "fats": 0.2,
        "carbs": 15.0,
        "icon": "🍑",
        "color": "#FB923C"
    },
    {
        "id": "fruit-pineapple",
        "name_en": "Golden Juicy Ananas",
        "name_hinglish": "Juicy Ananas (Pineapple)",
        "name_hi": "रसीला अनन्नास",
        "price": 25,
        "cal": 75,
        "protein": 0.8,
        "fats": 0.2,
        "carbs": 19.0,
        "icon": "🍍",
        "color": "#FACC15"
    },
    {
        "id": "fruit-dates",
        "name_en": "Arabian Medjool Dates",
        "name_hinglish": "Arabian Khajoor (Dates)",
        "name_hi": "अरबियन शाही खजूर",
        "price": 30,
        "cal": 130,
        "protein": 1.2,
        "fats": 0.3,
        "carbs": 33.0,
        "icon": "🌴",
        "color": "#78350F"
    },
    {
        "id": "fruit-avocado",
        "name_en": "Hass Avocado Superfood",
        "name_hinglish": "Hass Avocado Superfood",
        "name_hi": "हैस एवोकाडो सुपरफूड",
        "price": 60,
        "cal": 160,
        "protein": 2.0,
        "fats": 15.0,
        "carbs": 9.0,
        "icon": "🥑",
        "color": "#84CC16"
    },
    {
        "id": "fruit-lychee",
        "name_en": "Sweet Fresh Lichi",
        "name_hinglish": "Meethi Taaza Lichi",
        "name_hi": "मीठी ताज़ी लीची",
        "price": 30,
        "cal": 70,
        "protein": 0.9,
        "fats": 0.2,
        "carbs": 17.0,
        "icon": "🍒",
        "color": "#FDA4AF"
    },
    {
        "id": "fruit-bael",
        "name_en": "Ayurvedic Bel Patther Pulp",
        "name_hinglish": "Bel Pather Pulp",
        "name_hi": "आयुर्वेदिक बेल पत्थर का गूदा",
        "price": 25,
        "cal": 120,
        "protein": 1.8,
        "fats": 0.3,
        "carbs": 30.0,
        "icon": "🍈",
        "color": "#D97706"
    }
]

CUSTOM_DRYFRUITS = [
    {
        "id": "df-badam",
        "name_en": "Pehlwan Crushed Badam",
        "name_hinglish": "Pehlwan Silbatta Badam",
        "name_hi": "पहलवान कुटे बादाम",
        "price": 25,
        "cal": 110,
        "protein": 4.0,
        "fats": 9.5,
        "carbs": 4.0,
        "icon": "🌰",
        "badge": "Strength"
    },
    {
        "id": "df-kaju",
        "name_en": "Crunchy Cashews (Kaju)",
        "name_hinglish": "Crunchy Kaju Tukda",
        "name_hi": "क्रंची काजू टुकड़ा",
        "price": 25,
        "cal": 100,
        "protein": 3.0,
        "fats": 8.0,
        "carbs": 5.0,
        "icon": "🥜",
        "badge": "Rich Taste"
    },
    {
        "id": "df-pista",
        "name_en": "Royal Pistachios (Pista)",
        "name_hinglish": "Shahi Pista Slivers",
        "name_hi": "शाही पिस्ता कतरन",
        "price": 25,
        "cal": 90,
        "protein": 3.2,
        "fats": 7.5,
        "carbs": 4.5,
        "icon": "🟢",
        "badge": "Royal"
    },
    {
        "id": "df-beejdana",
        "name_en": "Beej Dana (Sabja Seeds)",
        "name_hinglish": "Beej Dana (Sabja Seeds)",
        "name_hi": "बीज दाना (तुलसी/सब्जा बीज)",
        "price": 15,
        "cal": 35,
        "protein": 1.5,
        "fats": 2.0,
        "carbs": 4.0,
        "icon": "⚫",
        "badge": "Cooling"
    },
    {
        "id": "df-akhrot",
        "name_en": "Crushed Walnuts (Akhrot)",
        "name_hinglish": "Akhrot Giri (Walnuts)",
        "name_hi": "अखरोट गिरी",
        "price": 30,
        "cal": 120,
        "protein": 2.8,
        "fats": 11.5,
        "carbs": 2.5,
        "icon": "🧠",
        "badge": "Omega-3"
    },
    {
        "id": "df-kishmish",
        "name_en": "Desi Golden Raisins",
        "name_hinglish": "Meethi Kishmish",
        "name_hi": "देसी मीठी किशमिश",
        "price": 15,
        "cal": 60,
        "protein": 0.6,
        "fats": 0.1,
        "carbs": 15.0,
        "icon": "🍇",
        "badge": "Natural Energy"
    },
    {
        "id": "df-chia",
        "name_en": "Chia Seeds Superfood",
        "name_hinglish": "Chia Seeds Superfood",
        "name_hi": "चिया सीड्स सुपरफूड",
        "price": 20,
        "cal": 50,
        "protein": 2.0,
        "fats": 3.0,
        "carbs": 4.0,
        "icon": "⚪",
        "badge": "High Fiber"
    }
]

CUSTOM_BOOSTERS = [
    {
        "id": "boost-whey",
        "name_en": "Pure Whey Protein Scoop",
        "name_hinglish": "1 Scoop Whey Protein (24g P)",
        "name_hi": "व्हे प्रोटीन स्कूप (+24g प्रोटीन)",
        "price": 50,
        "cal": 120,
        "protein": 24.0,
        "fats": 1.0,
        "carbs": 2.0,
        "icon": "⚡",
        "badge": "+24g Protein"
    },
    {
        "id": "boost-gond",
        "name_en": "Desi Gond Katira",
        "name_hinglish": "Pehlwan Gond Katira",
        "name_hi": "पहलवान गोंद कतीरा (शीतलता)",
        "price": 20,
        "cal": 30,
        "protein": 0.5,
        "fats": 0.1,
        "carbs": 7.0,
        "icon": "❄️",
        "badge": "Ayurvedic Cooling"
    },
    {
        "id": "boost-kesar",
        "name_en": "Shuddh Kashmiri Kesar",
        "name_hinglish": "Asli Kesar Strands",
        "name_hi": "शुद्ध कश्मीरी केसर",
        "price": 30,
        "cal": 10,
        "protein": 0.2,
        "fats": 0.1,
        "carbs": 1.0,
        "icon": "🌸",
        "badge": "Royal Aroma"
    },
    {
        "id": "boost-peanutbutter",
        "name_en": "Crunchy Peanut Butter Scoop",
        "name_hinglish": "Peanut Butter Scoop",
        "name_hi": "पीनट बटर स्कूप",
        "price": 25,
        "cal": 130,
        "protein": 5.5,
        "fats": 10.5,
        "carbs": 4.5,
        "icon": "🥜",
        "badge": "Healthy Fats"
    },
    {
        "id": "boost-cocoa",
        "name_en": "Dark Belgian Cocoa Drizzle",
        "name_hinglish": "Rich Cocoa Shot",
        "name_hi": "डार्क कोको शॉट",
        "price": 20,
        "cal": 65,
        "protein": 1.0,
        "fats": 3.5,
        "carbs": 8.0,
        "icon": "🍫",
        "badge": "Antioxidants"
    },
    {
        "id": "boost-oreo",
        "name_en": "Crushed Oreo Cookie Crunch",
        "name_hinglish": "Oreo Biscuit Crunch",
        "name_hi": "ओरियो बिस्किट क्रंच",
        "price": 20,
        "cal": 85,
        "protein": 1.0,
        "fats": 3.5,
        "carbs": 12.0,
        "icon": "🍪",
        "badge": "Crispy Crunch"
    }
]

CUSTOM_SWEETENERS = [
    {
        "id": "sweet-none",
        "name_en": "No Added Sugar (100% Raw)",
        "name_hinglish": "Bina Cheeni (100% Pure)",
        "name_hi": "बिना चीनी (100% शुद्ध व नेचुरल)",
        "price": 0,
        "cal": 0,
        "carbs": 0.0,
        "icon": "🍃",
        "badge": "Zero Added Sugar"
    },
    {
        "id": "sweet-honey",
        "name_en": "Pure Organic Honey",
        "name_hinglish": "Shuddh Shahed (Honey)",
        "name_hi": "शुद्ध शहद",
        "price": 15,
        "cal": 50,
        "carbs": 13.0,
        "icon": "🍯",
        "badge": "Natural Immunity"
    },
    {
        "id": "sweet-khand",
        "name_en": "Desi Gur Shakkar / Khand",
        "name_hinglish": "Desi Gur Shakkar / Khand",
        "name_hi": "देसी गुड़ शक्कर / खांड",
        "price": 10,
        "cal": 45,
        "carbs": 11.0,
        "icon": "🌾",
        "badge": "Traditional"
    },
    {
        "id": "sweet-sugar",
        "name_en": "Light Cane Sugar",
        "name_hinglish": "Halki Cheeni",
        "name_hi": "हल्की चीनी",
        "price": 0,
        "cal": 35,
        "carbs": 9.0,
        "icon": "🍬",
        "badge": "Standard"
    }
]

@app.route("/")
def home():
    juices = [i for i in MENU_ITEMS if i["category"] == "juices"]
    shakes = [i for i in MENU_ITEMS if i["category"] == "shakes"]
    sandwiches = [i for i in MENU_ITEMS if i["category"] == "sandwiches"]
    feedbacks = load_feedback()
    return render_template("index.html", 
                           shop=SHOP_INFO, 
                           items=MENU_ITEMS, 
                           juices=juices, 
                           shakes=shakes, 
                           sandwiches=sandwiches,
                           combos=COMBOS,
                           feedbacks=feedbacks,
                           bases=CUSTOM_BASES,
                           fruits=CUSTOM_FRUITS,
                           dryfruits=CUSTOM_DRYFRUITS,
                           boosters=CUSTOM_BOOSTERS,
                           sweeteners=CUSTOM_SWEETENERS)

@app.route("/api/feedback", methods=["GET", "POST"])
def api_feedback():
    feedbacks = load_feedback()
    if request.method == "POST":
        data = request.get_json(silent=True) or {}
        name = data.get("name", "").strip() or "Regular Customer"
        role = data.get("role", "").strip() or "Local Customer"
        favorite = data.get("favorite", "").strip() or "Pehlwan Special Badam Ragda"
        rating = int(data.get("rating", 5))
        comment = data.get("comment", "").strip()
        if not comment:
            return jsonify({"success": False, "error": "Feedback message is required"}), 400

        new_entry = {
            "id": f"fb-{len(feedbacks) + 1}",
            "name": name,
            "role": role,
            "role_hi": role,
            "rating": rating,
            "favorite": favorite,
            "comment": comment,
            "date": "Just now"
        }
        feedbacks.insert(0, new_entry)
        save_feedback(feedbacks)
        return jsonify({"success": True, "feedback": new_entry, "feedbacks": feedbacks})
    return jsonify({"success": True, "feedbacks": feedbacks})

@app.route("/menu")
def menu():
    return render_template("menu.html", shop=SHOP_INFO, items=MENU_ITEMS, combos=COMBOS)

@app.route("/calculator")
def calculator():
    return render_template("calculator.html", shop=SHOP_INFO, items=MENU_ITEMS)

@app.route("/location")
def location():
    return render_template("location.html", shop=SHOP_INFO)

@app.route("/custom-shake")
def custom_shake():
    return render_template("custom_shake.html", 
                           shop=SHOP_INFO, 
                           bases=CUSTOM_BASES, 
                           fruits=CUSTOM_FRUITS, 
                           dryfruits=CUSTOM_DRYFRUITS, 
                           boosters=CUSTOM_BOOSTERS, 
                           sweeteners=CUSTOM_SWEETENERS)

@app.route("/api/custom-shake-data")
def api_custom_shake_data():
    return jsonify({
        "success": True,
        "bases": CUSTOM_BASES,
        "fruits": CUSTOM_FRUITS,
        "dryfruits": CUSTOM_DRYFRUITS,
        "boosters": CUSTOM_BOOSTERS,
        "sweeteners": CUSTOM_SWEETENERS
    })

@app.route("/api/menu")
def api_menu():
    return jsonify({"success": True, "shop": SHOP_INFO, "items": MENU_ITEMS, "combos": COMBOS})

@app.route("/api/calculate", methods=["POST"])
def api_calculate():
    data = request.get_json(silent=True) or {}
    weight = float(data.get("weight", 70))
    height = float(data.get("height", 172))
    age = int(data.get("age", 23))
    gender = data.get("gender", "male")
    goal = data.get("goal", "strength")

    if gender == "male":
        bmr = 10 * weight + 6.25 * height - 5 * age + 5
    else:
        bmr = 10 * weight + 6.25 * height - 5 * age - 161

    tdee = bmr * 1.55

    if goal == "fatloss":
        target_calories = round(tdee - 400)
        target_protein = round(weight * 2.0)
        target_fats = round((target_calories * 0.22) / 9)
        target_carbs = round((target_calories - (target_protein * 4 + target_fats * 9)) / 4)
        suggested_combo = COMBOS[2]
    elif goal == "mass":
        target_calories = round(tdee + 450)
        target_protein = round(weight * 2.2)
        target_fats = round((target_calories * 0.28) / 9)
        target_carbs = round((target_calories - (target_protein * 4 + target_fats * 9)) / 4)
        suggested_combo = COMBOS[0]
    else:
        target_calories = round(tdee)
        target_protein = round(weight * 1.8)
        target_fats = round((target_calories * 0.25) / 9)
        target_carbs = round((target_calories - (target_protein * 4 + target_fats * 9)) / 4)
        suggested_combo = COMBOS[1]

    return jsonify({
        "success": True,
        "bmr": round(bmr),
        "tdee": round(tdee),
        "target_calories": target_calories,
        "target_protein": target_protein,
        "target_fats": target_fats,
        "target_carbs": target_carbs,
        "suggested_combo": suggested_combo
    })

def get_pehlwan_ai_response(msg, lang="hinglish"):
    text = (msg or "").lower().strip()
    if not text:
        return "Ram Ram ji! 🙏 Pehlwan Juice Corner me aapka swagat hai! Drinks, nutrition, timings ya diet ke baare me kuch bhi puchhein."

    # 1. Timings & Working Hours
    if any(k in text for k in ["timing", "time", "samay", "kab khul", "kab tak", "open", "close", "band", "kitne baje", "hours"]):
        return (
            "⏰ **Pehlwan Juice Corner Timings:**\n\n"
            "• **Rozana Timing:** Subah 9:00 AM se Raat 9:30 PM tak\n"
            "• **Days Open:** Saal ke 365 din khuli rehti hai (No Holiday)!\n"
            "Aap subah kushti/workout ke baad ya shaam ko kisi bhi waqt taaza juice aur protein shake ke liye aa sakte hain."
        )

    # 2. Location & Address
    if any(k in text for k in ["location", "address", "kaha hai", "kaha par", "israna", "jagah", "rasta", "pnb", "map"]):
        return (
            "📍 **Pehlwan Juice Corner Location:**\n\n"
            "Hamari dukaan **Punjab National Bank (PNB) ke theek paas, Main Road, Israna (Panipat), Haryana** par hai.\n"
            "Aap website ke **'Location'** page par jakar direct Google Maps navigation open kar sakte hain!"
        )

    # 3. Contact & Phone & WhatsApp
    if any(k in text for k in ["phone", "call", "whatsapp", "number", "sampark", "contact"]):
        return (
            "📞 **Sampark Sutra (Contact Us):**\n\n"
            "• **Phone & WhatsApp:** +91 95883 51884\n"
            "Aap WhatsApp par message bhejkar apna order pre-order bhi kar sakte hain taki dukan par pahunchte hi order ready mile!"
        )

    # 4. Cold Coffee
    if "cold coffee" in text or "coffee" in text:
        return (
            "☕ **Classic Chilled Cold Coffee:**\n\n"
            "• **Price:** ₹100\n"
            "• **Nutrition:** 240 kcal | 6.5g Protein | 7.0g Fats | 38g Carbs\n"
            "• **Speciality:** Rich dark espresso, velvety thick cream froth, dark chocolate drizzle aur crushed ice ke sath chilled serve hoti hai!"
        )

    # 5. Badam Ragda (Signature Akhada Drink)
    if any(k in text for k in ["badam", "ragda", "almond", "sardai"]):
        return (
            "🥛 **Pehlwan Special Badam Ragda (Royal Sardai):**\n\n"
            "• **Price:** ₹100\n"
            "• **Nutrition:** 320 kcal | 8.5g Protein | 14g Healthy Fats\n"
            "• **Desi Recipe:** Asli pathar ke silbatte par peesa hua mamra badam, pista, kashmiri kesar aur elaichi. Kushti, gym aur athletic recovery ke liye no. 1 desi power drink!"
        )

    # 6. Grill Sandwich
    if any(k in text for k in ["sandwich", "sandwhich", "grill", "paneer"]):
        return (
            "🥪 **Pehlwan Special Grill Sandwich:**\n\n"
            "• **Price:** ₹100\n"
            "• **Nutrition:** 380 kcal | 14.0g Pure Protein | 15g Fats | 46g Carbs\n"
            "• **Filling:** 120g taaza shuddh dairy paneer, sweet corn, bell peppers aur desi hari chutney ke sath crispy golden brown grilled!"
        )

    # 7. Beej Dana (Natural Drink)
    if any(k in text for k in ["beej", "dana", "sabja", "chia", "seeds", "cooling"]):
        return (
            "🌿 **Beej Dana (Natural Ayurvedic Cooling Drink):**\n\n"
            "• **Price:** ₹100\n"
            "• **Nutrition:** 110 kcal | 2.5g Protein | 2.2g Healthy Fats\n"
            "• **Fayde:** Desi sabja seeds (tulsi beej) se bana natural drink jo pet ki garmi, acidity, jalan aur dehydration ko turant khatam karta hai!"
        )

    # 8. Moosmi Juice
    if any(k in text for k in ["moosmi", "mosambi", "sweet lime"]):
        return (
            "🍊 **Fresh Moosmi Juice:**\n\n"
            "• **Prices:** Regular ₹50 | Medium ₹70 | Large ₹90\n"
            "• **Nutrition (Regular):** 90 kcal | 1.8g Protein | 0.2g Fat\n"
            "• **100% Shuddh:** Zero added water, zero added sugar! Aankho ke samne taaza nichoda hua pure cold-pressed juice."
        )

    # 9. Avocado Shake
    if "avocado" in text or "avacadro" in text or "superfood" in text:
        return (
            "🥑 **Hass Avocado Super-Shake:**\n\n"
            "• **Prices:** Regular ₹180 | Jumbo Akhada ₹300\n"
            "• **Nutrition (Regular):** 360 kcal | 10.5g Protein | 21g Healthy Omega Fats\n"
            "• **Power:** Pure imported Hass Avocado jo joints health, heart vitality aur long endurance ke liye world-class maana jata hai."
        )

    # 10. Naariyal Malayi Shake
    if any(k in text for k in ["naariyal", "nariyal", "malai", "malayi", "coconut"]):
        return (
            "🥥 **Naariyal Malayi Shake (Tender Coconut Cream):**\n\n"
            "• **Price:** ₹150\n"
            "• **Nutrition:** 310 kcal | 7.0g Protein | 16g Natural MCT Fats\n"
            "• **Speciality:** Taaze green nariyal ki creamy malai aur coconut water se bana ultra-velvety shake."
        )

    # 11. Bel Patther Shake
    if any(k in text for k in ["bel", "pather", "patther", "wood apple"]):
        return (
            "🍈 **Bel Pather Shake (Ayurvedic Gut Healer):**\n\n"
            "• **Price:** ₹70\n"
            "• **Nutrition:** 220 kcal | 5.2g Protein | 2.5g Fats\n"
            "• **Ayurveda:** Pet ki garmi aur liver ke liye sabse behtareen desi drink jo pachan ko majboot rakhti hai."
        )

    # 12. Strawberry Shake
    if "strawberry" in text or "stoberry" in text:
        return (
            "🍓 **Wild Strawberry Shake:**\n\n"
            "• **Prices:** Regular ₹50 | Medium ₹80 | Large ₹100\n"
            "• **Nutrition:** 210 kcal | 5.8g Protein | 4.5g Fats\n"
            "• **Taste:** Fresh real strawberries aur thick chilled dairy milk ka refreshing combination!"
        )

    # 13. Arabian Date (Khajoor) Shake
    if any(k in text for k in ["date", "khajoor", "khajur"]):
        return (
            "🌴 **Arabian Date (Khajoor) Power Shake:**\n\n"
            "• **Prices:** Regular ₹50 | Medium ₹80 | Large ₹100\n"
            "• **Nutrition:** 280 kcal | 6.8g Protein | 5.0g Fats\n"
            "• **Energy:** Natural Medjool khajoor aur kaju-badam se bharpoor, instant stamina booster!"
        )

    # 14. Oreo Shake
    if "oreo" in text:
        return (
            "🍪 **Oreo Shake:**\n\n"
            "• **Prices:** Regular ₹50 | Medium ₹80 | Large ₹100\n"
            "• **Nutrition:** 340 kcal | 6.2g Protein | 11.5g Fats\n"
            "• **Taste:** Crushed Oreo cookies, rich chocolate sauce aur thick ice cream froth!"
        )

    # 15. Banana, Mango, Chiku, Lychee, Pineapple
    if "banana" in text or "kela" in text:
        return "🍌 **Banana Shake:** Regular ₹50 | Medium ₹70 | Large ₹90. (260 kcal, 7.2g Protein). Gym aur mass gainers ka all-time favorite!"
    if "mango" in text or "aam" in text:
        return "🥭 **Royal Mango Shake:** Regular ₹50 | Medium ₹70 | Large ₹90. (270 kcal, 6.0g Protein). Pure Alphonso mango pulp se bana!"
    if "chiku" in text or "chikoo" in text:
        return "🥔 **Chiku Shake:** Regular ₹50 | Medium ₹70 | Large ₹90. (240 kcal, 5.5g Protein). Caramel jaise meetha aur digestible!"
    if "lichi" in text or "lychee" in text:
        return "🍒 **Fresh Lichi Shake:** Regular ₹50 | Medium ₹80 | Large ₹100. (220 kcal, 5.2g Protein). Silky smooth fresh lychee shake!"
    if "ananas" in text or "pineapple" in text:
        return "🍍 **Ananas Shake / Juice:** Regular ₹50 | Medium ₹70 | Large ₹90. (210 kcal, 5.0g Protein). Natural bromelain & vitamin C!"

    # 16. Custom Shake Builder
    if any(k in text for k in ["custom", "khud ka", "mix", "apna shake", "diy", "builder", "apni pasand"]):
        return (
            "🎨 **Pehlwan Custom Shake Builder:**\n\n"
            "Haan ji! Aap website ke **'Custom Shake'** page par jakar:\n"
            "1. **Base:** Desi Bhains Doodh (₹35), Cow Milk (₹25), Nariyal Paani (₹40), Nariyal Malai (₹60), ya Mosambi (₹40)\n"
            "2. **Fruits:** Banana, Mango, Strawberry, Avocado, Khajoor, Chiku, Papaya, Pineapple (₹15 - ₹60)\n"
            "3. **Dry Fruits:** Silbatta Badam, Kaju, Pista, Beej Dana, Akhrot (₹15 - ₹30)\n"
            "4. **Boosters:** **Pure Whey Protein Scoop (+24g Protein)** (₹50), Gond Katira, Kesar, Peanut Butter\n"
            "Aapka live bill aur live calories turant calculate hoti hain!"
        )

    # 17. Gym / Workout / Muscle Gain
    if any(k in text for k in ["gym", "workout", "muscle", "mass", "protein", "bodybuilding", "taakat", "kushti", "dole", "biceps", "recovery"]):
        return (
            "💪 **Workout & Muscle Building Recommendations:**\n\n"
            "1. **Athletic Mass Gainer Stack (₹190):** Pehlwan Badam Ragda + Paneer Grill Sandwich (32.5g Protein!)\n"
            "2. **Custom Shake with Whey Protein:** Buffalo Milk Base + Banana + Silbatta Badam + **1 Scoop Pure Whey Protein (+24g P)** (Kul ~38g Protein!)\n"
            "3. **Hass Avocado Super-Shake (₹180):** High healthy omega fats jo muscle soreness aur joints recovery ke liye best hain.\n"
            "Workout ke 30-45 minutes ke andar inme se koi bhi drink lein!"
        )

    # 18. Weight Loss / Fat Loss
    if any(k in text for k in ["weight loss", "fat loss", "motapa", "patla", "vajan", "calorie kam", "diet", "lean"]):
        return (
            "🏃 **Weight Loss & Fat Loss Diet Recommendations:**\n\n"
            "1. **Fresh Moosmi Juice (₹50):** 100% Cold-pressed, zero added sugar, sirf 90 calories!\n"
            "2. **Bel Patther Shake (₹70):** High fiber, digestive booster aur zero unneeded fats.\n"
            "3. **Tender Coconut Water (₹40):** Natural electrolyte drink with only 45 calories.\n"
            "Aap website ke **'Diet Calculator'** se apna daily calorie deficit aur protein target bhi nikal sakte hain!"
        )

    # 19. Digestion / Acidity / Pet ki Garmi
    if any(k in text for k in ["pet", "garmi", "acidity", "digestion", "pachan", "thanda", "jalan"]):
        return (
            "❄️ **Pet ki Thandak aur Digestion ke liye Best:**\n\n"
            "1. **Beej Dana Natural Drink (₹100):** Sabja seeds pet ki garmi, jalan aur gas ko 10 minute me shant karte hain.\n"
            "2. **Bel Patther Shake (₹70):** Ancient Ayurvedic tonic for clean gut.\n"
            "3. **Pehlwan Desi Gond Katira:** Custom shake me add karwayein, heat recovery ke liye ek number!"
        )

    # 20. Purity / Quality / Milawat
    if any(k in text for k in ["pure", "shuddh", "milawat", "paani", "sugar", "cheeni", "quality", "asli"]):
        return (
            "👑 **100% Shuddhata ki Pehlwan Guarantee:**\n\n"
            "• **Zero Added Water:** Juices me paani nahi milaya jata.\n"
            "• **Zero Artificial Sugar:** Sabhi items me taaza fruits aur natural sweetness rehti hai.\n"
            "• **Farm-Fresh Dairy:** 100% taaza doodh aur asli paneer.\n"
            "Isi shuddhata ke kaaran Israna ke saare pehlwan, gym lifters aur doctor hum par bharosa karte hain!"
        )

    # 21. Order & Delivery Process
    if any(k in text for k in ["order", "delivery", "home delivery", "pick", "pack", "tray", "thali"]):
        return (
            "🛒 **Order Kaise Karein:**\n\n"
            "1. Website par kisi bhi item par **'Add to Tray'** dabayein.\n"
            "2. Right-side me 'Diet Tray' khulegi jisme **'Confirm & Send via WhatsApp'** par click karein.\n"
            "3. Hamare WhatsApp (+91 95883 51884) par aapka order automatically chala jayega aur dukaan par aate hi ready milega!"
        )

    # 22. Menu Price List Overview
    if any(k in text for k in ["menu", "rate", "price list", "list", "saare", "kitne ka"]):
        return (
            "📜 **Pehlwan Juice Corner Complete Price List:**\n\n"
            "• Moosmi Juice: ₹50 / 70 / 90\n"
            "• Bel Pather Shake: ₹70\n"
            "• Ananas Shake: ₹50 / 70 / 90\n"
            "• Mango Shake: ₹50 / 70 / 90\n"
            "• Banana Shake: ₹50 / 70 / 90\n"
            "• Chiku Shake: ₹50 / 70 / 90\n"
            "• Chiku-Papaya Shake: ₹50 / 70 / 90\n"
            "• Strawberry Shake: ₹50 / 80 / 100\n"
            "• Date (Khajoor) Shake: ₹50 / 80 / 100\n"
            "• Oreo Shake: ₹50 / 80 / 100\n"
            "• Beej Dana (Natural Drink): ₹100\n"
            "• Badam Ragda: ₹100\n"
            "• Lichi Shake: ₹50 / 80 / 100\n"
            "• Naariyal Malayi Shake: ₹150\n"
            "• Avocado Shake: ₹180 / 300\n"
            "• Pehlwan Grill Sandwich: ₹100\n"
            "• Chilled Cold Coffee: ₹100\n\n"
            "Website ke **'Menu'** tab par jakar sabhi items ki photos aur verified calories bhi dekh sakte hain!"
        )

    # 23. Greetings
    if any(k in text for k in ["ram ram", "namaste", "hello", "hi", "hey", "radhe radhe", "jai shree ram", "kya haal", "kaise ho"]):
        return (
            "Ram Ram ji! 🙏 Pehlwan Juice Corner, Israna me aapka swagat hai!\n\n"
            "Main aapka **Pehlwan AI Coach** hu. Kisi bhi drink ka price, calories, gym diet, timings ya location ke baare me kuch bhi puchhein!"
        )

    # Fallback
    return (
        f"Aapne '{msg}' ke baare me pucha! Pehlwan Juice Corner par taaze juices, desi badam ragda, protein shakes, paneer sandwich aur chilled cold coffee available hain.\n\n"
        "Aap mujhse ye sawaal puch sakte hain:\n"
        "• ⏰ *Shop timing aur location kya hai?*\n"
        "• 🥛 *Badam Ragda ya Cold Coffee ka rate kya hai?*\n"
        "• 💪 *Gym workout ke baad sabse best drink konsi hai?*\n"
        "• 🎨 *Custom shake kaise banate hain?*\n"
        "Batayein, main aapki kya seva karu?"
    )

@app.route("/api/ai-chat", methods=["POST"])
def api_ai_chat():
    data = request.get_json(silent=True) or {}
    message = data.get("message", "").strip()
    lang = data.get("lang", "hinglish")
    reply = get_pehlwan_ai_response(message, lang=lang)
    return jsonify({
        "success": True,
        "reply": reply
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
