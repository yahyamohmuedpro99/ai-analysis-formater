// Use environment variable for API URL with fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface TextAnalysisRequest {
  text: string;
}

export interface TextAnalysisResponse {
  summary: string;
  sentiment: string;
  keywords: string[];
}

export interface Job {
  id: string;
  userId: string;
  text: string;
  status: "pending" | "completed" | "failed";
  createdAt: string;
  completedAt?: string;
  result?: TextAnalysisResponse;
}

export interface JobsResponse {
  jobs: Job[];
}

export async function analyzeText(text: string, token: string): Promise<{ jobId: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication failed. Please log in again.");
      } else if (response.status === 403) {
        throw new Error("Access denied. You don't have permission to perform this action.");
      } else if (response.status === 400) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Invalid request. Please check your input.");
      } else if (response.status >= 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error(`Request failed: ${response.statusText}`);
      }
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to server at ${API_BASE_URL}. Please check if the server is running.`);
    }
    throw error;
  }
}

export async function getUserJobs(userId: string, token: string): Promise<JobsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/jobs/${userId}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication failed. Please log in again.");
      } else if (response.status === 403) {
        throw new Error("Access denied. You don't have permission to view these jobs.");
      } else if (response.status >= 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error(`Failed to fetch jobs: ${response.statusText}`);
      }
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to server at ${API_BASE_URL}. Please check if the server is running.`);
    }
    throw error;
  }
}
