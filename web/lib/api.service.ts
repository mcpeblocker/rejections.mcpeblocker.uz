import { API_BASE_URL } from "@/api";

// Type definitions
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  username: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Rejection {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  title: string;
  content: string;
  emailId: string | null;
  sender: string | null;
  timestamp: string | null;
  reason: string | null;
}

export interface LoginResponse {
  success: boolean;
  authToken?: string;
  error?: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface MeResponse {
  success: boolean;
  user?: UserProfile;
  error?: string;
}

export interface RejectionsCountResponse {
  count: number;
}

export interface RejectionCheckResponse {
  exists: boolean;
}

export interface LogRejectionResponse {
  message: string;
  rejectionId: string;
}

export interface RejectionDetails {
  title: string;
  category: string | null;
  content?: string;
  description?: string;
  reflections?: string;
}

/**
 * API Service class for handling all API interactions
 */
class APIService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Get auth token from localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  }

  /**
   * Get headers with auth token if available
   */
  private getHeaders(includeAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Handle fetch errors
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // ==================== AUTH ENDPOINTS ====================

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return this.handleResponse<LoginResponse>(response);
  }

  /**
   * Register new user
   */
  async register(email: string, password: string): Promise<RegisterResponse> {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return this.handleResponse<RegisterResponse>(response);
  }

  /**
   * Get current user profile
   */
  async getMe(): Promise<MeResponse> {
    const response = await fetch(`${this.baseURL}/auth/me`, {
      method: "GET",
      headers: this.getHeaders(true),
    });
    return this.handleResponse<MeResponse>(response);
  }

  /**
   * Update user profile (name and username)
   */
  async updateProfile(name: string, username: string): Promise<MeResponse> {
    const response = await fetch(`${this.baseURL}/auth/profile`, {
      method: "PATCH",
      headers: this.getHeaders(true),
      body: JSON.stringify({ name, username }),
    });
    return this.handleResponse<MeResponse>(response);
  }

  /**
   * Change user password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseURL}/auth/change-password`, {
      method: "POST",
      headers: this.getHeaders(true),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  /**
   * Delete user account
   */
  async deleteAccount(password: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseURL}/auth/account`, {
      method: "DELETE",
      headers: this.getHeaders(true),
      body: JSON.stringify({ password }),
    });
    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  // ==================== REJECTIONS ENDPOINTS ====================

  /**
   * Get all rejections for current user
   */
  async getRejections(): Promise<Rejection[]> {
    const response = await fetch(`${this.baseURL}/rejections/`, {
      method: "GET",
      headers: this.getHeaders(true),
    });
    return this.handleResponse<Rejection[]>(response);
  }

  /**
   * Get rejections count
   */
  async getRejectionsCount(): Promise<RejectionsCountResponse> {
    const response = await fetch(`${this.baseURL}/rejections/count`, {
      method: "GET",
      headers: this.getHeaders(true),
    });
    return this.handleResponse<RejectionsCountResponse>(response);
  }

  /**
   * Check if rejection exists by email ID
   */
  async checkRejection(emailId: string): Promise<RejectionCheckResponse> {
    const response = await fetch(`${this.baseURL}/rejections/check?emailId=${emailId}`, {
      method: "GET",
      headers: this.getHeaders(true),
    });
    return this.handleResponse<RejectionCheckResponse>(response);
  }

  /**
   * Log rejection from email
   */
  async logRejectionFromEmail(data: {
    emailId: string;
    subject: string;
    content?: string;
    sender?: string;
    timestamp?: string;
    reason: string;
  }): Promise<LogRejectionResponse> {
    const response = await fetch(`${this.baseURL}/rejections/log-from-email`, {
      method: "POST",
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<LogRejectionResponse>(response);
  }

  /**
   * Log rejection from website
   */
  async logRejectionFromWebsite(data: RejectionDetails): Promise<LogRejectionResponse> {
    const response = await fetch(`${this.baseURL}/rejections/log-from-website`, {
      method: "POST",
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<LogRejectionResponse>(response);
  }

  // ==================== LOCAL STORAGE HELPERS ====================

  /**
   * Save auth token to localStorage
   */
  saveAuthToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
    }
  }

  /**
   * Remove auth token from localStorage
   */
  clearAuthToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  /**
   * Save rejection to local storage (for syncing later)
   */
  saveRejectionLocally(rejection: RejectionDetails): void {
    if (typeof window === "undefined") return;
    
    const existingRejections = localStorage.getItem("rejection_experiences");
    let rejectionsArray: RejectionDetails[] = [];
    
    if (existingRejections) {
      rejectionsArray = JSON.parse(existingRejections);
    }
    
    rejectionsArray.push(rejection);
    localStorage.setItem("rejection_experiences", JSON.stringify(rejectionsArray));
  }

  /**
   * Sync local rejections to server
   */
  async syncLocalRejections(): Promise<void> {
    if (typeof window === "undefined") return;
    
    const existingRejections = localStorage.getItem("rejection_experiences");
    if (!existingRejections) return;

    const rejectionsArray: RejectionDetails[] = JSON.parse(existingRejections);

    for (const rejection of rejectionsArray) {
      try {
        await this.logRejectionFromWebsite(rejection);
      } catch (error) {
        console.error("Error syncing rejection:", rejection, error);
      }
    }

    // Clear local storage after syncing
    localStorage.removeItem("rejection_experiences");
  }

  // ==================== PUBLIC ENDPOINTS ====================

  /**
   * Get public profile by username (no auth required)
   */
  async getPublicProfile(username: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/public/profile/${username}`, {
      method: "GET",
      headers: this.getHeaders(false),
    });
    return this.handleResponse<any>(response);
  }

  /**
   * Get public rejection by ID (no auth required)
   */
  async getPublicRejection(id: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/public/rejection/${id}`, {
      method: "GET",
      headers: this.getHeaders(false),
    });
    return this.handleResponse<any>(response);
  }

  /**
   * Search for users by username or name (no auth required)
   */
  async searchUsers(query: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/public/search?q=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: this.getHeaders(false),
    });
    return this.handleResponse<any>(response);
  }
}

// Export singleton instance
export const apiService = new APIService();
