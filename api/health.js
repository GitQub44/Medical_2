  // Add to the very top of each API file
if (req.method === 'OPTIONS') {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  return res.status(200).end();
}

// Add to all responses
res.setHeader('Access-Control-Allow-Origin', '*');
  // Handles POST /api/health/pressure
const pressureData = []; // Temporary storage (replace with a DB)

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { systolic, diastolic, pulse } = req.body;
    pressureData.push({ systolic, diastolic, pulse, date: new Date() });
    return res.status(200).json({ message: "Data saved!" });
  } 
  else if (req.method === 'GET') {
    return res.status(200).json(pressureData);
  } 
  else {
    res.status(405).json({ error: "Method not allowed" });
  }
};