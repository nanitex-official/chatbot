import { RequestHandler } from "express";

interface ChatRequest {
  message: string;
}

interface ChatResponse {
  reply?: string;
  message?: string;
  error?: string;
}

export const handleChat: RequestHandler = async (
  req,
  res
): Promise<void> => {
  const { message } = req.body as ChatRequest;

  // Validate input
  if (!message || typeof message !== "string" || !message.trim()) {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  // Check for n8n webhook URL
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) {
    res.status(500).json({
      error:
        "N8N_WEBHOOK_URL is not configured. Please set it in your environment variables.",
    });
    return;
  }

  try {
    // Forward the message to the n8n webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: message.trim() }),
    });

    if (!response.ok) {
      throw new Error(
        `n8n webhook returned status ${response.status}: ${response.statusText}`
      );
    }

    const data: ChatResponse = await response.json();

    // Return the response to the client
    res.json(data);
  } catch (error) {
    console.error("Chat API error:", error);

    const errorMsg =
      error instanceof Error
        ? error.message
        : "Failed to process your message";

    res.status(500).json({
      error: errorMsg,
      message: "Unable to reach the chat service. Please try again later.",
    });
  }
};
