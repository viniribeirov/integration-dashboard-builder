
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
  description: string;
  created_at: string;
  updated_at: string;
  integrations: Integration[];
  status: 'active' | 'inactive' | 'pending';
  owner_id: string;
  thumbnail?: string;
};

export type Integration = {
  id: string;
  name: string;
  platform: 'facebook' | 'google' | 'instagram' | 'twitter' | 'linkedin';
  status: 'connected' | 'disconnected' | 'pending';
  last_sync?: string;
  account_name?: string;
  project_id: string;
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
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>;
      };
      integrations: {
        Row: Integration;
        Insert: Omit<Integration, 'id'>;
        Update: Partial<Omit<Integration, 'id'>>;
      };
    };
  };
};
