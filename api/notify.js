export default async function handler(req, res) {
  // Handle CORS
  res.setHeader("Access-Control-Allow-Origin", "*"); 
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { subscriberId, message } = req.body;

  // Quick validation
  if (!subscriberId) {
    return res.status(400).json({ success: false, error: "Missing subscriberId" });
  }

  try {
    // FIX: Changed from 'https://novu.co' to the correct trigger endpoint
    const response = await fetch("https://novu.co", {
      method: "POST",
      headers: {
        "Authorization": `ApiKey ${process.env.NOVU_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: process.env.NOVU_WORKFLOW_ID, // Ensure this environment variable matches your workflow identifier
        to: { 
          subscriberId: subscriberId 
        },
        payload: { 
          message: message || "Hello from HTML!" 
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        success: false, 
        error: data.message || "Failed to trigger notification via Novu API." 
      });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
