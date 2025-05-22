import axios from 'axios';

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface IRacingProfile {
  cust_id: number;
  email: string;
  display_name: string;
  // Add more fields as needed
}

export interface RaceResult {
  subsession_id: number;
  name: string;
  track: {
    track_name: string;
    config_name: string;
  };
  session_start_time: string;
  session_end_time: string;
  results: {
    cust_id: number;
    display_name: string;
    finish_position: number;
    finish_position_in_class: number;
    car_number: string;
    team_name: string | null;
    interval: string;
    class_interval: string;
    laps_completed: number;
    laps_led: number;
  }[];
}

class IRacingService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private isConfigured: boolean;

  constructor() {
    this.clientId = process.env.IRACING_CLIENT_ID || '';
    this.clientSecret = process.env.IRACING_CLIENT_SECRET || '';
    this.redirectUri = process.env.IRACING_REDIRECT_URI || '';
    
    // Check if credentials are available
    this.isConfigured = Boolean(this.clientId && this.clientSecret && this.redirectUri);
    
    if (!this.isConfigured) {
      console.warn('iRacing API credentials not properly configured, using mock data');
    }
  }

  /**
   * Get the authorization URL for iRacing OAuth
   */
  getAuthorizationUrl(): string {
    return `https://oauth.iracing.com/oauth2/authorize?client_id=${this.clientId}&response_type=code&redirect_uri=${this.redirectUri}&scope=iracing.auth`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<AuthTokens> {
    if (!this.isConfigured) {
      // Return mock tokens
      return this.getMockTokens();
    }
    
    try {
      const response = await axios.post('https://oauth.iracing.com/oauth2/token', 
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.redirectUri,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
          },
        }
      );

      this.setTokens(response.data);
      return response.data;
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      
      // Fall back to mock tokens in case of error
      return this.getMockTokens();
    }
  }

  /**
   * Generate mock tokens for development/build
   */
  private getMockTokens(): AuthTokens {
    const mockTokens = {
      access_token: "mock_access_token",
      refresh_token: "mock_refresh_token",
      expires_in: 3600,
      token_type: "Bearer"
    };
    this.setTokens(mockTokens);
    return mockTokens;
  }

  /**
   * Refresh the access token
   */
  async refreshAccessToken(): Promise<AuthTokens> {
    if (!this.isConfigured || !this.refreshToken) {
      // Return mock tokens
      return this.getMockTokens();
    }

    try {
      const response = await axios.post('https://oauth.iracing.com/oauth2/token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
          },
        }
      );

      this.setTokens(response.data);
      return response.data;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      return this.getMockTokens();
    }
  }

  /**
   * Set tokens and expiry time
   */
  private setTokens(data: AuthTokens): void {
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    
    // Set token expiry (subtract 5 minutes to be safe)
    const expiresInMs = (data.expires_in - 300) * 1000;
    this.tokenExpiry = new Date(Date.now() + expiresInMs);
  }

  /**
   * Check if the access token is expired and refresh if needed
   */
  private async ensureValidToken(): Promise<string> {
    if (!this.isConfigured) {
      // Return mock token
      return (await this.getMockTokens()).access_token;
    }
    
    if (!this.accessToken || !this.tokenExpiry) {
      throw new Error('No access token available');
    }

    if (this.tokenExpiry < new Date()) {
      const tokens = await this.refreshAccessToken();
      return tokens.access_token;
    }

    return this.accessToken;
  }

  /**
   * Get the user's iRacing profile
   */
  async getProfile(): Promise<IRacingProfile> {
    if (!this.isConfigured) {
      // Return mock profile
      return {
        cust_id: 123456,
        email: "mock@example.com",
        display_name: "Mock User"
      };
    }
    
    try {
      const token = await this.ensureValidToken();
      const response = await axios.get('https://oauth.iracing.com/oauth2/iracing/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching iRacing profile:', error);
      
      // Return mock profile in case of error
      return {
        cust_id: 123456,
        email: "mock@example.com",
        display_name: "Mock User"
      };
    }
  }

  /**
   * Get recent races for a user
   */
  async getUserRaces(custId: number): Promise<any> {
    if (!this.isConfigured) {
      // Return mock races
      return {
        races: []
      };
    }
    
    try {
      const token = await this.ensureValidToken();
      const response = await axios.get(`https://data.iracing.com/data/member/recent_races?cust_id=${custId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching user races:', error);
      return { races: [] };
    }
  }

  /**
   * Get details about a specific race subsession
   */
  async getRaceResults(subsessionId: number): Promise<RaceResult> {
    if (!this.isConfigured) {
      // Return mock race results
      return {
        subsession_id: subsessionId,
        name: "Mock Race",
        track: {
          track_name: "Mock Track",
          config_name: "Default"
        },
        session_start_time: new Date().toISOString(),
        session_end_time: new Date().toISOString(),
        results: []
      };
    }
    
    try {
      const token = await this.ensureValidToken();
      const response = await axios.get(`https://data.iracing.com/data/results/get?subsession_id=${subsessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching race results:', error);
      
      // Return mock race results in case of error
      return {
        subsession_id: subsessionId,
        name: "Mock Race",
        track: {
          track_name: "Mock Track",
          config_name: "Default"
        },
        session_start_time: new Date().toISOString(),
        session_end_time: new Date().toISOString(),
        results: []
      };
    }
  }

  /**
   * Get upcoming races/sessions
   */
  async getUpcomingSeries(): Promise<any> {
    if (!this.isConfigured) {
      // Return mock upcoming series
      return {
        series: []
      };
    }
    
    try {
      const token = await this.ensureValidToken();
      const response = await axios.get('https://data.iracing.com/data/series/active', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming series:', error);
      return { series: [] };
    }
  }
}

// Export a singleton instance
export const iRacingService = new IRacingService();
