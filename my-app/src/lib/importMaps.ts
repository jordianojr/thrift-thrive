import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

const locations = [
    { 
        lat: 1.2956, 
        lng: 103.8542, 
        title: 'Haji Lane, Singapore',
        events: [
            {
                name: "Weekend Market",
                date: "2024-11-15",
                time: "11.00am - 5.00pm",
                description: "Join us for a vibrant weekend market featuring local vendors and unique thrift finds. Discover vintage clothing, accessories, and rare collectibles while supporting local businesses. Special early bird discounts for the first 50 customers!"
            },
            {
                name: "Night Bazaar",
                date: "2024-12-01",
                time: "6.00pm - 10.00pm",
                description: "Experience the magic of night shopping at our special evening bazaar. Enjoy special discounts on all items, live music performances, and food vendors. Bring your friends for a fun evening of thrift shopping under the stars!"
            }
        ]
    },
    { 
        lat: 1.3056, 
        lng: 103.9043, 
        title: "The Barn @ Katong",
        events: [
            {
                name: "Vintage Collection Launch",
                date: "2024-11-20",
                time: "2.00pm - 5.00pm",
                description: "Be the first to explore our carefully curated vintage collection featuring pieces from the 70s, 80s, and 90s. Each piece has been handpicked and authenticated. Includes live styling demonstrations and complimentary refreshments for all attendees."
            }
        ]
    },
    { 
        lat: 1.2811, 
        lng: 103.8458, 
        title: "Function Five Thrift Shop",
        events: [
            {
                name: "Student Discount Day",
                date: "2024-11-10",
                time: "10.00am - 6.00pm",
                description: "Calling all students! Present your student ID for an exclusive 20% discount on all items. Perfect timing to refresh your wardrobe for the new semester. Additional 5% off for bulk purchases above $50. Free tote bag for the first 30 students!"
            },
            {
                name: "Winter Collection",
                date: "2024-12-05",
                time: "12.00pm - 5.00pm",
                description: "Discover our premium winter wear collection featuring coats, sweaters, and accessories perfect for your year-end travels. All items have been carefully selected and are in excellent condition. Styling tips and travel packing workshop included."
            }
        ]
    },
    { 
        lat: 1.2749, 
        lng: 103.8418, 
        title: "The Fashion Pulpit",
        events: [
            {
                name: "Swap Party",
                date: "2024-11-25",
                time: "3.00pm - 7.00pm",
                description: "Bring your pre-loved clothes and swap them for something new-to-you! All items must be clean and in good condition. Our fashion experts will be on hand to help you make the best choices. Includes refreshments and a sustainable fashion workshop."
            }
        ]
    },
    { 
        lat: 1.3042, 
        lng: 103.8322, 
        title: "LPB Thrift",
        events: [
            {
                name: "Seasonal Clearance",
                date: "2024-11-30",
                time: "11.00am - 6.00pm",
                description: "Massive clearance sale with discounts up to 70% off selected items. Everything must go to make room for new inventory! Special deals include buy-one-get-one-free on accessories and additional discounts for bundle purchases. Free parking available."
            }
        ]
    },
    { 
        lat: 1.3039, 
        lng: 103.8328, 
        title: "Lucky Thrifty",
        events: [
            {
                name: "Lucky Hour",
                date: "2024-11-12",
                time: "12.00pm - 1.00pm",
                description: "Join our exciting lunch hour flash sale! Every purchase comes with a lucky dip chance to win additional discounts or free items. The first 20 customers will receive mystery gift bags. Don't miss this short but sweet chance for amazing deals!"
            }
        ]
    },
    { 
        lat: 1.3155, 
        lng: 103.8844, 
        title: "Preloved Thrift Shop",
        events: [
            {
                name: "Donation Drive",
                date: "2024-11-18",
                time: "9.00am - 6.00pm",
                description: "Support our community by donating your gently used clothes and accessories. All donors will receive vouchers for future purchases. Join our upcycling workshop at 2pm to learn how to give new life to old clothes. Refreshments provided for all participants."
            }
        ]
    },
    { 
        lat: 1.2927, 
        lng: 103.8510, 
        title: "Cherry Thrift Shop",
        events: [
            {
                name: "Cherry Picks Sale",
                date: "2024-11-22",
                time: "1.00pm - 6.00pm",
                description: "Shop our specially curated collection of premium thrift finds at incredible prices. Each item has been handpicked for quality and style. Special focus on designer bags and accessories. Complimentary authentication service available for luxury items."
            }
        ]
    },
    { 
        lat: 1.3135, 
        lng: 103.8608, 
        title: "Refash",
        events: [
            {
                name: "Designer Labels Day",
                date: "2024-11-28",
                time: "10.00am - 6.00pm",
                description: "Explore our exclusive collection of pre-loved designer items at fraction of their original prices. Featured brands include Coach, Kate Spade, and Michael Kors. Our fashion experts will be available for styling advice. Champagne reception from 6-8pm."
            }
        ]
    },
    { 
        lat: 1.2929, 
        lng: 103.8581, 
        title: "Nightingale Thrift Shop",
        events: [
            {
                name: "Night Shopping",
                date: "2024-12-02",
                time: "6.00pm - 10.00pm",
                description: "Enjoy a relaxed evening of thrift shopping with extended hours until 10pm. Special night-only discounts on all black items. Live acoustic music and light refreshments provided. Perfect opportunity for after-work shopping!"
            }
        ]
    },
    { 
        lat: 1.3024, 
        lng: 103.8398, 
        title: "SSVP Shop",
        events: [
            {
                name: "Charity Sale",
                date: "2024-11-15",
                time: "10.00am - 4.00pm",
                description: "Shop for a cause! All proceeds from this special sale go directly to local charities supporting underprivileged families. Includes both new and pre-loved items. Meet our charity partners and learn about their work. Light refreshments provided."
            }
        ]
    },
    { 
        lat: 1.3693, 
        lng: 103.8494, 
        title: "MINDS Shop",
        events: [
            {
                name: "Community Day",
                date: "2024-11-20",
                time: "11.00am - 4.00pm",
                description: "Join us for a special community day featuring exclusive discounts for all shoppers. Meet our special needs staff and learn about our employment program. Includes handicraft workshop and sharing session. Celebrate inclusivity while shopping!"
            }
        ]
    }
];

async function importLocationsToFirestore() {
    try {
        const locationsRef = collection(db, 'Stores');
        
        for (const location of locations) {
            const locationDoc = await addDoc(locationsRef, {
                ...location,
                createdAt: new Date()
            });
            console.log(`Added location: ${location.title} with ID: ${locationDoc.id}`);
        }

        console.log('All locations with events have been imported successfully!');
    } catch (error) {
        console.error('Error importing locations:', error);
    }
}

// Call the function to start the import
importLocationsToFirestore();