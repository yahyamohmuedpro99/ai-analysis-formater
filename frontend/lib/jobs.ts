// Mock API service for jobs data
let mockJobs: any[] = [];

export const jobService = {
  // Get all jobs
  getJobs: async (): Promise<any[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockJobs;
  },

  // Get recent jobs (last 2)
  getRecentJobs: async (): Promise<any[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockJobs.slice(0, 2);
  },

  // Add a new job
  addJob: async (job: any): Promise<any> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    mockJobs.unshift(job);
    return job;
  },

  // Delete a job
  deleteJob: async (jobId: string): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    mockJobs = mockJobs.filter(job => job.id !== jobId);
  },

  // Initialize with some mock data
  initialize: () => {
    mockJobs = [
      {
        id: '1',
        text: "Artificial intelligence is transforming the world in unprecedented ways. From healthcare to transportation, AI is revolutionizing industries and improving efficiency.",
        status: 'completed',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        completedAt: new Date(Date.now() - 86300000).toISOString(),
        result: {
          sentiment: 'positive',
          positiveScore: 75,
          neutralScore: 20,
          negativeScore: 5,
          keywords: ['artificial', 'intelligence', 'transformation'],
          summary: 'AI is transforming industries and improving efficiency.'
        }
      },
      {
        id: '2',
        text: "The future of work is being reshaped by automation and AI technologies. While this brings opportunities, it also raises concerns about job displacement.",
        status: 'completed',
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        completedAt: new Date(Date.now() - 172700000).toISOString(),
        result: {
          sentiment: 'neutral',
          positiveScore: 40,
          neutralScore: 50,
          negativeScore: 10,
          keywords: ['future', 'work', 'automation'],
          summary: 'Automation and AI are reshaping the future of work with both opportunities and concerns.'
        }
      }
    ];
  }
};

// Initialize with mock data
jobService.initialize();