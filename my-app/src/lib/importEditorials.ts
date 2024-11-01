import { db, storage } from './firebaseConfig'; // Ensure Firebase is initialized in your project
import { getDocs, collection, setDoc, doc } from "firebase/firestore";
import { getDownloadURL, ref, listAll } from "firebase/storage";

const titles = [
    "WELCOME TO PLANET YOON",
    "THE PURSUIT OF OPTIMAL RELEVANCE WITH BERLIN CREATIVE STUDIO SUB",
    "CULTURAL INNOVATION, DEEPFAKES AND QUIET LUXURY WITH BARRAGÁN",
    "ALL EYEZ ON PESO PLUMA",
    "TYSHAWN JONES: COURTHOUSE KID TO KING OF NEW YORK",
    "NICK KNIGHT: NEW WAYS OF SEEING",
    "PIONEERS OF PROGRESS: BRIAN ANDERSON IN CONVERSATION WITH ELISSA STEAMER AND LEO BAKER",
    "PAVEMENT QUEENS: SANDY KIM SHOOTS THE NEXT GENERATION OF SKATEBOARDING",
    "HOW CREATIVE MISFITS ON THE PACIFIC COAST CHANGED CULTURE FOREVER",
    "EXPERIMENTATION AND SELF-REALIZATION AT OOO-ING STUDIO",
    "BUILDING CHARACTER WITH SHIRLEY KURATA",
    "ART BASEL TOUCHES DOWN IN PARIS WITH 195 EXHIBITIONS"
];

const captions = [
    "Kim Jones enters the orbit of Yoon Ahn for a conversation across time zones, covering couture houses, Alaskan survival shows and more for GREATEST 09.",
    "From Balenciaga runway shows to Travis Scott album covers, a rare look inside the architectural think tank’s multidisciplinary works in GREATEST 09.",
    "Victor 2093, an AI chatbot trained on Victor Barragán’s persona, reveals the secret narratives behind the Mexican brand’s collections.",
    "From his breakthrough record ‘Génesis’ to his new album ‘Éxodo,’ tracing the biblical ascendance of La Doble P in GREATEST 09.",
    "Na-Kel Smith calls up the skate prodigy to recount his journey from ollieing NYC subway tracks to designing his own shoes for GREATEST 09.",
    "The legendary photographer pens an essay for GREATEST 09 detailing his journey from 1985 i-D Magazine shoots to experiments with 3D avatars in 2024.",
    "The skateboard legend links up with generational talents to discuss the culture’s inclusion evolution, dropping out of the Olympics and ‘Tony Hawk’s Pro Skater.’",
    "The photographer meets up with Efron Danzig, Eliane Castiglione V. and Sticky for an impromptu afternoon skateboard session.",
    "The unlikely story of the skateboarders, artists and brands that launched a global movement.",
    "How Taiwan’s wildest salon uses vivid colorations and avant-garde hairstyles as radical mediums.",
    "For GREATEST 09, the Oscar-nominated costume designer dives into her personal collection of Polaroids, revealing how she transforms actors into characters through IRL research.",
    "From Martine Syms to Miu Miu, what to expect from the 2024 edition with Clément Delépine."
];

async function populateFirestore() {
    const sellerId = "ThriftThriveOfficialAccount";
    
    for (let i = 0; i < titles.length; i++) {
        const docId = `ed${i + 1}`;
        const title = titles[i];
        const caption = captions[i];
        
        // Fetch images from Firebase Storage folder (ed1, ed2, ...)
        const imageFolderRef = ref(storage, `editorial_photos/${docId}`);
        
        try {
            const imageList = await listAll(imageFolderRef);
            const imageUrls = await Promise.all(
                imageList.items.map(item => getDownloadURL(item))
            );

            // Construct document data
            const documentData = {
                title,
                caption,
                sellerId,
                image: imageUrls
            };

            // Save to Firestore
            await setDoc(doc(db, "Editorial", docId), documentData);
            console.log(`Document ${docId} successfully written!`);
        } catch (error) {
            console.error(`Error writing document ${docId}:`, error);
        }
    }
}

export default {
    methods: {
        populateFirestore
    }
};

populateFirestore();