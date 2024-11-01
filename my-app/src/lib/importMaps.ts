import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

const locations = [
    { 
        lat: 1.2990, 
        lng: 103.8547, 
        title: "New2U Thrift Shop",
        events: [
            {
                name: "Fashion Exchange",
                date: "2024-11-29",
                time: "10.00am - 5.00pm",
                description: "Participate in our fashion exchange event! Bring in your gently used clothing and exchange them for new-to-you styles. Meet fellow fashion enthusiasts and enjoy refreshments while you shop!"
            },
            {
                name: "DIY Accessory Workshop",
                date: "2024-11-22",
                time: "1.00pm - 3.00pm",
                description: "Join us for a hands-on workshop where you can create your own accessories from upcycled materials. All materials will be provided, and you'll leave with a unique piece!"
            }
        ]
    },
    { 
        lat: 1.3015, 
        lng: 103.8580, 
        title: "Flame Vintage",
        events: [
            {
                name: "Retro Night",
                date: "2024-11-16",
                time: "7.00pm - 11.00pm",
                description: "Step back in time for our retro night! Dress in your favorite vintage style and enjoy a night of music, dancing, and exclusive discounts on all vintage items. Prizes for the best-dressed attendees!"
            },
            {
                name: "Vintage Style Consultation",
                date: "2024-11-18",
                time: "3.00pm - 6.00pm",
                description: "Get personalized style advice from our vintage experts! Book your spot for a one-on-one consultation to revamp your wardrobe with timeless pieces."
            }
        ]
    },
    { 
        lat: 1.2931, 
        lng: 103.8558, 
        title: "Style Tribute",
        events: [
            {
                name: "Fashion Swap",
                date: "2024-11-19",
                time: "12.00pm - 5.00pm",
                description: "Join us for a fun fashion swap! Bring your gently used clothing and swap them for something new. Enjoy refreshments and styling tips while meeting fellow fashion enthusiasts."
            },
            {
                name: "Sustainable Fashion Talk",
                date: "2024-11-25",
                time: "4.00pm - 6.00pm",
                description: "Attend our informative talk on sustainable fashion practices and how to make a positive impact through your wardrobe choices."
            }
        ]
    },
    { 
        lat: 1.2903, 
        lng: 103.8048, 
        title: "Daisy’s Yard",
        events: [
            {
                name: "Daisy’s Thrift Fair",
                date: "2024-11-14",
                time: "10.00am - 4.00pm",
                description: "Shop at Daisy's Thrift Fair featuring a wide range of vintage clothing and accessories. Enjoy special discounts for early birds and participate in our lucky draw for fabulous prizes!"
            },
            {
                name: "Community Craft Day",
                date: "2024-11-26",
                time: "11.00am - 3.00pm",
                description: "Bring your creativity to life at our community craft day! Participate in various crafting activities and enjoy a relaxing day of creativity and connection."
            }
        ]
    },
    { 
        lat: 1.3065, 
        lng: 103.9029, 
        title: "A Vintage Tale",
        events: [
            {
                name: "Storytelling Fashion Day",
                date: "2024-11-23",
                time: "1.00pm - 6.00pm",
                description: "Discover the stories behind vintage pieces! Join us for a day of storytelling, showcasing unique items from different eras. Special offers on featured pieces and complimentary refreshments."
            },
            {
                name: "Vintage Fashion Show",
                date: "2024-12-01",
                time: "2.00pm - 5.00pm",
                description: "Experience the charm of vintage fashion in our special fashion show! Enjoy live music, refreshments, and a chance to win exciting prizes."
            }
        ]
    },
    { 
        lat: 1.3138, 
        lng: 103.8551, 
        title: "Refash",
        events: [
            {
                name: "Style Revamp Workshop",
                date: "2024-12-10",
                time: "3.00pm - 6.00pm",
                description: "Learn how to revamp your wardrobe sustainably! Join our workshop where you'll get hands-on tips on styling, upcycling, and caring for your clothes. All materials will be provided."
            },
            {
                name: "Refashion Challenge",
                date: "2024-12-05",
                time: "12.00pm - 4.00pm",
                description: "Join our refashion challenge! Create a new look from old garments and showcase your creativity. Prizes for the most innovative designs!"
            }
        ]
    },
    { 
        lat: 1.3483, 
        lng: 103.9355, 
        title: "Something Old, Something New",
        events: [
            {
                name: "Holiday Thrift Sale",
                date: "2024-12-15",
                time: "10.00am - 5.00pm",
                description: "Get into the holiday spirit with our special thrift sale! Enjoy discounts on a curated selection of vintage and modern pieces. Join our festive atmosphere with live music and seasonal treats."
            },
            {
                name: "New Year’s Resolutions Swap",
                date: "2024-12-30",
                time: "2.00pm - 6.00pm",
                description: "Start the new year right! Join our resolutions swap and share your fashion goals while exchanging items with others to refresh your wardrobe."
            }
        ]
    },
    { 
        lat: 1.3039, 
        lng: 103.8345, 
        title: "Shop+ (Red Cross)",
        events: [
            {
                name: "Charity Fashion Show",
                date: "2024-11-27",
                time: "2.00pm - 5.00pm",
                description: "Support a good cause at our charity fashion show featuring clothing from Shop+! Enjoy an afternoon of style and entertainment while contributing to Red Cross initiatives."
            },
            {
                name: "Volunteering Day",
                date: "2024-12-12",
                time: "10.00am - 4.00pm",
                description: "Join us for a day of volunteering at Shop+! Help organize donations and meet other community-minded individuals while making a difference."
            }
        ]
    },
    { 
        lat: 1.3070, 
        lng: 103.8560, 
        title: "Loop Garms",
        events: [
            {
                name: "Eco Fashion Day",
                date: "2024-11-30",
                time: "11.00am - 4.00pm",
                description: "Join us for Eco Fashion Day! Discover sustainable fashion practices, shop our eco-friendly collection, and attend talks on conscious consumerism. Enjoy snacks and meet like-minded individuals!"
            },
            {
                name: "Recycling Fashion Challenge",
                date: "2024-12-02",
                time: "1.00pm - 3.00pm",
                description: "Put your creativity to the test in our recycling fashion challenge! Use recycled materials to create a fashion piece and showcase your design skills."
            }
        ]
    },
    { 
        lat: 1.3040, 
        lng: 103.8315, 
        title: "Lucky Plaza Bazaar",
        events: [
            {
                name: "Lucky Bazaar Weekend",
                date: "2024-12-05",
                time: "10.00am - 6.00pm",
                description: "Don't miss the Lucky Bazaar Weekend filled with unique finds! Shop from various vendors offering vintage clothing, handmade crafts, and more. Enjoy fun activities and performances throughout the day."
            },
            {
                name: "Cultural Fashion Day",
                date: "2024-12-11",
                time: "12.00pm - 5.00pm",
                description: "Celebrate the diversity of fashion at our Cultural Fashion Day! Enjoy traditional performances, food stalls, and a showcase of clothing from various cultures."
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