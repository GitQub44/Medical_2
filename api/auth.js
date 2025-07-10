// Handles POST /api/auth/register
module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { name, email, password, role } = req.body;

    // Validate input (add your logic)
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // In a real app, save to a database (e.g., Firebase, MongoDB)
    const user = { name, email, password, role };

    return res.status(200).json({ 
      message: "Registration successful!", 
      user 
    });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};