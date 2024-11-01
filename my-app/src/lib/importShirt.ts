import { db } from './firebaseConfig';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';

async function populateTShirts() {
    const tshirtCollection = collection(db, 'T-shirt');
    
    const conditionOptions = ['Lightly Used', 'Brand New', 'Like New', 'Heavily Used'];    const dealMethodOptions = ['Meet-up', 'Delivery', 'Meet-up or Delivery'];
    const descriptionArray = [ 
        "This Harley Davidson sleeveless T-shirt features a striking graphic on the front with a bold boar design and the iconic Harley Davidson logo. The back showcases 'Buckeye Harley-Davidson, Dayton Ohio' text and graphics. Fits size no size.",        "This Harley Davidson t-shirt features a Myrtle Beach design with a bold graphic from Spring Bike Week 2017. Made of soft grey cotton, it offers lasting comfort and style. Fits XL.",
        "Vintage Harley Davidson American Heritage T-Shirt featuring a striking front and back graphic. Made from soft cotton, it fits size XL. Ideal for collectors and enthusiasts.",        "White cotton t-shirt featuring a Harley-Davidson logo on the pocket and a graphic 'Vehicle Operations - Factory Tour, York, PA' on the back. Fits size Large.",
        "This Harley-Davidson tank top features a bold Caribbean shark graphic at the front and 'Super Bikes St. Maarten' on the back. Sleeveless design, suitable for casual wear, in a white colour crafted from cotton. Fits 2XL.",        "Vintage Harley-Davidson T-shirt featuring bold graphic designs on both the front and back. Made from comfortable cotton fabric, this item fits size Large. Ideal for Harley enthusiasts and collectors.",
        "This Harley-Davidson graphic t-shirt features a bold front and back print with a flaming design and motorcycle imagery. Made from 100% cotton, it offers a comfortable fit and durable construction. Fits size XL.",        "This Harley-Davidson t-shirt features a bold graphic design on both the front and back. Made from 100% cotton, it is both comfortable and durable. The shirt fits size XXL, making it ideal for a relaxed and casual look.",
        "This vintage Harley Davidson graphic T-shirt features a vibrant Screamin Eagle design with a motorcycle theme. Made from quality cotton, it showcases logos on both front and back. Fits size XL.",        "Harley-Davidson t-shirt featuring bold graphic design on the front and back. Made from soft cotton, this vibrant orange tee is perfect for motorcycle enthusiasts. Fits size Medium.",
        "Harley Davidson long sleeve henley shirt featuring a front button placket. It has graphic prints on the front and back, fits size 2XL. Made of cotton, ideal for casual wear.",        "Black Harley Davidson t-shirt featuring vibrant graphics on both front and back. Text reads 'RIDE REFUEL REPEAT' with Thunder Creek Harley Davidson motif. Made from cotton, fits 2XL. Ideal for vintage motorcycle enthusiasts."
    ];
    const titleArray = [        "HARLEY DAVIDSON GRAPHIC VEST - XL - BLACK COTTON",
        "HARLEY DAVIDSON MYRTLE BEACH T-SHIRT - XL - GREY COTTON",        "HARLEY DAVIDSON AMERICAN HERITAGE T-SHIRT - XL - WHITE COTTON",
        "HARLEY-DAVIDSON FACTORY TOUR T-SHIRT - 2XL - WHITE COTTON",        "HARLEY-DAVIDSON CARIBBEAN SHARK VEST - 2XL - WHITE COTTON",
        "HARLEY-DAVIDSON GRAPHIC T-SHIRT - 2XL - BLUE COTTON",        "HARLEY-DAVIDSON GRAPHIC T-SHIRT - XL - GREEN COTTON",
        "HARLEY-DAVIDSON GRAPHIC T-SHIRT - XX-LARGE - GREEN COTTON",        "HARLEY-DAVIDSON SCREAMIN EAGLE GRAPHIC T-SHIRT - XL - BLACK",
        "HARLEY-DAVIDSON GRAPHIC T-SHIRT - LARGE - ORANGE COTTON",        "HARLEY DAVIDSON LONG SLEEVE HENLEY SHIRT - 2XL - WHITE COTTON",
        "HARLEY-DAVIDSON GRAPHIC T-SHIRT - 2XL - BLACK COTTON"    ];
    const priceArray = [
        "$21.00", "$40.00", "$31.00", "$31.00",        "$21.00", "$24.00", "$25.00", "$41.00",
        "$41.00", "$52.00", "$29.00", "$61.00"    ];
    
    // Fetch user IDs from Firestore
    const userCollection = collection(db, 'users');
    const userSnapshots = await getDocs(userCollection);
    const userIds = userSnapshots.docs.map(doc => doc.id);
    
    // Helper function to generate a random date this year
    function getRandomDate() {
        const start = new Date(new Date().getFullYear(), 0, 1);
        const end = new Date();
        const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        return date.toISOString().split('T')[0]; // Format to YYYY-MM-DD
    }
    
    // Populate Firestore with T-shirt data
    for (let i = 0; i < descriptionArray.length; i++) {
        const tshirtDoc = doc(tshirtCollection, `s${i + 1}`);
        
        const data = {
            condition: conditionOptions[Math.floor(Math.random() * conditionOptions.length)],
            dealMethod: dealMethodOptions[Math.floor(Math.random() * dealMethodOptions.length)],
            description: descriptionArray[i],
            itemName: titleArray[i],
            itemPrice: priceArray[i],
            listedDate: getRandomDate(),
            userId: userIds[Math.floor(Math.random() * userIds.length)],
            // photos: [`s${i + 1}/photo1.jpg`, `s${i + 1}/photo2.jpg`] // Adjust file paths as needed
        };
        
        await setDoc(tshirtDoc, data);
    }
    
    console.log('T-shirt data populated successfully');
}

export default populateTShirts;



