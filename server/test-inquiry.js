async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "kenny",
        email: "kenny8@gmail.com",
        phone: "1234567890",
        startDate: "2026-05-09",
        tripDate: "2026-05-09",
        days: 3,
        people: 2,
        totalBudget: 1800,
        hotelSnapshot: { name: "vtv hotel" },
        foodSnapshot: { name: "veg" },
        itinerarySnapshot: { days: 3 },
        itinerary: { days: 3 }
      })
    });
    const data = await res.json();
    console.log("STATUS:", res.status);
    console.log("RESPONSE:", data);
  } catch (err) {
    console.error("ERROR:", err);
  }
}
test();
