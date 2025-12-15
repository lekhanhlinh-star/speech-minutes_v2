export async function fetchSummary(transcript: string, apiKey: string, language?: string): Promise<any> {
  const url = "https://api.runpod.ai/v2/4uxgfhpty5k26g/runsync";
  const requestConfig = {
    method: "POST",
    headers: {
      "ngrok-skip-browser-warning": "true",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      input: {
        task: "summarize",
        transcript: transcript,
        ...(language ? { language } : {})
      }
    })
  };
  const response = await fetch(url, requestConfig);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}
