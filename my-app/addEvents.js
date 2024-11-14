const admin = require("firebase-admin");

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert("C:\\Users\\Tan Kai Ern\\Downloads\\thriftthrive-a28e7-firebase-adminsdk-72u2w-5c5611a7fd.json"),
});

const db = admin.firestore();




// Define the stores and their events (as before)
const stores = [
  {
    title: "THE CARTEL'S VINTAGE STORE",
    events: [
      {
        date: "2024-12-01",
        description: "Join us for an exciting holiday-themed treasure hunt and discover unique vintage finds!",
        name: "Holiday Treasure Hunt",
        time: "11:00 am - 4:00 pm",
      },
    ],
  },
  {
    title: "Vintagewknd",
    events: [
      {
        date: "2024-12-03",
        description: "Explore our latest vintage styles and exclusive collections for the season.",
        name: "Vintage Style Showcase",
        time: "12:00 pm - 5:00 pm",
      },
    ],
  },
  {
    title: "FibresFriction Vintage Store",
    events: [
      {
        date: "2024-12-05",
        description: "Discover one-of-a-kind vintage pieces with our curated event selection.",
        name: "Vintage Collection Drop",
        time: "1:00 pm - 6:00 pm",
      },
    ],
  },
  {
    title: "The Née Vintage Store",
    events: [
      {
        date: "2024-12-07",
        description: "A timeless collection awaits you. Experience vintage fashion at its finest.",
        name: "Vintage Gala",
        time: "2:00 pm - 7:00 pm",
      },
    ],
  },
  {
    title: "oldsowhat vintage shop",
    events: [
      {
        date: "2024-12-09",
        description: "An event for those who appreciate the beauty of classic fashion pieces.",
        name: "Retro Revival",
        time: "10:00 am - 3:00 pm",
      },
    ],
  },
  {
    title: "Tasstore",
    events: [
      {
        date: "2024-12-11",
        description: "Hand-picked vintage styles from around the world. Don’t miss this unique drop!",
        name: "Global Vintage Drop",
        time: "11:00 am - 4:00 pm",
      },
    ],
  },
  {
    title: "Ashitagaaru/明日がある",
    events: [
      {
        date: "2024-12-12",
        description: "Fusing Japanese vintage with modern aesthetics. Discover the best of both worlds.",
        name: "Tokyo Thrift Fest",
        time: "12:00 pm - 5:00 pm",
      },
    ],
  },
  {
    title: "Upcycler Studios",
    events: [
      {
        date: "2024-12-14",
        description: "Revitalized pieces with a modern twist. Be part of the upcycling movement!",
        name: "Eco-Friendly Finds",
        time: "2:00 pm - 7:00 pm",
      },
    ],
  },
  {
    title: "Fairies Aisle",
    events: [
      {
        date: "2024-12-15",
        description: "Step into a magical experience with enchanted vintage clothing and accessories.",
        name: "Enchanted Wardrobe",
        time: "11:00 am - 4:00 pm",
      },
    ],
  },
  {
    title: "Anteiku Studios",
    events: [
      {
        date: "2024-12-17",
        description: "Urban vintage and modern street style collide in our new event series.",
        name: "Urban Vintage Pop-Up",
        time: "1:00 pm - 6:00 pm",
      },
    ],
  },
  {
    title: "SUPERWASTED",
    events: [
      {
        date: "2024-12-18",
        description: "Explore sustainable fashion with reworked and upcycled pieces.",
        name: "Sustainable Style",
        time: "3:00 pm - 8:00 pm",
      },
    ],
  },
  {
    title: "Dustbunny Vintage",
    events: [
      {
        date: "2024-12-19",
        description: "Dig up your own treasure at our exclusive flea market event.",
        name: "Vintage Flea Market",
        time: "12:00 pm - 5:00 pm",
      },
    ],
  },
  {
    title: "Retro Kulture vintage store",
    events: [
      {
        date: "2024-12-20",
        description: "Throwback fashion for all ages. Join us for a blast from the past.",
        name: "Retro Extravaganza",
        time: "10:00 am - 3:00 pm",
      },
    ],
  },
  {
    title: "UN.WASTELANDS",
    events: [
      {
        date: "2024-12-21",
        description: "Shop consciously and explore eco-friendly vintage items with style.",
        name: "Eco Vintage Fair",
        time: "2:00 pm - 7:00 pm",
      },
    ],
  },
  {
    title: "The Corner Shop (杂货店)",
    events: [
      {
        date: "2024-12-22",
        description: "A charming collection of classic finds that bring back memories.",
        name: "Old Town Treasures",
        time: "1:00 pm - 6:00 pm",
      },
    ],
  },
  {
    title: "Woofie's Warehouse $10 thrift Golden Landmark",
    events: [
      {
        date: "2024-12-23",
        description: "Affordable fashion with prices as low as $10. Find your new favorite piece.",
        name: "Thrift for Ten",
        time: "11:00 am - 4:00 pm",
      },
    ],
  },
  {
    title: "REFASH Bugis Junction",
    events: [
      {
        date: "2024-12-24",
        description: "Refresh your wardrobe with discounted vintage gems and designer pieces.",
        name: "Wardrobe Refresh",
        time: "3:00 pm - 8:00 pm",
      },
    ],
  },
  {
    title: "NearesTTen Curated Thrift Store",
    events: [
      {
        date: "2024-12-26",
        description: "An exclusive curated collection awaits. Discover timeless classics.",
        name: "Curated Classics",
        time: "10:00 am - 3:00 pm",
      },
    ],
  },
  {
    title: "Victoria Jomo",
    events: [
      {
        date: "2024-12-27",
        description: "Discover the elegance of vintage luxury at our exclusive sale.",
        name: "Luxury Vintage Sale",
        time: "1:00 pm - 6:00 pm",
      },
    ],
  },
  {
    title: "STAKEOUT",
    events: [
      {
        date: "2024-12-28",
        description: "Stake your claim on the best vintage deals in town. First come, first served.",
        name: "Vintage Claim Sale",
        time: "2:00 pm - 7:00 pm",
      },
    ],
  },
  {
    title: "Archives.VIII",
    events: [
      {
        date: "2024-12-29",
        description: "Timeless pieces with a story. Explore our exclusive archival selection.",
        name: "Archival Showcase",
        time: "11:00 am - 4:00 pm",
      },
    ],
  },
  {
    title: "ThryfSupply",
    events: [
      {
        date: "2024-12-30",
        description: "Curated pieces for the discerning thrifter. Shop unique finds.",
        name: "Curated Thrift",
        time: "12:00 pm - 5:00 pm",
      },
    ],
  },
  {
    title: "REFASH Chinatown Point",
    events: [
      {
        date: "2024-12-31",
        description: "Celebrate the New Year with discounts on all vintage items.",
        name: "New Year’s Vintage Bash",
        time: "3:00 pm - 8:00 pm",
      },
    ],
  },
  {
    title: "Huntstreet Singapore",
    events: [
      {
        date: "2024-12-02",
        description: "Shop the best vintage luxury for a limited time only.",
        name: "Luxury Trunk Show",
        time: "1:00 pm - 6:00 pm",
      },
    ],
  },
  {
    title: "Green Poppies",
    events: [
      {
        date: "2024-12-04",
        description: "A celebration of eco-conscious style with a vintage twist.",
        name: "Green Vintage Gala",
        time: "11:00 am - 4:00 pm",
      },
    ],
  },
  {
    title: "Furimaketto",
    events: [
      {
        date: "2024-12-06",
        description: "Join us for a Japanese-inspired vintage pop-up.",
        name: "Tokyo Thrift Market",
        time: "12:00 pm - 5:00 pm",
      },
    ],
  },
  {
    title: "kaeru thrift store",
    events: [
      {
        date: "2024-12-08",
        description: "Exclusive sale on premium vintage styles. Don’t miss out!",
        name: "Premium Sale",
        time: "10:00 am - 3:00 pm",
      },
    ],
  },
  {
    title: "Woofie's Warehouse Thrift Store Haji Lane",
    events: [
      {
        date: "2024-12-10",
        description: "Come for the thrift, stay for the community. Great finds at unbeatable prices.",
        name: "Thrift Community Day",
        time: "11:00 am - 4:00 pm",
      },
    ],
  },
  {
    title: "Kerbside&Co.",
    events: [
      {
        date: "2024-12-13",
        description: "A unique pop-up with rare and stylish vintage items.",
        name: "Pop-Up Thrift Fest",
        time: "2:00 pm - 7:00 pm",
      },
    ],
  },
  {
    title: "LIOU&LANS Wisma Atria - Women's Clothing",
    events: [
      {
        date: "2024-12-16",
        description: "Vintage elegance for women. A special one-day event.",
        name: "Ladies’ Vintage Day",
        time: "3:00 pm - 8:00 pm",
      },
    ],
  },
  {
    title: "REFASH Plaza Singapura",
    events: [
      {
        date: "2024-12-25",
        description: "Christmas sale on all vintage items. Perfect gifts await!",
        name: "Christmas Vintage Sale",
        time: "12:00 pm - 5:00 pm",
      },
    ],
  },
  {
    title: "WEARE",
    events: [
      {
        date: "2024-12-02",
        description: "A diverse collection of upcycled and vintage fashion.",
        name: "Diversity in Style",
        time: "1:00 pm - 6:00 pm",
      },
    ],
  },
  {
    title: "Thrifteyseconds",
    events: [
      {
        date: "2024-12-03",
        description: "30-second style challenges and flash sales on select items!",
        name: "Flash Style Event",
        time: "10:00 am - 3:00 pm",
      },
    ],
  },
  {
    title: "Honsieponsie",
    events: [
      {
        date: "2024-12-04",
        description: "Sweet vintage finds for every budget. Special deals for everyone.",
        name: "Sweet Thrift Day",
        time: "11:00 am - 4:00 pm",
      },
    ],
  },
  {
    title: "Rehearsal",
    events: [
      {
        date: "2024-12-05",
        description: "Get a sneak peek of next season’s best vintage trends.",
        name: "Next Season Sneak Peek",
        time: "3:00 pm - 8:00 pm",
      },
    ],
  },
  {
    title: "THE DENIM STORE",
    events: [
      {
        date: "2024-12-06",
        description: "All things denim, from vintage jeans to jackets and accessories.",
        name: "Denim Lovers Day",
        time: "12:00 pm - 5:00 pm",
      },
    ],
  },
  {
    title: "Family Thrift Store Tanglin Rd",
    events: [
      {
        date: "2024-12-07",
        description: "Special family deals and finds for all ages.",
        name: "Family Thrift Fest",
        time: "10:00 am - 3:00 pm",
      },
    ],
  },
];


// Function to get the document ID for a store by its title
async function getDocIdByTitle(storeTitle) {
  try {
    const storeRef = db.collection("Stores");
    
    // Query to find the document by the store title
    const querySnapshot = await storeRef.where("title", "==", storeTitle).get();
    
    if (querySnapshot.empty) {
      console.log(`No store found with the title: ${storeTitle}`);
      return null;
    }
    
    let docId = null;
    querySnapshot.forEach(doc => {
      docId = doc.id;  // Get document ID
    });
    
    return docId;
  } catch (error) {
    console.error("Error getting document ID by title:", error);
  }
}

// Function to update events for stores based on title
async function updateEventsForStores() {
  try {
    for (const store of stores) {
      console.log(`Checking events for store: ${store.title}`);

      // Ensure the store document exists
      const docId = await getDocIdByTitle(store.title);
      if (docId) {
        const storeRef = db.collection("Stores").doc(docId); // Get reference to store document

        const storeDoc = await storeRef.get(); // Check if the document exists in Firestore

        if (storeDoc.exists) {
          // The document exists, now overwrite the 'events' field with the new data
          await storeRef.update({
            events: store.events, // Directly overwrite the 'events' field with the new events
          });
          console.log(`Updated events for ${store.title}`);
        } else {
          console.log(`Store document for ${store.title} does not exist.`);
        }
      } else {
        console.log(`Store ${store.title} not found in Firestore.`);
      }
    }

    console.log("All events processed successfully.");
  } catch (error) {
    console.error("Error processing events:", error);
  }
}

// Run the function to update events
updateEventsForStores();