
export type User = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  integrations?: Integration[];
  status: 'active' | 'inactive' | 'pending' | null;
  user_id: string;
  thumbnail?: string | null;
};

export type Integration = {
  id: string;
  name: string;
  platform: 'facebook' | 'google' | 'instagram' | 'twitter' | 'linkedin';
  status: 'connected' | 'disconnected' | 'pending';
  last_sync?: string;
  account_name?: string;
  project_id: string;
  created_at?: string;
  updated_at?: string;
};

// Define your Supabase database types here
// This is a placeholder and should be generated from Supabase schema
export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id'>;
        Update: Partial<Omit<User, 'id'>>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'integrations'>;
        Update: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at' | 'integrations'>>;
      };
      integrations: {
        Row: Integration;
        Insert: Omit<Integration, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Integration, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
    Functions: {
      [key: string]: unknown;
    };
    Enums: {
      [key: string]: unknown;
    };
  };
  storage: {
    Tables: {
      buckets: {
        Row: {
          id: string;
          name: string;
          public: boolean;
        };
      };
      objects: {
        Row: {
          id: string;
          bucket_id: string;
          name: string;
          owner: string;
          metadata: Record<string, unknown>;
        };
      };
    };
  };
};
