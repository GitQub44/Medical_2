// Handles POST /api/chat
module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { message } = req.body;
    let reply = "I didn't understand that.";

    // Simple AI responses (replace with a real NLP service if needed)
    if (message.includes("pressure")) reply = "Normal blood pressure is 120/80 mmHg.";
    if (message.includes("BMI")) reply = "BMI is calculated as weight (kg) / height² (m).";

    return res.status(200).json({ reply });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};