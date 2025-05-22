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

  constructor() {
    this.clientId = process.env.IRACING_CLIENT_ID || '';
    this.clientSecret = process.env.IRACING_CLIENT_SECRET || '';
    this.redirectUri = process.env.IRACING_REDIRECT_URI || '';
    
    if (!this.clientId || !this.clientSecret || !this.redirectUri) {
      console.warn('iRacing API credentials not properly configured');
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
      throw error;
    }
  }

  /**
   * Refresh the access token
   */
  async refreshAccessToken(): Promise<AuthTokens> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
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
      throw error;
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
      throw error;
    }
  }

  /**
   * Get recent races for a user
   */
  async getUserRaces(custId: number): Promise<any> {
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
      throw error;
    }
  }

  /**
   * Get details about a specific race subsession
   */
  async getRaceResults(subsessionId: number): Promise<RaceResult> {
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
      throw error;
    }
  }

  /**
   * Get upcoming races/sessions
   */
  async getUpcomingSeries(): Promise<any> {
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
      throw error;
    }
  }
}

// Export a singleton instance
export const iRacingService = new IRacingService();
