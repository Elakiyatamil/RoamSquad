require('dotenv').config();
const prisma = require('../utils/prisma');

const SOUTH_INDIAN_PACKAGES = [
  {
    name: 'Kerala Backwaters & Tea Gardens Escapade',
    daysCount: 5,
    totalPrice: 18500,
    amount: 18500,
    pricePerPax: 18500,
    priceUnit: 'PER PERSON',
    vibe: 'Nature & Relaxation',
    tag: 'BESTSELLER',
    coverImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=80',
    image_url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=80',
    highlights: ['Alleppey Luxury Houseboat Stay', 'Munnar Tea Estate Trek', 'Kathakali Cultural Show', 'Kumarakom Sunset Cruise'],
    description: 'Immerse yourself in God\'s Own Country. Sail through the tranquil backwaters of Alleppey, wander in misty Munnar tea hills, and savour authentic Kerala cuisine served on banana leaves.',
    inclusions: ['4 Nights Luxury Stay (including 1 Night Deluxe Houseboat)', 'Daily Breakfast & Houseboat All Meals', 'Private AC Sedan for transfers & sightseeing', 'Tea Plantation Guide Fee', 'All Tolls, Parking & Driver Allowances'],
    exclusions: ['Airfare / Train tickets', 'Personal expenses & tips', 'Any camera/entry fees at monuments', 'GST 5%'],
    terms: 'Booking requires 30% advance. Free cancellation up to 7 days before departure date.',
    isActive: true,
    itineraryType: 'STRUCTURED',
    itineraryDays: [
      {
        dayNumber: 1,
        locationName: 'Kochi to Munnar',
        dayTheme: 'Scenic Drive & Spice Plantations',
        transportType: 'PRIVATE_BUS',
        transportNote: 'Private AC Transfer from Kochi Airport/Railway Station',
        activities: [
          { activityTime: 'MORNING', activityType: 'TRAVEL', description: 'Arrival at Kochi and scenic drive to Munnar passing Cheeyappara Waterfalls.', isHighlight: false },
          { activityTime: 'AFTERNOON', activityType: 'SIGHTSEEING', description: 'Visit Valara Waterfalls and spice garden tour with fresh cardamom tasting.', isHighlight: true },
          { activityTime: 'NIGHT_STAY', activityType: 'MEAL', description: 'Check-in to Tea Valley Resort Munnar and traditional Kerala dinner.', isHighlight: false }
        ]
      },
      {
        dayNumber: 2,
        locationName: 'Munnar Exploration',
        dayTheme: 'Tea Estates & Wildlife Safari',
        transportType: 'NONE',
        activities: [
          { activityTime: 'MORNING', activityType: 'ACTIVITY', description: 'Early morning trek through Lockhart Tea Estate and tea processing museum tour.', isHighlight: true },
          { activityTime: 'AFTERNOON', activityType: 'SIGHTSEEING', description: 'Eravikulam National Park safari to spot rare Nilgiri Tahr goats.', isHighlight: true },
          { activityTime: 'EVENING', activityType: 'SIGHTSEEING', description: 'Sunset view at Mattupetty Dam and Echo Point boating.', isHighlight: false }
        ]
      },
      {
        dayNumber: 3,
        locationName: 'Munnar to Thekkady',
        dayTheme: 'Wildlife Sanctuary & Martial Arts',
        transportType: 'PRIVATE_BUS',
        activities: [
          { activityTime: 'MORNING', activityType: 'TRAVEL', description: 'Drive to Thekkady through winding cardamom hills.', isHighlight: false },
          { activityTime: 'AFTERNOON', activityType: 'SIGHTSEEING', description: 'Periyar Tiger Reserve boat safari to observe wild elephants.', isHighlight: true },
          { activityTime: 'EVENING', activityType: 'ACTIVITY', description: 'Live Kalaripayattu (ancient martial art) and Kathakali performance.', isHighlight: true }
        ]
      },
      {
        dayNumber: 4,
        locationName: 'Thekkady to Alleppey',
        dayTheme: 'Houseboat Backwater Cruise',
        transportType: 'PRIVATE_BUS',
        activities: [
          { activityTime: 'MORNING', activityType: 'TRAVEL', description: 'Transfer to Alleppey jetty and check-in to private traditional Kettuvallam houseboat.', isHighlight: true },
          { activityTime: 'AFTERNOON', activityType: 'MEAL', description: 'Fresh Karimeen (Pearlspot fish) fry lunch served as houseboat glides through Vembanad lake.', isHighlight: true },
          { activityTime: 'NIGHT_STAY', activityType: 'MEAL', description: 'Candlelight dinner on stationary houseboat amidst serene starry waters.', isHighlight: true }
        ]
      },
      {
        dayNumber: 5,
        locationName: 'Alleppey to Kochi Departure',
        dayTheme: 'Heritage Fort Kochi & Departure',
        transportType: 'PRIVATE_BUS',
        activities: [
          { activityTime: 'MORNING', activityType: 'MEAL', description: 'Breakfast on houseboat and checkout at 9:00 AM.', isHighlight: false },
          { activityTime: 'AFTERNOON', activityType: 'SIGHTSEEING', description: 'Heritage walk in Fort Kochi: Chinese Fishing Nets, St. Francis Church & Jew Town shopping.', isHighlight: true },
          { activityTime: 'EVENING', activityType: 'TRAVEL', description: 'Drop-off at Kochi Airport / Ernakulam Junction with unforgettable memories.', isHighlight: false }
        ]
      }
    ]
  },

  {
    name: 'Coorg & Chikmagalur Coffee Trail Expedition',
    daysCount: 4,
    totalPrice: 14999,
    amount: 14999,
    pricePerPax: 14999,
    priceUnit: 'PER PERSON',
    vibe: 'Adventure & Coffee Estates',
    tag: 'POPULAR',
    coverImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80',
    image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80',
    highlights: ['Stay inside 100-acre Organic Coffee Estate', 'Mullayanagiri Peak Trek', 'Abbey & Hebbe Falls Offroad Jeep Safari', 'Dubare Elephant Camp Experience'],
    description: 'Awaken your senses on Karnataka\'s legendary coffee trail. Trek to the highest peak in Karnataka, bathe elephants at Dubare, and stay in mist-covered heritage homestays surrounded by fragrant coffee blossoms.',
    inclusions: ['3 Nights Boutique Estate Homestay', 'Daily Breakfast & 2 Authentic Kodava Dinners', 'Offroad 4x4 Jeep Safari to Hebbe Falls', 'Coffee Roasting Workshop & Tasting Session', 'All Sightseeing in Private Vehicle'],
    exclusions: ['Transportation to starting point (Bangalore/Mysore)', 'Personal expenses', 'GST 5%'],
    terms: '20% advance booking amount required.',
    isActive: true,
    itineraryType: 'STRUCTURED',
    itineraryDays: [
      {
        dayNumber: 1,
        locationName: 'Bangalore to Coorg',
        dayTheme: 'Arrival in Scotland of India',
        transportType: 'PRIVATE_BUS',
        activities: [
          { activityTime: 'MORNING', activityType: 'TRAVEL', description: 'Pick up from Bangalore / Mysore and scenic drive towards Madikeri, Coorg.', isHighlight: false },
          { activityTime: 'AFTERNOON', activityType: 'SIGHTSEEING', description: 'Visit Golden Temple (Namdroling Monastery) at Bylakuppe Tibetan settlement.', isHighlight: true },
          { activityTime: 'EVENING', activityType: 'SIGHTSEEING', description: 'Raja\'s Seat sunset viewpoint overlooking western ghat valleys.', isHighlight: false }
        ]
      },
      {
        dayNumber: 2,
        locationName: 'Coorg Wilderness Exploration',
        dayTheme: 'Elephants, Waterfalls & Pandi Curry',
        transportType: 'NONE',
        activities: [
          { activityTime: 'MORNING', activityType: 'ACTIVITY', description: 'Visit Dubare Elephant Camp for river bathing and feeding gentle giants.', isHighlight: true },
          { activityTime: 'AFTERNOON', activityType: 'SIGHTSEEING', description: 'Trek down to Abbey Falls nestled amid dense coffee and spice plantations.', isHighlight: true },
          { activityTime: 'NIGHT_STAY', activityType: 'MEAL', description: 'Traditional Kodava campfire dinner featuring famous Coorg Pandi Curry and Akki Roti.', isHighlight: true }
        ]
      },
      {
        dayNumber: 3,
        locationName: 'Coorg to Chikmagalur',
        dayTheme: 'Peaks & Offroad Jeep Safaris',
        transportType: 'PRIVATE_BUS',
        activities: [
          { activityTime: 'MORNING', activityType: 'TRAVEL', description: 'Scenic drive from Coorg to Chikmagalur, the coffee cradle of India.', isHighlight: false },
          { activityTime: 'AFTERNOON', activityType: 'ADVENTURE_SPORTS', description: '4x4 Offroad Jeep ride up to rugged Hebbe Falls inside Bhadra Wildlife Sanctuary.', isHighlight: true },
          { activityTime: 'EVENING', activityType: 'ACTIVITY', description: 'Guided estate walk learning bean-to-cup coffee processing.', isHighlight: false }
        ]
      },
      {
        dayNumber: 4,
        locationName: 'Mullayanagiri Trek & Departure',
        dayTheme: 'Highest Peak Conquest & Return',
        transportType: 'PRIVATE_BUS',
        activities: [
          { activityTime: 'MORNING', activityType: 'ADVENTURE_SPORTS', description: 'Early morning trek to Mullayanagiri Peak (Karnataka\'s highest peak at 1,930m) for cloudbed views.', isHighlight: true },
          { activityTime: 'AFTERNOON', activityType: 'SIGHTSEEING', description: 'Visit Belur Hoysala temple architecture on the way back.', isHighlight: false },
          { activityTime: 'EVENING', activityType: 'TRAVEL', description: 'Return transfer to Bangalore drop-off.', isHighlight: false }
        ]
      }
    ]
  },

  {
    name: 'Gokarna & Dandeli Coastal Wilderness Odyssey',
    daysCount: 4,
    totalPrice: 12800,
    amount: 12800,
    pricePerPax: 12800,
    priceUnit: 'PER PERSON',
    vibe: 'Beaches & White Water Rafting',
    tag: 'ADVENTURE',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
    highlights: ['5-Beach Coastal Trek (Kudle to Paradise)', 'White Water Rafting on Kali River', 'Jungle Camping & Bonfire', 'Vibhooti Falls Natural Pool Dip'],
    description: 'Experience the ultimate contrast: pristine beach cliffs of Gokarna combined with high-adrenaline jungle rafting in Dandeli. Hike along cliffside trails, sleep under starry beach skies, and ride fierce rapids.',
    inclusions: ['2 Nights Beach Resort Gokarna + 1 Night Jungle Camp Dandeli', 'All Meals in Dandeli + Breakfasts in Gokarna', 'Grade 3 White Water Rafting Gear & Instructor', 'Local Guide for 5-Beach Trek', 'Internal AC Vehicle Transfers'],
    exclusions: ['Personal watersports extras', 'Travel to Goa/Hubli airport', 'GST 5%'],
    terms: 'Rafting subject to river water level conditions.',
    isActive: true,
    itineraryType: 'STRUCTURED',
    itineraryDays: [
      {
        dayNumber: 1,
        locationName: 'Arrival Gokarna',
        dayTheme: 'Cliffside Sunset & Temple Town',
        transportType: 'PRIVATE_BUS',
        activities: [
          { activityTime: 'MORNING', activityType: 'TRAVEL', description: 'Arrival at Gokarna (from Goa / Hubli airport or train). Check-in to Kudle Beach stay.', isHighlight: false },
          { activityTime: 'AFTERNOON', activityType: 'SIGHTSEEING', description: 'Visit ancient Mahabaleshwar Temple and walk along Om Beach.', isHighlight: true },
          { activityTime: 'EVENING', activityType: 'MEAL', description: 'Sunset flea market stroll and beach shack seafood dinner.', isHighlight: false }
        ]
      },
      {
        dayNumber: 2,
        locationName: 'Gokarna Beach Trek',
        dayTheme: '5-Beach Cliff Exploration',
        transportType: 'NONE',
        activities: [
          { activityTime: 'MORNING', activityType: 'ADVENTURE_SPORTS', description: 'Guided cliffside beach trek starting from Kudle Beach -> Om Beach -> Half Moon Beach -> Paradise Beach.', isHighlight: true },
          { activityTime: 'AFTERNOON', activityType: 'ACTIVITY', description: 'Relax at secluded Paradise Beach, boat ride back across blue waters.', isHighlight: true },
          { activityTime: 'EVENING', activityType: 'MEAL', description: 'Acoustic jam session and bonfire at Kudle cliffside cafe.', isHighlight: false }
        ]
      },
      {
        dayNumber: 3,
        locationName: 'Gokarna to Dandeli Forest',
        dayTheme: 'Waterfalls & River Rafting',
        transportType: 'PRIVATE_BUS',
        activities: [
          { activityTime: 'MORNING', activityType: 'TRAVEL', description: 'Drive inland toward Dandeli forest with stopover at secret Vibhooti Waterfalls.', isHighlight: true },
          { activityTime: 'AFTERNOON', activityType: 'ADVENTURE_SPORTS', description: 'Thrilling 9km White Water Rafting on Kali River with Grade 3 rapids.', isHighlight: true },
          { activityTime: 'NIGHT_STAY', activityType: 'ACTIVITY', description: 'Riverside jungle tent camping with buffet dinner and night nature walk.', isHighlight: true }
        ]
      },
      {
        dayNumber: 4,
        locationName: 'Dandeli Zip-line & Departure',
        dayTheme: 'Jungle Canopy & Return',
        transportType: 'PRIVATE_BUS',
        activities: [
          { activityTime: 'MORNING', activityType: 'ADVENTURE_SPORTS', description: 'Jungle coracle ride, ziplining over Kali river & kayaking.', isHighlight: true },
          { activityTime: 'AFTERNOON', activityType: 'TRAVEL', description: 'Check-out and transfer to Hubli / Belgaum / Goa for departure.', isHighlight: false }
        ]
      }
    ]
  },

  {
    name: 'Mystical Hampi & Badami Heritage Sojourn',
    daysCount: 3,
    totalPrice: 11500,
    amount: 11500,
    pricePerPax: 11500,
    priceUnit: 'PER PERSON',
    vibe: 'UNESCO Heritage & Architecture',
    tag: 'HERITAGE',
    coverImage: 'https://images.unsplash.com/photo-1600100397608-f010e423b971?w=1200&q=80',
    image_url: 'https://images.unsplash.com/photo-1600100397608-f010e423b971?w=1200&q=80',
    highlights: ['Vittala Temple Stone Chariot & Musical Pillars', 'Coracle Ride across Tungabhadra River', 'Sunset over Hemakuta Hill', 'Badami Cave Temples & Agastya Lake'],
    description: 'Step back into the golden age of the Vijayanagara Empire. Explore boulder-strewn landscapes, ancient stone chariots, regal royal enclosures, and cliff-carved Chalukyan cave temples.',
    inclusions: ['2 Nights Heritage Resort Stay', 'Daily Breakfast & Special Thali Lunch', 'Licensed ASI Heritage Guide for Hampi & Badami', 'Sunset Coracle Boat Ride', 'AC Private Cab for all Sightseeing'],
    exclusions: ['Monument entry tickets', 'Personal expenses', 'GST 5%'],
    terms: 'Bicycles available for hire on request in Hampi island.',
    isActive: true,
    itineraryType: 'STRUCTURED',
    itineraryDays: [
      {
        dayNumber: 1,
        locationName: 'Arrival Hampi',
        dayTheme: 'Sacred Centre & Sunset Boulders',
        transportType: 'PRIVATE_BUS',
        activities: [
          { activityTime: 'MORNING', activityType: 'TRAVEL', description: 'Arrival at Hosapete / Hampi. Check-in to Heritage Resort.', isHighlight: false },
          { activityTime: 'AFTERNOON', activityType: 'SIGHTSEEING', description: 'Explore Virupaksha Temple, Kadalekalu Ganesha & Lakshmi Narasimha statue.', isHighlight: true },
          { activityTime: 'EVENING', activityType: 'SIGHTSEEING', description: 'Sunset climb up Hemakuta Hill overlooking hundreds of ancient ruined shrines.', isHighlight: true }
        ]
      },
      {
        dayNumber: 2,
        locationName: 'Hampi Royal Centre & Hippie Island',
        dayTheme: 'Stone Chariot & Coracle Ride',
        transportType: 'NONE',
        activities: [
          { activityTime: 'MORNING', activityType: 'SIGHTSEEING', description: 'Guided tour of Vijaya Vittala Temple: Iconic Stone Chariot & 56 Musical Pillars.', isHighlight: true },
          { activityTime: 'AFTERNOON', activityType: 'SIGHTSEEING', description: 'Explore Elephant Stables, Lotus Mahal and Queen\'s Bath inside Royal Enclosure.', isHighlight: false },
          { activityTime: 'EVENING', activityType: 'ACTIVITY', description: 'Cross Tungabhadra River on round coracle boats to Sanapur Lake for sunset cliff jumping.', isHighlight: true }
        ]
      },
      {
        dayNumber: 3,
        locationName: 'Badami Cave Temples & Departure',
        dayTheme: 'Rock-Cut Chalukyan Marvels',
        transportType: 'PRIVATE_BUS',
        activities: [
          { activityTime: 'MORNING', activityType: 'SIGHTSEEING', description: 'Drive to Badami and explore 6th-century rock-cut cave temples & Bhootnath Temple beside Agastya Lake.', isHighlight: true },
          { activityTime: 'AFTERNOON', activityType: 'TRAVEL', description: 'Pattadakal UNESCO cluster tour followed by return drop-off at Hosapete / Hubli.', isHighlight: false }
        ]
      }
    ]
  },

  {
    name: 'Ooty & Kodaikanal Nilgiri Mountain Retreat',
    daysCount: 5,
    totalPrice: 16999,
    amount: 16999,
    pricePerPax: 16999,
    priceUnit: 'PER PERSON',
    vibe: 'Hills & Lakes',
    tag: 'FAMILY FAVORITE',
    coverImage: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=1200&q=80',
    image_url: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=1200&q=80',
    highlights: ['Nilgiri Toy Train Heritage Ride', 'Doddabetta Peak Viewpoint', 'Kodaikanal Star-shaped Lake Boating', 'Pillar Rocks & Pine Forest Walk'],
    description: 'Escape to the Queen of Hill Stations and Princess of Hills. Ride the historic UNESCO mountain railway, stroll through dense eucalyptus pine forests, and sail across tranquil high-altitude lakes.',
    inclusions: ['4 Nights Hilltop Resort Accommodation', 'Daily Breakfast & Dinner', 'UNESCO Nilgiri Mountain Railway Toy Train Tickets', 'Private Vehicle for all Transfers & Excursions', 'Driver Charges, Tolls & Parking'],
    exclusions: ['Airfare/Train to Coimbatore', 'Boat riding tickets at lakes', 'GST 5%'],
    terms: 'Toy train tickets subject to IRCTC availability.',
    isActive: true,
    itineraryType: 'STRUCTURED',
    itineraryDays: [
      {
        dayNumber: 1,
        locationName: 'Coimbatore to Ooty',
        dayTheme: 'Mountain Ascent & Botanical Gardens',
        transportType: 'PRIVATE_BUS',
        activities: [
          { activityTime: 'MORNING', activityType: 'TRAVEL', description: 'Pickup from Coimbatore and scenic mountain drive via Mettupalayam ghat roads.', isHighlight: false },
          { activityTime: 'AFTERNOON', activityType: 'SIGHTSEEING', description: 'Visit Government Botanical Gardens boasting 1,000+ exotic plant species.', isHighlight: true },
          { activityTime: 'EVENING', activityType: 'SIGHTSEEING', description: 'Ooty Lake pedal boating and evening street shopping for handmade chocolates.', isHighlight: false }
        ]
      },
      {
        dayNumber: 2,
        locationName: 'Ooty & Coonoor Excursion',
        dayTheme: 'Toy Train Ride & Tea Estates',
        transportType: 'NONE',
        activities: [
          { activityTime: 'MORNING', activityType: 'TRAVEL', description: 'Board the famous UNESCO Toy Train from Ooty to Coonoor through tunnels and bridges.', isHighlight: true },
          { activityTime: 'AFTERNOON', activityType: 'SIGHTSEEING', description: 'Visit Sim\'s Park, Dolphin\'s Nose viewpoint & Highfield Tea Factory.', isHighlight: true },
          { activityTime: 'EVENING', activityType: 'SIGHTSEEING', description: 'Climb Doddabetta Peak (2,637m) for panoramic Nilgiri views.', isHighlight: false }
        ]
      },
      {
        dayNumber: 3,
        locationName: 'Ooty to Kodaikanal',
        dayTheme: 'Valley Transit to Princess of Hills',
        transportType: 'PRIVATE_BUS',
        activities: [
          { activityTime: 'MORNING', activityType: 'TRAVEL', description: 'Picturesque drive from Ooty down to Palani hills and up to Kodaikanal.', isHighlight: false },
          { activityTime: 'AFTERNOON', activityType: 'SIGHTSEEING', description: 'Check-in to Kodai resort and stroll around Bryant Park.', isHighlight: false },
          { activityTime: 'EVENING', activityType: 'SIGHTSEEING', description: 'Sunset walk along Coaker\'s Walk cliffside path.', isHighlight: true }
        ]
      },
      {
        dayNumber: 4,
        locationName: 'Kodaikanal Sights',
        dayTheme: 'Pine Forests & Pillar Rocks',
        transportType: 'NONE',
        activities: [
          { activityTime: 'MORNING', activityType: 'SIGHTSEEING', description: 'Visit Pillar Rocks (three giant 400ft granite boulders) & Guna Caves.', isHighlight: true },
          { activityTime: 'AFTERNOON', activityType: 'ACTIVITY', description: 'Pine Forest photography session & Silver Cascade Waterfalls.', isHighlight: true },
          { activityTime: 'EVENING', activityType: 'ACTIVITY', description: 'Cycling or row-boating around star-shaped Kodai Lake.', isHighlight: false }
        ]
      },
      {
        dayNumber: 5,
        locationName: 'Kodaikanal to Madurai / Coimbatore Departure',
        dayTheme: 'Temple City & Departure',
        transportType: 'PRIVATE_BUS',
        activities: [
          { activityTime: 'MORNING', activityType: 'TRAVEL', description: 'Checkout and drive down to Madurai or Coimbatore.', isHighlight: false },
          { activityTime: 'AFTERNOON', activityType: 'SIGHTSEEING', description: 'Optional visit to historic Madurai Meenakshi Amman Temple before final drop-off.', isHighlight: true }
        ]
      }
    ]
  }
];

const SOUTH_INDIAN_EVENTS = [
  {
    title: 'Wayanad Monsoon Canopy & Waterfall Trek',
    tagline: 'Chase misty waterfalls and pristine rain trails in Western Ghats',
    description: 'Join the RoamSquad community for an exclusive weekend trek in the heart of Wayanad\'s rainforests. Experience secret waterfall pools, misty cloud walks, campfire acoustic sessions, and authentic Malabar feasts cooked by local tribal hosts.',
    venue: 'Chembra Estate Basecamp',
    address: 'Meppadi Road, Wayanad District, Kerala 673577',
    googleMap: 'https://maps.google.com/?q=Chembra+Peak+Wayanad',
    date: new Date('2026-09-12T06:00:00.000Z'),
    startTime: '06:00 AM',
    endTime: '07:00 PM (Next Day)',
    hostName: 'Captain Rahul & Anjali (RoamSquad Trail Leads)',
    contactNumber: '+91 98765 43210',
    emergencyContact: '+91 98765 43211',
    maxAttendees: 25,
    seatsRemaining: 8,
    price: 2499,
    highlights: ['Secret 3-Tier Waterfall Dip', 'Guided Chembra Rainforest Hike', 'Campfire Acoustic Music Night', 'Traditional Malabar Biryani Feast', 'Commemorative RoamSquad Badge & Merch'],
    thingsToBring: ['Good trekking shoes with grip', 'Rain poncho / waterproof jacket', 'Quick-dry clothes (2 pairs)', 'Personal reusable water bottle', 'Headlamp / flashlight'],
    coverImage: 'https://images.unsplash.com/photo-1546841931-7be6765538e1?w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1546841931-7be6765538e1?w=1200&q=80',
      'https://images.unsplash.com/photo-1511497584788-8767611136f6?w=1200&q=80',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80'
    ],
    status: 'PUBLISHED'
  },

  {
    title: 'Gokarna Sunset Cliff & Beach Camping Night',
    tagline: 'Camp under starry skies with acoustic music by the Arabian sea',
    description: 'Unplug from city noise and unwind on Gokarna\'s cliffside! Enjoy beach volleyball, watch golden sunsets over Kudle cliff, indulge in fresh seafood, sing around a roaring beach bonfire, and wake up to the soothing sound of ocean waves.',
    venue: 'Kudle Cliffside Camp',
    address: 'Kudle Beach Road, Gokarna, Karnataka 581326',
    googleMap: 'https://maps.google.com/?q=Kudle+Beach+Gokarna',
    date: new Date('2026-09-26T15:00:00.000Z'),
    startTime: '03:00 PM',
    endTime: '11:00 AM (Next Day)',
    hostName: 'Vikram & RoamSquad Beach Crew',
    contactNumber: '+91 98765 88990',
    emergencyContact: '+91 98765 88991',
    maxAttendees: 30,
    seatsRemaining: 12,
    price: 1999,
    highlights: ['Beachfront Tent Stay (Twin/Triple Sharing)', 'Golden Hour Cliffside Sunset Walk', 'Beach Bonfire & Live Guitarist Jam', 'Barbecue & Seafood Dinner', 'Morning Beach Yoga Session'],
    thingsToBring: ['Beachwear & flip flops', 'Sunscreen & sunglasses', 'Power bank', 'Towel & toiletries', 'Good vibes & acoustic instruments if you play!'],
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
      'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=1200&q=80',
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&q=80'
    ],
    status: 'PUBLISHED'
  },

  {
    title: 'Munnar Tea Trail & Sunrise Peak Campout',
    tagline: 'Wake up to the world\'s highest tea plantation sunrise',
    description: 'Camp atop Kolukkumalai—the highest organic tea estate in the world! Ride 4x4 jeeps up rugged mountain trails, watch the sun rise over an endless sea of clouds, sip piping hot single-origin tea, and explore hidden mountain streams.',
    venue: 'Kolukkumalai Sunrise Basecamp',
    address: 'Bodinayakanur - Munnar Trail, Idukki / Theni Border, Kerala',
    googleMap: 'https://maps.google.com/?q=Kolukkumalai+Tea+Estate',
    date: new Date('2026-10-10T04:00:00.000Z'),
    startTime: '04:00 AM',
    endTime: '02:00 PM (Next Day)',
    hostName: 'Deepak & Kerala Mountaineering Club',
    contactNumber: '+91 94470 12345',
    emergencyContact: '+91 94470 12346',
    maxAttendees: 20,
    seatsRemaining: 5,
    price: 3299,
    highlights: ['4x4 Offroad Jeep Mountain Ascent', 'Famous Cloudbed Sunrise Photography', 'Fresh Tea Tasting at 7,900 ft', 'High-altitude Tent Camping', 'Campfire & Traditional Hot Stew Dinner'],
    thingsToBring: ['Heavy jacket / thermal layer (temps drop to 8°C)', 'Sturdy shoes', 'Camera with extra batteries', 'Personal mug for fresh tea'],
    coverImage: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=1200&q=80',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80'
    ],
    status: 'PUBLISHED'
  },

  {
    title: 'Coorg Coffee Harvest & Offroad Jeep Safari',
    tagline: 'Harvest fresh coffee beans, roast coffee & conquer muddy peaks',
    description: 'Immerse yourself in authentic Kodava coffee culture! Experience hands-on coffee harvesting in private plantations, learn wood-fire roasting techniques, ride rugged 4x4 jeeps through muddy mountain tracks, and enjoy homemade wine and Kodava delicacies.',
    venue: 'Madikeri Estate Trails',
    address: 'Suntikoppa Road, Madikeri, Coorg, Karnataka 571201',
    googleMap: 'https://maps.google.com/?q=Madikeri+Coorg',
    date: new Date('2026-10-24T09:00:00.000Z'),
    startTime: '09:00 AM',
    endTime: '06:00 PM (Next Day)',
    hostName: 'Bopanna (Estate Host) & RoamSquad Leads',
    contactNumber: '+91 98800 11223',
    emergencyContact: '+91 98800 11224',
    maxAttendees: 22,
    seatsRemaining: 9,
    price: 2799,
    highlights: ['Hands-on Coffee Picking & Bean Roasting Workshop', '4x4 Offroad Jeep Track Conquest', 'Kodava Cuisine Lunch (Pandi Curry / Veg Kadambuttu)', 'Homemade Passionfruit & Coffee Wine Tasting', 'Estate Cottage Stay'],
    thingsToBring: ['Clothes you don\'t mind getting dirty', 'Trekking or rubber boots', 'Warm sweater for night', 'Personal water bottle'],
    coverImage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1200&q=80',
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&q=80'
    ],
    status: 'PUBLISHED'
  },

  {
    title: 'Varkala Cliff Acoustic Night & Surfing Camp',
    tagline: 'Ride the Arabian waves by day, chill to acoustic tunes by night',
    description: 'Catch waves with certified surf instructors at Black Beach Varkala! After a thrilling morning in the ocean, chill on the famous red laterite cliff, sample healthy smoothie bowls, and enjoy live acoustic sunset jams with fellow travellers.',
    venue: 'North Cliff Promenade',
    address: 'Varkala Cliff, Thiruvananthapuram District, Kerala 695141',
    googleMap: 'https://maps.google.com/?q=Varkala+Cliff',
    date: new Date('2026-11-07T07:00:00.000Z'),
    startTime: '07:00 AM',
    endTime: '05:00 PM (Next Day)',
    hostName: 'Alex (ISA Certified Surf Coach) & RoamSquad Crew',
    contactNumber: '+91 97450 99887',
    emergencyContact: '+91 97450 99888',
    maxAttendees: 18,
    seatsRemaining: 6,
    price: 2999,
    highlights: ['2 Beginner-Friendly Surfing Lessons with Boards Provided', 'Clifftop Sunset Acoustic Jam', 'Healthy Smoothie Bowl & Fresh Juice Breakfast', 'Cliffside Boutique Stay', 'GoPro Surfing Action Shots Included'],
    thingsToBring: ['Swimwear / rashguards', 'Waterproof sunscreen (SPF 50+)', 'Sunglasses', 'Change of casual clothes'],
    coverImage: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1200&q=80',
      'https://images.unsplash.com/photo-1455729552865-3ef5885ab65d?w=1200&q=80'
    ],
    status: 'PUBLISHED'
  }
];

async function seedPackagesAndEvents() {
  console.log('🚀 Starting Seeding of Packages & South Indian Events...');

  // 1. Seed Packages
  for (const pkgData of SOUTH_INDIAN_PACKAGES) {
    const { itineraryDays, ...corePkg } = pkgData;

    // Delete existing package by name if it exists to allow re-seeding cleanly
    await prisma.package.deleteMany({
      where: { name: corePkg.name }
    });

    console.log(`📦 Creating Package: "${corePkg.name}" (${corePkg.daysCount} Days / ₹${corePkg.totalPrice})`);

    const createdPkg = await prisma.package.create({
      data: {
        ...corePkg,
        itineraryDays: {
          create: itineraryDays.map(day => ({
            dayNumber: day.dayNumber,
            locationName: day.locationName,
            dayTheme: day.dayTheme,
            transportType: day.transportType,
            transportNote: day.transportNote,
            activities: {
              create: day.activities.map(act => ({
                activityTime: act.activityTime,
                activityType: act.activityType,
                description: act.description,
                isHighlight: act.isHighlight
              }))
            }
          }))
        }
      }
    });

    console.log(`   ✅ Created Package ID: ${createdPkg.id}`);
  }

  // 2. Seed Events
  for (const evtData of SOUTH_INDIAN_EVENTS) {
    await prisma.event.deleteMany({
      where: { title: evtData.title }
    });

    console.log(`🎉 Creating Event: "${evtData.title}" (Venue: ${evtData.venue})`);

    const createdEvt = await prisma.event.create({
      data: evtData
    });

    console.log(`   ✅ Created Event ID: ${createdEvt.id}`);
  }

  console.log('✨ All South Indian Packages & Events seeded into database successfully!');
}

seedPackagesAndEvents()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
