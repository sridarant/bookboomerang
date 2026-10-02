// api/notify.js
export default async function handler(req, res) {
  // Allow your own domain to access this endpoint
  res.setHeader("Access-Control-Allow-Origin", "*"); 
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { subscriberId, message } = req.body;

  try {
    const response = await fetch("https://novu.co", {
      method: "POST",
      headers: {
        "Authorization": `ApiKey ${process.env.NOVU_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: process.env.NOVU_WORKFLOW_ID,
        to: { subscriberId },
        payload: { message: message || "Hello from HTML!" }
      }),
    });

    const data = await response.json();
    return res.status(200).json({ success: response.ok, data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
