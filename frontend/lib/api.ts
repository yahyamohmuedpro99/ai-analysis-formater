// Use environment variable for API URL with fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface TextAnalysisRequest {
  text: string;
}

export interface TextAnalysisResponse {
  summary: string;
  sentiment: string;
  positiveScore: number;
  neutralScore: number;
  negativeScore: number;
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
  total: number;
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

export async function deleteJob(jobId: string, token: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication failed. Please log in again.");
      } else if (response.status === 403) {
        throw new Error("Access denied. You don't have permission to delete this job.");
      } else if (response.status >= 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error(`Failed to delete job: ${response.statusText}`);
      }
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to server at ${API_BASE_URL}. Please check if the server is running.`);
    }
    throw error;
  }
}

export async function getUserJobs(userId: string, token: string, page: number = 1, limit: number = 5, search: string = ''): Promise<JobsResponse> {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);

    const response = await fetch(`${API_BASE_URL}/api/jobs/${userId}?${params.toString()}`, {
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

export async function getSingleJob(jobId: string, token: string): Promise<Job> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/job/${jobId}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication failed. Please log in again.");
      } else if (response.status === 403) {
        throw new Error("Access denied. You don't have permission to view this job.");
      } else if (response.status === 404) {
        throw new Error("Job not found.");
      } else if (response.status >= 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error(`Failed to fetch job: ${response.statusText}`);
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
