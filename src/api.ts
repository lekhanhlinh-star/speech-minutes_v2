const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://speech-minute.onrender.com';

console.log('API_BASE_URL:', API_BASE_URL); // Debug log

// Upload audio (POST)
export async function uploadAudioFile(
  file: File,
  language: string,
  diarization: boolean = false,
  hotwords: string[] | null = null
) {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("file", file);

  // Append hotwords as repeated form entries so FastAPI can parse List[str]
  if (hotwords && Array.isArray(hotwords)) {
    for (const hw of hotwords) {
      // skip empty strings
      if (hw && hw.toString().trim() !== "") {
        formData.append("hotwords", hw.toString());
      }
    }
  }

  // Send language/diarization in the multipart form so backend Form parsing works
  formData.append('language', language);
  formData.append('diarization', diarization ? 'true' : 'false');

  const response = await fetch(`${API_BASE_URL}/audio`, {
    method: "POST",
    headers: {
      "ngrok-skip-browser-warning": "true",
      "accept": "application/json",
      ...(token ? { token } : {})
    },
    body: formData
  });
  return response;
}
// Register user (POST)
export async function registerUser(username: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/register/`, {
    method: "POST",
    headers: {
      "ngrok-skip-browser-warning": "true",
      "accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password })
  });
  return response;
}
// Login (POST)
export async function login(username: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/login/`, {
    method: "POST",
    headers: {
      "ngrok-skip-browser-warning": "true",
      "accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password })
  });
  return response;
}
// Get audio list (GET)
export async function getAudioList() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/audio`, {
    method: "GET",
    headers: {
      "ngrok-skip-browser-warning": "true",
      "accept": "application/json",
      ...(token ? { token } : {})
    }
  });
  // const data = await response.json();
  // console.log("getAudioList response:", data);
  return response;
}
// Delete audio by audio_id (DELETE)
export async function deleteAudioById(audio_id: string) {
  const token = localStorage.getItem("token");
  const url = `${API_BASE_URL}/audio/${audio_id}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "ngrok-skip-browser-warning": "true",
      "accept": "application/json",
      ...(token ? { token } : {})
    }
  });
  return response;
}
// Get transcript by audio_id (GET)
export async function getTranscriptByAudioId(audio_id: string) {
  const token = localStorage.getItem("token");
  const url = `${API_BASE_URL}/transcribe/audio/${audio_id}/`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "ngrok-skip-browser-warning": "true",
      "accept": "application/json",
      ...(token ? { token } : {})
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  // console.log("getTranscriptByAudioId response:", await response.json());
  return await response.json();
}
// Get summary by audio_id (GET)
export async function getSummaryByAudioId(audio_id: string) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/summarize/audio/${audio_id}/`, {
    method: "GET",
    headers: {
      "ngrok-skip-browser-warning": "true",
      "accept": "application/json",
      ...(token ? { token } : {})
    }
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}
// Summarize backend audio by audio_id
export async function summarizeAudioById(audio_id: string, language: string = "en") {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams();
  params.append("audio_id", audio_id);
  params.append("language", language);
  const response = await axios.post(`${API_BASE_URL}/summarize/`, params, {
    headers: {
      "ngrok-skip-browser-warning": "true",
      "Content-Type": "application/x-www-form-urlencoded",
      "accept": "application/json",
      ...(token ? { token } : {})
    }
  });
  console.log("summarizeAudioById response:", response.data);
  return response.data;
}
// Summarize transcript using external API
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
// Transcribe backend audio by audio_id
export async function transcribeAudioById(audio_id: string, language: string = "en") {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams();
  params.append("audio_id", audio_id);
  params.append("language", language);
  const response = await axios.post(`${API_BASE_URL}/transcribe/`, params, {
    headers: {
      "ngrok-skip-browser-warning": "true",
      "Content-Type": "application/x-www-form-urlencoded",
      "accept": "application/json",
      ...(token ? { token } : {})
    }
  });
  return response.data;
}
import axios from "axios";
export async function transcribeAudio(file: File, language: string = "en") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("language", language);
  const response = await axios.post(`${API_BASE_URL}/transcribe/`, formData, {
    headers: {
      "ngrok-skip-browser-warning": "true",
      "Content-Type": "multipart/form-data",
      "accept": "application/json"
    }
  });
  return response.data;
}

// Chat with summary (POST)
export async function chatWithSummary(audioId: string, userMessage: string) {
  console.log("chatWithSummary called with:", audioId, userMessage);
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("audio_id", audioId);
  formData.append("user_message", userMessage);
  
  const response = await fetch(`${API_BASE_URL}/chat/`, {
    method: "POST",
    headers: {
      "ngrok-skip-browser-warning": "true",
      "accept": "application/json",
      ...(token ? { token } : {})
    },
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}
