const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Upload audio (POST)
export async function uploadAudioFile(file: File) {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_BASE_URL}/audio`, {
    method: "POST",
    headers: {
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
      "accept": "application/json",
      ...(token ? { token } : {})
    }
  });
  return response;
}
// Delete audio by audio_id (DELETE)
export async function deleteAudioById(audio_id: string) {
  const token = localStorage.getItem("token");
  const url = `${API_BASE_URL}/audio/${audio_id}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
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
      "accept": "application/json",
      ...(token ? { token } : {})
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}
// Get summary by audio_id (GET)
export async function getSummaryByAudioId(audio_id: string) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/summarize/audio/${audio_id}/`, {
    method: "GET",
    headers: {
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
      "Content-Type": "multipart/form-data",
      "accept": "application/json"
    }
  });
  return response.data;
}
