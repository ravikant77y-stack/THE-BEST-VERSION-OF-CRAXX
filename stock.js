let stock = JSON.parse(
localStorage.getItem("stock")
)||{

"Choco Rings":0,

"Tangy Tomato Rings":0,

"Masala Rings":0,

"Masala Curls":0,

"Cheese Curls":0,

"Fritts Cream Onion":0,

"Fritts Peri Peri":0,

"Masala Natkhat":0,

"Biggies":0,

"Pipes":0,

"Cheese Ball":0,

"Noodles":0,

"Salted Chips":0,

"Cream Onion Chips":0,

"Tomato Chips":0,

"Masala Chips":0,

"Double Mazza":0,

"Hara Mutter":0,

"Aloo Bhujia":0,

"Moong Dal":0,

"Bikaneri Bhujia":0,

"Khatta Meetha":0,

"Navratan Mixture":0,

"Mast Moongfali":0,

"Punjabi Tadka":0,

"Lite Chivda":0

};

const productImages={

"Choco Rings":"https://i.ibb.co/PG05yWJg/choco-rings.jpg",

"Tangy Tomato Rings":"https://i.ibb.co/mCYPyQtc/tangy-tomato-rings.jpg",

"Masala Rings":"https://i.ibb.co/WN6MLXy1/masala-rings.jpg",

"Masala Curls":"https://i.ibb.co/XfshrwFP/masala-curls.jpg",

"Cheese Curls":"https://i.ibb.co/SZXxXYG/cheese-curls.jpg",

"Fritts Cream Onion":"https://i.ibb.co/PG9xgdX2/fritts-cream-onion.jpg",

"Fritts Peri Peri":"https://i.ibb.co/VY8X64ZF/fritts-peri-peri.jpg",

"Masala Natkhat":"https://i.ibb.co/dsSQ0x4L/masala-natkhat.jpg",

"Biggies":"https://i.ibb.co/KcjbWzyj/biggies.jpg",

"Pipes":"https://i.ibb.co/hxqH0PdN/pipes.jpg",

"Cheese Ball":"https://i.ibb.co/C3Cf6Lfx/cheese-ball.jpg",

"Noodles":"https://i.ibb.co/QFMRNrMk/noodles.jpg",

"Salted Chips":"https://i.ibb.co/wFnSsQ6X/salted-chips.jpg",

"Cream Onion Chips":"https://i.ibb.co/XnRrqC3/cream-onion-chips.jpg",

"Tomato Chips":"https://i.ibb.co/93cMXd7J/tomato-chips.jpg",

"Masala Chips":"https://i.ibb.co/0y5jkspm/masala-chips.jpg",

"Double Mazza":"https://i.ibb.co/hxWtsMT7/double-mazza.jpg",

"Hara Mutter":"https://i.ibb.co/Cs4YRs43/hara-mutter.jpg",

"Aloo Bhujia":"https://i.ibb.co/r2Z63jHj/aloo-bhujia.jpg",

"Moong Dal":"https://i.ibb.co/5xv5gXXK/moong-dal.jpg",

"Bikaneri Bhujia":"https://i.ibb.co/mVkKCd8g/bikaneri-bhujia.jpg",

"Khatta Meetha":"https://i.ibb.co/YBrBBxVS/khatta-meetha.jpg",

"Navratan Mixture":"https://i.ibb.co/6JwQ2S0c/navratan-mixture.jpg",

"Mast Moongfali":"https://i.ibb.co/LXhDLxT1/mast-moongfali.jpg",

"Punjabi Tadka":"https://i.ibb.co/b5wXL4JX/punjabi-tadka.jpg",

"Lite Chivda":"https://i.ibb.co/7tTrNbjM/lite-chivda.jpg"

};

const grams={

"Choco Rings":"18gm",

"Tangy Tomato Rings":"24gm",

"Masala Rings":"24gm",

"Masala Curls":"33gm",

"Cheese Curls":"33gm",

"Fritts Cream Onion":"33gm",

"Fritts Peri Peri":"33gm",

"Masala Natkhat":"33gm",

"Biggies":"24gm",

"Pipes":"",

"Cheese Ball":"33gm",

"Noodles":"34gm",

"Salted Chips":"26gm",

"Cream Onion Chips":"26gm",

"Tomato Chips":"26gm",

"Masala Chips":"26gm",

"Double Mazza":"31gm",

"Hara Mutter":"31gm",

"Aloo Bhujia":"41gm",

"Moong Dal":"38gm",

"Bikaneri Bhujia":"35gm",

"Khatta Meetha":"41gm",

"Navratan Mixture":"43gm",

"Mast Moongfali":"41gm",

"Punjabi Tadka":"41gm",

"Lite Chivda":"39gm"

};

function getProductCatalog(){

return JSON.parse(
localStorage.getItem("productCatalog")
)||{};

}

function saveProductCatalog(catalog){

localStorage.setItem(
"productCatalog",
JSON.stringify(catalog)
);

}

function syncProductCatalog(){

let catalog =
getProductCatalog();

Object
.values(catalog)
.forEach(product=>{

if(product.name){

productImages[product.name] =
product.image || productImages[product.name] || "";

grams[product.name] =
product.gram || grams[product.name] || "";

if(!stock.hasOwnProperty(product.name)){

stock[product.name] = 0;

}

}

});

}

function getAllProductNames(){

return Array
.from(
new Set([
...Object.keys(productImages),
...Object.keys(grams),
...Object.keys(stock),
...Object.keys(getProductCatalog())
])
)
.sort((a,b)=>a.localeCompare(b));

}

function getProductMeta(product){

let catalog =
getProductCatalog();

return catalog[product] || {
name:product,
category:"savouries",
gram:grams[product] || "",
price:75,
pcsPrice:15,
image:productImages[product] || ""
};

}

syncProductCatalog();
window.addEventListener(
"load",
()=>{

refreshProductEditOptions();
loadProductForEdit();

}
);

function getStockValue(product, gram, unit){

let value =
stock[product];

if(typeof value === "number"){

return gram === "52gm" ? 0 : value;

}

if(value && typeof value === "object"){

let key =
getStockKey(gram,unit);

return Number(value[key] || 0);

}

return 0;

}

function setStockValue(product, gram, unit, value){

if(typeof stock[product] !== "object" || stock[product] === null){

stock[product] = {
original:Number(stock[product] || 0)
};

}

stock[product][getStockKey(gram,unit)] =
value;

}

function getStockKey(gram, unit){

return gram === "52gm" ? "52gm__pcs" : "original";

}

function getOriginalLabel(product){

return grams[product] || "Original";

}

let stockSearchText = "";

function saveStockOnly(){

localStorage.setItem(
"stock",
JSON.stringify(stock)
);

}

function searchStockProducts(){

let input =
document.getElementById("stockSearchInput");

stockSearchText =
input ? input.value.trim().toLowerCase() : "";

renderStock();

}

function refreshProductEditOptions(){

let select =
document.getElementById("productEditSelect");

if(!select){

return;

}

let currentValue =
select.value;

select.innerHTML =
`<option value="">New Product</option>` +
getAllProductNames()
.map(product=>`<option value="${product}">${product}</option>`)
.join("");

select.value =
currentValue;

}

function loadProductForEdit(){

let selected =
document.getElementById("productEditSelect").value;

let meta =
selected ? getProductMeta(selected) : {
name:"",
category:"savouries",
gram:"",
price:"",
pcsPrice:15,
image:""
};

document.getElementById("productEditName").value =
meta.name || selected || "";

document.getElementById("productEditName").dataset.originalName =
selected || "";

document.getElementById("productEditCategory").value =
meta.category || "savouries";

document.getElementById("productEditGram").value =
meta.gram || grams[selected] || "";

document.getElementById("productEditPrice").value =
meta.price || 75;

document.getElementById("productEditPcsPrice").value =
meta.pcsPrice || 15;

document.getElementById("productEditImage").value =
meta.image || productImages[selected] || "";

}

function clearProductForm(){

document.getElementById("productEditSelect").value = "";
loadProductForEdit();

}

function setProductManagerStatus(message){

let status =
document.getElementById("productManagerStatus");

if(status){

status.innerText = message;

}

}

function saveProductForm(){

let nameInput =
document.getElementById("productEditName");

let originalName =
nameInput.dataset.originalName || "";

let name =
nameInput.value.trim();

if(!name){

alert("Enter product name");

return;

}

let catalog =
getProductCatalog();

let product = {
name:name,
category:document.getElementById("productEditCategory").value,
gram:document.getElementById("productEditGram").value.trim(),
price:Number(document.getElementById("productEditPrice").value || 0),
pcsPrice:Number(document.getElementById("productEditPcsPrice").value || 15),
image:document.getElementById("productEditImage").value.trim()
};

if(originalName && originalName !== name){

catalog[name] = product;
delete catalog[originalName];

stock[name] =
stock[originalName] || 0;

delete stock[originalName];
delete productImages[originalName];
delete grams[originalName];

}else{

catalog[name] = product;

}

saveProductCatalog(catalog);
syncProductCatalog();
saveStockOnly();
refreshProductEditOptions();

document.getElementById("productEditSelect").value =
name;

loadProductForEdit();
renderStock();

setProductManagerStatus(
`${name} saved. Refresh order page to see changes.`
);

}

function renderStock(){

let box =
document.getElementById(
"stockList"
);

box.innerHTML="";

box.innerHTML =
getAllProductNames()
.filter(product=>
!stockSearchText ||
product.toLowerCase().includes(stockSearchText) ||
(grams[product] || "").toLowerCase().includes(stockSearchText)
)
.map(product=>`

<div class="stock-card" data-product="${product}">

<img
src="${
productImages[product] || ""
}"
class="stock-image"
>

<h3>

${product}

</h3>

<p>

${
grams[product]
}

</p>

<div class="stock-variant">
<h2>${getOriginalLabel(product)}</h2>
<label class="stock-input-label">
Stock
<input
type="number"
min="0"
inputmode="numeric"
value="${getStockValue(product,"","")}"
onchange="setStockFromInput('${product}','', '', this.value)"
>
</label>
<div class="stock-buttons">
<button onclick="changeStock('${product}','', '', 10)">+10</button>
<button onclick="changeStock('${product}','', '', 1)">+1</button>
<button onclick="changeStock('${product}','', '', -1)">-1</button>
<button onclick="changeStock('${product}','', '', -10)">-10</button>
</div>
</div>

<div class="stock-variant stock-variant-pcs">
<h2>52gm pcs</h2>
<label class="stock-input-label">
Stock
<input
type="number"
min="0"
inputmode="numeric"
value="${getStockValue(product,"52gm","pcs")}"
onchange="setStockFromInput('${product}','52gm','pcs', this.value)"
>
</label>
<div class="stock-buttons">
<button onclick="changeStock('${product}','52gm','pcs', 10)">+10</button>
<button onclick="changeStock('${product}','52gm','pcs', 1)">+1</button>
<button onclick="changeStock('${product}','52gm','pcs', -1)">-1</button>
<button onclick="changeStock('${product}','52gm','pcs', -10)">-10</button>
</div>
</div>

</div>

`)
.join("");

if(!box.innerHTML){

box.innerHTML =
`<div class="stock-empty">No stock product found</div>`;

}

}

function setStockFromInput(
product,
gram,
unit,
value
){

let nextValue =
Number(value || 0);

if(nextValue < 0){

nextValue = 0;

}

setStockValue(
product,
gram,
unit,
nextValue
);

saveStockOnly();

renderStock();

}

function changeStock(
product,
gram,
unit,
amount
){

let nextValue =
getStockValue(product,gram,unit) + amount;

if(
nextValue<0
){

nextValue=0;

}

setStockValue(product,gram,unit,nextValue);

saveStockOnly();

renderStock();

}

renderStock();

let scannedStockItems = [];

// Levenshtein distance helper for fuzzy text comparison
function levenshtein(s1, s2) {
    if (s1.length < s2.length) {
        return levenshtein(s2, s1);
    }
    if (s2.length === 0) {
        return s1.length;
    }
    let previousRow = Array.from({length: s2.length + 1}, (_, i) => i);
    for (let i = 0; i < s1.length; i++) {
        let currentRow = [i + 1];
        for (let j = 0; j < s2.length; j++) {
            let insertions = previousRow[j + 1] + 1;
            let deletions = currentRow[j] + 1;
            let substitutions = previousRow[j] + (s1[i] === s2[j] ? 0 : 1);
            currentRow.push(Math.min(insertions, deletions, substitutions));
        }
        previousRow = currentRow;
    }
    return previousRow[s2.length];
}

// Clean and normalize OCR words to handle letters/digit substitutions in text matching
function normalizeOcrWord(word) {
    let w = word.toLowerCase().trim();
    w = w.replace(/0/g, 'o');
    w = w.replace(/1/g, 'i');
    w = w.replace(/5/g, 's');
    w = w.replace(/8/g, 'b');
    return w.replace(/[^a-z]/g, "");
}

// Synonym mapping to match real-world stock sheets with internal product catalog names
const PRODUCT_ALIASES = {
  "Cheese Ball": ["cheese balls big 20", "cheese balls big", "cheese balls crax", "cheese ball"],
  "Cream Onion Chips": ["crax chips cream onion 20", "crax chips cream onion", "crax chips cream & onion", "cream onion chips"],
  "Masala Chips": ["crax chips masala punch 20", "crax chips masala punch", "masala chips"],
  "Salted Chips": ["crax chips simply salted", "chips simply salted", "salted chips"],
  "Masala Curls": ["curls chatpat masala 20", "curls chatpat masala", "masala curls"],
  "Cheese Curls": ["curls cheesy delight", "cheese curls"],
  "Fritts Cream Onion": ["fritts cream onion big 20", "fritts cream & onion crax", "fritts cream & onion", "fritts cream onion"],
  "Fritts Peri Peri": ["fritts peri peri big 20", "fritts peri peri 10", "fritts peri peri"],
  "Masala Natkhat": ["natkhat masala 20 crax", "natkhat masala", "masala natkhat"],
  "Masala Rings": ["rings masala mania 20", "rings masala mania crax", "rings masala mania", "masala rings"],
  "Tangy Tomato Rings": ["rings tangy tomato 20", "rings tangy tomato", "rings tangy tomatoo", "tangy tomato rings"],
  "Aloo Bhujia": ["crax aloo bhujiya", "crax aloo bhujia", "aloo bhujia"],
  "Moong Dal": ["crax moogdal", "crax moong dal", "moong dal"],
  "Bikaneri Bhujia": ["crax bhujiya sev 10", "crax bhujiya sev", "bikaneri bhujia"],
  "Khatta Meetha": ["crax khatta meetha", "khatta meetha"],
  "Navratan Mixture": ["crax navratan", "navratan mixture"],
  "Mast Moongfali": ["crax mast moongfali tasty", "crax mast moongfali", "mast moongfali"],
  "Punjabi Tadka": ["crax punjabi tadka", "punjabi tadka"],
  "Lite Chivda": ["crax lite chiwda", "lite chivda"],
  "Hara Mutter": ["crax mast mattar green pea", "mast mattar green pea", "hara mutter"],
  "Noodles": ["crunchy noodles crax", "noodles"],
  "Pipes": ["pipes simply salted", "pipes"],
  "Choco Rings": ["choco rings 10", "choco rings"],
  "Cheese Ball": [
    "cheese balls big 20", "cheese balls big", "cheese balls crax", "cheese ball",
    "ommseonismoa", "omms eonismoa"
  ],
  "Cream Onion Chips": [
    "crax chips cream onion 20", "crax chips cream onion", "crax chips cream & onion", "cream onion chips",
    "tonaonwscromwononz", "craxcuescreamaonon", "craumecmmon two"
  ],
  "Masala Chips": [
    "crax chips masala punch 20", "crax chips masala punch", "masala chips",
    "craxchipsmasalapunch"
  ],
  "Salted Chips": [
    "crax chips simply salted", "chips simply salted", "salted chips",
    "cnaxcrpssweiy sare", "craxompssimpvsaed"
  ],
  "Masala Curls": [
    "curls chatpat masala 20", "curls chatpat masala", "masala curls",
    "comscuamatmasaiazos", "urlschatpatmasala"
  ],
  "Cheese Curls": [
    "curls cheesy delight", "cheese curls",
    "comscnmesvomien"
  ],
  "Fritts Cream Onion": [
    "fritts cream onion big 20", "fritts cream & onion crax", "fritts cream & onion", "fritts cream onion",
    "craxcmaneeainl"
  ],
  "Fritts Peri Peri": [
    "fritts peri peri big 20", "fritts peri peri 10", "fritts peri peri",
    "mmseerpenpo20", "frittsperiperit0"
  ],
  "Masala Natkhat": [
    "natkhat masala 20 crax", "natkhat masala", "masala natkhat",
    "watkhatmasalazo crax", "watkhatmasalazo"
  ],
  "Masala Rings": [
    "rings masala mania 20", "rings masala mania crax", "rings masala mania", "masala rings",
    "nvcswasmananazo"
  ],
  "Tangy Tomato Rings": [
    "rings tangy tomato 20", "rings tangy tomato", "rings tangy tomatoo", "tangy tomato rings",
    "amos mworrountors", "mwesmveviowsoo"
  ],
  "Aloo Bhujia": [
    "crax aloo bhujiya", "crax aloo bhujia", "aloo bhujia",
    "craxaomwwna"
  ],
  "Moong Dal": [
    "crax moogdal", "crax moong dal", "moong dal",
    "lommwoosa"
  ],
  "Bikaneri Bhujia": [
    "crax bhujiya sev 10", "crax bhujiya sev", "bikaneri bhujia",
    "cemxewumasevio"
  ],
  "Khatta Meetha": [
    "crax khatta meetha", "khatta meetha"
  ],
  "Navratan Mixture": [
    "crax navratan", "navratan mixture"
  ],
  "Mast Moongfali": [
    "crax mast moongfali tasty", "crax mast moongfali", "mast moongfali",
    "craxwastwoonsmu sy"
  ],
  "Punjabi Tadka": [
    "crax punjabi tadka", "punjabi tadka"
  ],
  "Lite Chivda": [
    "crax lite chiwda", "lite chivda"
  ],
  "Hara Mutter": [
    "crax mast mattar green pea", "mast mattar green pea", "hara mutter",
    "crmwst wears pa"
  ],
  "Noodles": [
    "crunchy noodles crax", "noodles",
    "cruncwv noobies cakes"
  ],
  "Pipes": [
    "pipes simply salted", "pipes",
    "pipessimplysalteds"
  ],
  "Choco Rings": [
    "choco rings 10", "choco rings"
  ],
  "Double Mazza": [
    "crax double mazza", "double mazza",
    "craxpousiewazza", "cRaxpousiewazza"
  ],
  "Biggies": [
    "biggies swiss cheese", "biggies",
    "boowsswescese"
  ]
};

// Known packing weights (in grams) to filter out from quantity candidates
const KNOWN_GRAMS = [18, 24, 26, 31, 33, 34, 35, 38, 39, 41, 43, 52, 58, 59];

// Score how well a product name matches the words in a line
function scoreProduct(productName, lineWords) {
    let searchTerms = [productName];
    if (PRODUCT_ALIASES[productName]) {
        searchTerms = searchTerms.concat(PRODUCT_ALIASES[productName]);
    }
    
    let bestTermScore = 0;
    
    for (let term of searchTerms) {
        let productTokens = term.toLowerCase().split(/\s+/).filter(Boolean);
        let matchedTokens = 0;
        let totalScore = 0;
        
        for (let token of productTokens) {
            let cleanToken = normalizeOcrWord(token);
            if (!cleanToken) continue;
            
            let bestWordScore = 0;
            for (let word of lineWords) {
                let cleanWord = normalizeOcrWord(word);
                if (!cleanWord) continue;
                
                if (cleanWord === cleanToken) {
                    bestWordScore = 2;
                    break;
                } else {
                    let dist = levenshtein(cleanWord, cleanToken);
                    let maxAllowedDist = cleanToken.length > 6 ? 2 : (cleanToken.length >= 4 ? 1 : 0);
                    if (dist <= maxAllowedDist) {
                        let score = 1 - (dist / cleanToken.length);
                        if (score > bestWordScore) {
                            bestWordScore = score;
                        }
                    }
                }
            }
            if (bestWordScore > 0) {
                matchedTokens++;
                totalScore += bestWordScore;
            }
        }
        
        if (productTokens.length > 0) {
            let coverage = matchedTokens / productTokens.length;
            let minCoverage = productTokens.length <= 2 ? 0.9 : 0.5;
            if (coverage >= minCoverage) {
                let termScore = totalScore / productTokens.length;
                if (termScore > bestTermScore) {
                    bestTermScore = termScore;
                }
            }
        }
    }
    
    return bestTermScore;
}

function findProductInLine(line) {
    let lineWords = line.split(/\s+/).filter(Boolean);
    let bestProduct = null;
    let bestScore = 0;
    
    for (let product of getAllProductNames()) {
        let score = scoreProduct(product, lineWords);
        if (score > bestScore) {
            bestScore = score;
            bestProduct = product;
        }
    }
    
    return bestProduct;
}

function parseStockLine(line) {
    let product = findProductInLine(line);
    if (!product) {
        return null;
    }
    
    let normalizedLine = line.toLowerCase();
    
    // Classify as 52gm/large variant if the line matches characteristic larger packaging identifiers
    let isPcs = normalizedLine.includes("largepcs") ||
                (!normalizedLine.includes("originalpcs") && (
                    normalizedLine.includes("52g") ||
                    normalizedLine.includes("58g") ||
                    normalizedLine.includes("59g") ||
                    normalizedLine.includes("20/-") ||
                    normalizedLine.includes("20/") ||
                    normalizedLine.includes("big") ||
                    normalizedLine.includes("15 rs") ||
                    normalizedLine.includes("15rs") ||
                    (/\b15\b/.test(normalizedLine)) ||
                    normalizedLine.includes("52gm") ||
                    normalizedLine.includes("52 gm")
                ));
                
    // Correct common OCR digit/letter mistakes in number fields
    let correctedLine = line
        .replace(/\b([1-9])([oO])\b/g, '$10')
        .replace(/\b([oO])\b/g, '0')
        .replace(/\b([lIi])([0-9])\b/g, '1$2')
        .replace(/\b([1-9])([lIi])\b/g, '$11');
        
    // Extract all numbers (only keeping integers to avoid price decimals like 7.5 or 27.5)
    let allNumbers = [];
    let regex = /\d+(\.\d+)?/g;
    let match;
    while ((match = regex.exec(correctedLine)) !== null) {
        let val = Number(match[0]);
        // Only keep whole integers for quantity candidates!
        if (val === Math.floor(val)) {
            allNumbers.push({
                value: val,
                index: match.index,
                text: match[0]
            });
        }
    }
    
    if (allNumbers.length === 0) {
        return null;
    }
    
    // Step-by-step filtering of distractor numbers (serial no, packaging codes, price, grams)
    let filteredNumbers = allNumbers;
    
    // 1. Serial Number filter (number <= 30 located at the very start of the line)
    filteredNumbers = filteredNumbers.filter(num => {
        if (num.index < 5 && num.value <= 30) {
            return false; // exclude row serial number
        }
        return true;
    });
    
    // 2. Grams and Packaging filter (e.g. "52g", "58g", "20/-")
    filteredNumbers = filteredNumbers.filter(num => {
        let idx = num.index;
        let endIdx = idx + num.text.length;
        
        // Exclude packaging codes ending in slash/dash (like "20/-")
        let postChar = correctedLine.substring(endIdx, endIdx + 2);
        if (/^\s*(\/|-)/.test(postChar)) {
            return false;
        }
        
        // Exclude weight labels like "52G", "52GM"
        let postWeight = correctedLine.substring(endIdx, endIdx + 4).toLowerCase();
        if (/^\s*(g|gm|gms|grams|m)\b/.test(postWeight)) {
            return false;
        }
        
        // Exclude if it's a known packing gram value (e.g. 52, 58, 33)
        if (KNOWN_GRAMS.includes(num.value)) {
            return false;
        }
        
        return true;
    });
    
    // If we over-filtered everything, default back to raw numbers
    if (filteredNumbers.length === 0) {
        filteredNumbers = allNumbers;
    }
    
    // 3. Price Filter (exposing current product's expected price)
    let meta = getProductMeta(product);
    let expectedPrice = isPcs ? meta.pcsPrice : meta.price; // default pcsPrice is 15, standard price is 75 (7.5)
    
    let finalNumbers = filteredNumbers;
    if (filteredNumbers.length > 1) {
        // Filter out expected prices (15, 7.5, 75, 7)
        finalNumbers = filteredNumbers.filter(num => {
            let val = num.value;
            // Match expected price or basic close formats (like 7 or 7.5 for 7.5)
            if (val === expectedPrice) return false;
            if (!isPcs && (val === 7.5 || val === 75 || val === 7)) return false;
            if (isPcs && val === 15) return false;
            return true;
        });
        if (finalNumbers.length === 0) {
            finalNumbers = filteredNumbers;
        }
    }
    
    // Choose the best candidate for quantity
    // Prioritize the last matching number that was not filtered out
    let quantity = 0;
    if (finalNumbers.length > 0) {
        quantity = finalNumbers[finalNumbers.length - 1].value;
    } else {
        return null;
    }
    
    if (!isPcs) {
        let multiplier = (product === "Pipes" || product === "Noodles") ? 8 : 10;
        quantity = Math.round((quantity / multiplier) * 10) / 10;
    }
    
    return {
        product: product,
        gram: isPcs ? "52gm" : "",
        unit: isPcs ? "pcs" : "",
        qty: quantity
    };
}

function parseQtyFromSegments(segs, isPcs) {
    if (segs.length < 3) return 0;
    
    // Qty segment is typically the second-to-last segment if there is a price at the end,
    // or the last segment if there is no price segment.
    // In our sheet:
    // Columns: [SrNo, Product, Grams, Qty, Price] -> length 5 -> qty is segs[3]
    // Or: [Product, Grams, Qty, Price] -> length 4 -> qty is segs[2]
    // So Qty is at index length - 2 if the last segment looks like a price (contains decimals, or is a known price).
    let lastSeg = segs[segs.length - 1].toLowerCase();
    let hasPriceIndicator = lastSeg.includes("rs") || 
                           lastSeg.includes("₹") || 
                           lastSeg.includes(".") || 
                           lastSeg.includes("es") || 
                           lastSeg.includes("ws") || 
                           lastSeg.includes("ts") || 
                           /\b(15|7\.5|75|7|5)\b/.test(lastSeg);
                           
    let qtySeg = lastSeg;
    if (hasPriceIndicator && segs.length >= 3) {
        qtySeg = segs[segs.length - 2];
    }
    
    // Clean and decode the quantity segment
    let clean = qtySeg.trim().toLowerCase();
    
    // Check if segment is completely empty or just letters with no numbers
    // Replace common OCR number mistakes
    clean = clean.replace(/o/g, '0');
    clean = clean.replace(/q/g, '0');
    clean = clean.replace(/s/g, '5');
    clean = clean.replace(/l/g, '1');
    clean = clean.replace(/i/g, '1');
    clean = clean.replace(/t/g, '7');
    clean = clean.replace(/b/g, '8');
    clean = clean.replace(/g/g, '9');
    clean = clean.replace(/z/g, '2');
    
    let match = clean.match(/\d+/);
    return match ? Number(match[0]) : 0;
}

function parseStockText(text) {
    let mergedItems = {};
    let lines = [];
    
    text.split(/\r?\n/).forEach(line => {
        line = line.trim();
        if (!line) return;
        
        // If the line has multiple column sections (split by '|' or has many segments)
        if (line.includes("|") && line.split("|").length >= 4) {
            let segments = line.split("|").map(s => s.trim()).filter(Boolean);
            
            // Try to find the splitting point where the right column starts.
            // Right column always starts with a Serial Number (number <= 30)
            let splitIndex = -1;
            for (let i = 2; i < segments.length - 1; i++) {
                let seg = segments[i];
                // Check if it is a serial number: a number <= 30
                if (/^\d+$/.test(seg) && Number(seg) <= 30) {
                    splitIndex = i;
                    break;
                }
            }
            
            // Fallback split point (around the middle of the list)
            if (splitIndex === -1 && segments.length >= 6) {
                splitIndex = Math.floor(segments.length / 2);
            }
            
            if (splitIndex !== -1) {
                let leftSegs = segments.slice(0, splitIndex);
                let rightSegs = segments.slice(splitIndex);
                
                // Add non-digit tags so parseStockLine knows the variant without digit conflicts
                let leftLine = leftSegs.join(" ") + " largepcs";
                let rightLine = rightSegs.join(" ") + " originalpcs";
                
                // Parse Qty directly from segment lists
                let leftQty = parseQtyFromSegments(leftSegs, true);
                let rightQty = parseQtyFromSegments(rightSegs, false);
                
                let leftItem = parseStockLine(leftLine);
                if (leftItem) {
                    leftItem.qty = leftQty;
                    addMergedItem(mergedItems, leftItem);
                }
                
                let rightItem = parseStockLine(rightLine);
                if (rightItem) {
                    rightItem.qty = rightQty;
                    addMergedItem(mergedItems, rightItem);
                }
            } else {
                // Not split but has '|', parse as single line using segment-based qty extraction
                let item = parseStockLine(line);
                if (item) {
                    item.qty = parseQtyFromSegments(segments, item.gram === "52gm");
                    addMergedItem(mergedItems, item);
                }
            }
        } else {
            // Text mode (no '|', user-edited line)
            let item = parseStockLine(line);
            if (item) {
                addMergedItem(mergedItems, item);
            }
        }
    });
    
    return Object.values(mergedItems);
}

function addMergedItem(mergedItems, item) {
    let key = `${item.product}__${getStockKey(item.gram, item.unit)}`;
    if (!mergedItems[key]) {
        mergedItems[key] = item;
    } else {
        mergedItems[key].qty += item.qty;
    }
}

function renderScanPreview(){

let preview =
document.getElementById("scanPreview");

if(!preview){

return;

}

if(!scannedStockItems.length){

preview.innerHTML =
"<p>No matching stock items found. Edit OCR text and scan again.</p>";

return;

}

preview.innerHTML =
`
<table>
<thead>
<tr>
<th>Product</th>
<th>Type</th>
<th>Qty</th>
</tr>
</thead>
<tbody>
${scannedStockItems.map(item=>`
<tr>
<td>${item.product}</td>
<td>${item.unit === "pcs" ? "52gm pcs" : getOriginalLabel(item.product)}</td>
<td>${item.qty}</td>
</tr>
`).join("")}
</tbody>
</table>
`;

}function compressAndResizeImage(file, maxWidth = 1000) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject("No file provided");
      return;
    }
    if (!file.type.startsWith("image/")) {
      resolve(file);
      return;
    }
    let img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      } else {
        resolve(file);
        return;
      }
      let canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      let ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => {
        if (blob) {
          let resizedFile = new File([blob], file.name, { type: "image/jpeg", lastModified: Date.now() });
          resolve(resizedFile);
        } else {
          resolve(file);
        }
      }, "image/jpeg", 0.85);
    };
    img.onerror = err => reject(err);
  });
}

function updateScanStatus(message){

let status =
document.getElementById("scanStatus");

if(status){

status.innerText = message;

}

}

async function scanStockSheet(){

let input =
document.getElementById("stockScanInput");

let textBox =
document.getElementById("scanText");

if(!input || !input.files || !input.files[0]){

alert("Select or capture a stock sheet photo first");

return;

}

if(typeof Tesseract === "undefined"){

alert("OCR engine is not loaded. Please connect internet once and refresh this page.");

return;

}

updateScanStatus("Resizing image...");
  
let resizedFile;
try {
  resizedFile = await compressAndResizeImage(input.files[0]);
} catch (err) {
  resizedFile = input.files[0];
}

updateScanStatus("Scanning sheet...");

let result =
await Tesseract.recognize(
resizedFile,
"eng",
{
logger:progress=>{

if(progress.status){

updateScanStatus(
`${progress.status} ${Math.round((progress.progress || 0) * 100)}%`
);

}

}
}
);

textBox.value =
result.data.text;

scannedStockItems =
parseStockText(textBox.value);

renderScanPreview();

updateScanStatus(
`Scan complete: ${scannedStockItems.length} stock rows detected`
);

}

function applyScannedStock(){

let textBox =
document.getElementById("scanText");

if(textBox && textBox.value.trim()){

scannedStockItems =
parseStockText(textBox.value);

renderScanPreview();

}

if(!scannedStockItems.length){

alert("No stock rows to add");

return;

}

scannedStockItems.forEach(item=>{

setStockValue(
item.product,
item.gram,
item.unit,
item.qty
);

});

localStorage.setItem(
"stock",
JSON.stringify(stock)
);

renderStock();
saveStock(true);

updateScanStatus(
`Replaced ${scannedStockItems.length} scanned stock rows`
);

alert("Scanned stock updated");

}

function saveStock(silent){

localStorage.setItem(

"stock",

JSON.stringify(
stock
)

);

let history=

JSON.parse(

localStorage.getItem(
"stockHistory"
)

)||[];

history.unshift(

{

time:

new Date()
.toLocaleString(),

stock:

JSON.parse(
JSON.stringify(stock)
)

}

);

localStorage.setItem(

"stockHistory",

JSON.stringify(
history
)

);

showHistory();

if(!silent){

alert(
"Stock Saved"
);

}

}

function showHistory(){

let box=

document.getElementById(

"stockHistory"

);

if(!box)return;

let history=

JSON.parse(

localStorage.getItem(
"stockHistory"
)

)||[];

box.innerHTML="";

history
.slice(0,5)
.forEach(entry=>{

box.innerHTML+=`

<div
class=
"history-card"
>

${entry.time}

</div>

`;

});

}

showHistory();

window.addEventListener(
"storage",
event=>{

if(event.key !== "stock"){

return;

}

stock=
JSON.parse(
localStorage.getItem("stock")
)||stock;

renderStock();

}
);

function scrollToShortcutTarget(selector){

let target =
document.querySelector(selector);

if(target){

target.scrollIntoView({
behavior:"smooth",
block:"start"
});

}

}

function initShortcutMenu(shortcuts){

let existing =
document.getElementById("shortcutMenu");

if(existing){

existing.remove();

}

let menu =
document.createElement("div");

menu.id = "shortcutMenu";
menu.className = "shortcut-menu";

menu.innerHTML =
`
<button class="shortcut-toggle" type="button" aria-label="Open shortcuts">☰</button>
<div class="shortcut-panel" hidden>
${shortcuts.map(shortcut=>`
<button type="button" data-shortcut="${shortcut.id}">
<span>${shortcut.icon}</span>
${shortcut.label}
</button>
`).join("")}
</div>
`;

document.body.appendChild(menu);

let panel =
menu.querySelector(".shortcut-panel");

menu
.querySelector(".shortcut-toggle")
.addEventListener("click",()=>{

panel.hidden =
!panel.hidden;

});

menu
.querySelectorAll("[data-shortcut]")
.forEach(button=>{

button.addEventListener("click",()=>{

let shortcut =
shortcuts.find(item=>item.id === button.dataset.shortcut);

if(shortcut){

shortcut.action();

}

panel.hidden = true;

});

});

document.addEventListener("click",event=>{

if(!menu.contains(event.target)){

panel.hidden = true;

}

});

}

window.addEventListener(
"load",
()=>{

initShortcutMenu([
{
id:"search-stock",
icon:"⌕",
label:"Search Stock",
action:()=>document.getElementById("stockSearchInput")?.focus()
},
{
id:"products",
icon:"✎",
label:"Product Editor",
action:()=>scrollToShortcutTarget(".product-manager-box")
},
{
id:"scan",
icon:"◫",
label:"Scan Sheet",
action:()=>scrollToShortcutTarget(".scan-stock-box")
},
{
id:"stock-list",
icon:"▦",
label:"Stock List",
action:()=>scrollToShortcutTarget("#stockList")
},
{
id:"history",
icon:"↺",
label:"History",
action:()=>scrollToShortcutTarget("#stockHistory")
},
{
id:"save",
icon:"✓",
label:"Save Stock",
action:()=>saveStock()
},
{
id:"order",
icon:"🛒",
label:"Order Page",
action:()=>window.location.href = "index.html"
},
{
id:"product-manager",
icon:"PM",
label:"Product Manager",
action:()=>window.location.href = "product-manager.html"
},
{
id:"store-manager",
icon:"SM",
label:"Store Manager",
action:()=>window.location.href = "store-manager.html"
},
{
id:"top",
icon:"↑",
label:"Top",
action:()=>window.scrollTo({top:0,behavior:"smooth"})
}
]);

}
);
