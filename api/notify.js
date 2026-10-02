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
    // FIX 1: Pointing to the actual REST API event trigger endpoint
    const response = await fetch("https://api.novu.co/v1/events/trigger", {
      method: "POST",
      headers: {
        "Authorization": `ApiKey ${process.env.NOVU_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // FIX 2: Rest API uses 'name' for the workflow identifier mapping
        name: process.env.NOVU_WORKFLOW_ID, 
        to: { 
          subscriberId: subscriberId 
        },
        payload: { 
          message: message || "Hello from HTML!" 
        }
      }),
    });

    // Check if content-type is json before parsing to prevent unhandled HTML parsing errors
    const contentType = response.headers.get("content-type");
    let data = {};
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const textError = await response.text();
      return res.status(response.status).json({
        success: false,
        error: `Received non-JSON response from server: ${textError.substring(0, 100)}`
      });
    }

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
