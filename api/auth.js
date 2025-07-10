module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // In production: Add database storage here
    console.log("New user:", { name, email, role }); // Debug log

    return res.json({ 
      success: true,
      message: "Registration successful!",
      user: { name, email, role } 
    });
    
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
};