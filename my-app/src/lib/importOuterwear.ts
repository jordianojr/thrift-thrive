import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebaseConfig'; // Import your Firebase config here

const itemNames = [
    "PATAGONIA HOODIE JACKET - MEDIUM - GREY NYLON POLYESTER",
    "NIKE HOODIE - LARGE - ORANGE COTTON BLEND",
    "STARTER RED SOX WINDBREAKER JACKET - LARGE - BLUE NYLON",
    "CHRISTIAN DIOR MONSIEUR COAT - 46L - BEIGE WOOL BLEND",
    "HARLEY DAVIDSON STORMTECH JACKET - BLACK POLYESTER",
    "NFL 49ERS FLEECE JACKET - LARGE - RED POLYESTER",
    "DICKIES OVERSHIRT JACKET - XL - BLUE POLYESTER",
    "CARHARTT NAPA FILTERS JACKET - XL - BEIGE COTTON",
    "CARHARTT JACKET - 3XL - GREEN COTTON"
];

const itemPrices = [51.5, 39.5, 43.5, 197, 67, 35.5, 31.5, 122, 114.5];
const itemBrand = [
    "PATAGONIA",
    "NIKE",
    "STARTER",
    "CHRISTIAN DIOR",
    "HARLEY DAVIDSON",
    "NFL",
    "DICKIES",
    "CARHARTT",
    "CARHARTT"
];
const itemDescriptions = [
    "Patagonia jacket with a hood and full zip closure. Made from 100% nylon with polyester insulation, it offers excellent warmth. Features functional external pockets.",
    "This orange Nike hoodie features a classic design with a convenient front pocket and hood. Made from a cotton blend, it offers comfort and durability.",
    "Vintage Starter windbreaker featuring Red Sox branding. Made of 100% nylon with a polyurethane coating for durability and water resistance.",
    "Beige coat by Christian Dior Monsieur featuring a classic design with button closure. Made from 35% wool and 60% polyester, ensuring a warm and comfortable wear.",
    "Vintage Harley Davidson jacket featuring embroidery on the back. Black polyester material with button closure. Fits size large. Removable fleece lining.",
    "This NFL 49ers zip-up features a bold red and black design with team logos on the front and sleeve, fitting size Large. Made from polyester and nylon, this jacket is ideal for sportswear enthusiasts.",
    "This Dickies fleece shirt jacket features a full button front and double chest pockets for practical style. Made from blue polyester, designed for warmth and casual wear.",
    "Vintage Carhartt jacket featuring a NAPA Filters logo. Made from durable 100% cotton with a combination of recycled acrylic and polyester lining. Designed with a zip closure and buttoned cuffs for a comfortable fit.",
    "This Carhartt jacket features a sturdy cotton construction with a classic button-up front. It includes two chest pockets and a corduroy collar, providing both style and functionality."
];

const conditionOptions = ['Brand new', 'Like new', 'Lightly used', 'Well used', 'Heavily used'];
const genderOptions = ['Male', 'Female', 'Unisex'];
const sizeOptions = ['S', 'M', 'L', 'XL'];

// Helper function to get random data from an array
function getRandomItem(arr: string[]) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Fetch a random userId from the Firestore users collection
async function getRandomUserId() {
    const usersCol = collection(db, 'users');
    const snapshot = await getDocs(usersCol);
    const users = snapshot.docs.map(doc => doc.id);
    return users[Math.floor(Math.random() * users.length)];
}

// Add documents to the "Outerwear" collection
async function populateOuterwear() {
    const outerwearCol = collection(db, 'Outerwear');

    for (let i = 0; i < 9; i++) {
        const userId = await getRandomUserId();
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        const username = userDoc.data()?.username || "Unknown";

        const docData = {
            brand: itemBrand[i],
            condition: getRandomItem(conditionOptions),
            dealMethod: ["Meet up", "Delivery"],
            description: itemDescriptions[i],
            gender: getRandomItem(genderOptions),
            itemName: itemNames[i],
            itemPhotosURLs: [], // Initialize as an empty array
            itemPrice: itemPrices[i],
            listedDate: `${new Date().getFullYear()}-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`,
            location: "Singapore",
            size: getRandomItem(sizeOptions),
            userId: userId,
            username: username
        };

        try {
            await addDoc(outerwearCol, docData);
            console.log(`Document o${i + 1} added successfully`);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }
}

// Run the function to populate Firestore
populateOuterwear();
