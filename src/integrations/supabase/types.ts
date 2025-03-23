export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      facebook_ads: {
        Row: {
          ad_account_id: string
          add_to_cart: number | null
          adset_id: string | null
          clicks: number | null
          cost_per_add_to_cart: number | null
          cost_per_initiate_checkout: number | null
          cost_per_purchase: number | null
          cost_per_view_content: number | null
          cpc: number | null
          cpm: number | null
          created_at: string | null
          ctr: number | null
          date: string
          frequency: number | null
          id: string
          impressions: number | null
          initiate_checkout: number | null
          name: string | null
          objective: string | null
          project_id: string | null
          purchase: number | null
          purchase_value: number | null
          reach: number | null
          roas: number | null
          spend: number | null
          status: string | null
          updated_at: string | null
          view_content: number | null
        }
        Insert: {
          ad_account_id: string
          add_to_cart?: number | null
          adset_id?: string | null
          clicks?: number | null
          cost_per_add_to_cart?: number | null
          cost_per_initiate_checkout?: number | null
          cost_per_purchase?: number | null
          cost_per_view_content?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string | null
          ctr?: number | null
          date: string
          frequency?: number | null
          id: string
          impressions?: number | null
          initiate_checkout?: number | null
          name?: string | null
          objective?: string | null
          project_id?: string | null
          purchase?: number | null
          purchase_value?: number | null
          reach?: number | null
          roas?: number | null
          spend?: number | null
          status?: string | null
          updated_at?: string | null
          view_content?: number | null
        }
        Update: {
          ad_account_id?: string
          add_to_cart?: number | null
          adset_id?: string | null
          clicks?: number | null
          cost_per_add_to_cart?: number | null
          cost_per_initiate_checkout?: number | null
          cost_per_purchase?: number | null
          cost_per_view_content?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string | null
          ctr?: number | null
          date?: string
          frequency?: number | null
          id?: string
          impressions?: number | null
          initiate_checkout?: number | null
          name?: string | null
          objective?: string | null
          project_id?: string | null
          purchase?: number | null
          purchase_value?: number | null
          reach?: number | null
          roas?: number | null
          spend?: number | null
          status?: string | null
          updated_at?: string | null
          view_content?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "facebook_ads_adset_id_fkey"
            columns: ["adset_id"]
            isOneToOne: false
            referencedRelation: "facebook_adsets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facebook_ads_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      facebook_adsets: {
        Row: {
          ad_account_id: string
          add_to_cart: number | null
          campaign_id: string | null
          clicks: number | null
          cost_per_add_to_cart: number | null
          cost_per_initiate_checkout: number | null
          cost_per_purchase: number | null
          cost_per_view_content: number | null
          cpc: number | null
          cpm: number | null
          created_at: string | null
          ctr: number | null
          daily_budget: number | null
          date: string
          frequency: number | null
          id: string
          impressions: number | null
          initiate_checkout: number | null
          lifetime_budget: number | null
          name: string | null
          objective: string | null
          project_id: string | null
          purchase: number | null
          purchase_value: number | null
          reach: number | null
          roas: number | null
          spend: number | null
          status: string | null
          updated_at: string | null
          view_content: number | null
        }
        Insert: {
          ad_account_id: string
          add_to_cart?: number | null
          campaign_id?: string | null
          clicks?: number | null
          cost_per_add_to_cart?: number | null
          cost_per_initiate_checkout?: number | null
          cost_per_purchase?: number | null
          cost_per_view_content?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string | null
          ctr?: number | null
          daily_budget?: number | null
          date: string
          frequency?: number | null
          id: string
          impressions?: number | null
          initiate_checkout?: number | null
          lifetime_budget?: number | null
          name?: string | null
          objective?: string | null
          project_id?: string | null
          purchase?: number | null
          purchase_value?: number | null
          reach?: number | null
          roas?: number | null
          spend?: number | null
          status?: string | null
          updated_at?: string | null
          view_content?: number | null
        }
        Update: {
          ad_account_id?: string
          add_to_cart?: number | null
          campaign_id?: string | null
          clicks?: number | null
          cost_per_add_to_cart?: number | null
          cost_per_initiate_checkout?: number | null
          cost_per_purchase?: number | null
          cost_per_view_content?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string | null
          ctr?: number | null
          daily_budget?: number | null
          date?: string
          frequency?: number | null
          id?: string
          impressions?: number | null
          initiate_checkout?: number | null
          lifetime_budget?: number | null
          name?: string | null
          objective?: string | null
          project_id?: string | null
          purchase?: number | null
          purchase_value?: number | null
          reach?: number | null
          roas?: number | null
          spend?: number | null
          status?: string | null
          updated_at?: string | null
          view_content?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "facebook_adsets_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "facebook_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facebook_adsets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      facebook_campaigns: {
        Row: {
          ad_account_id: string
          add_to_cart: number | null
          clicks: number | null
          cost_per_add_to_cart: number | null
          cost_per_initiate_checkout: number | null
          cost_per_purchase: number | null
          cost_per_view_content: number | null
          cpc: number | null
          cpm: number | null
          created_at: string | null
          ctr: number | null
          daily_budget: number | null
          date: string
          frequency: number | null
          id: string
          impressions: number | null
          initiate_checkout: number | null
          lifetime_budget: number | null
          name: string | null
          objective: string | null
          project_id: string | null
          purchase: number | null
          purchase_value: number | null
          reach: number | null
          roas: number | null
          spend: number | null
          status: string | null
          updated_at: string | null
          view_content: number | null
        }
        Insert: {
          ad_account_id: string
          add_to_cart?: number | null
          clicks?: number | null
          cost_per_add_to_cart?: number | null
          cost_per_initiate_checkout?: number | null
          cost_per_purchase?: number | null
          cost_per_view_content?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string | null
          ctr?: number | null
          daily_budget?: number | null
          date: string
          frequency?: number | null
          id: string
          impressions?: number | null
          initiate_checkout?: number | null
          lifetime_budget?: number | null
          name?: string | null
          objective?: string | null
          project_id?: string | null
          purchase?: number | null
          purchase_value?: number | null
          reach?: number | null
          roas?: number | null
          spend?: number | null
          status?: string | null
          updated_at?: string | null
          view_content?: number | null
        }
        Update: {
          ad_account_id?: string
          add_to_cart?: number | null
          clicks?: number | null
          cost_per_add_to_cart?: number | null
          cost_per_initiate_checkout?: number | null
          cost_per_purchase?: number | null
          cost_per_view_content?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string | null
          ctr?: number | null
          daily_budget?: number | null
          date?: string
          frequency?: number | null
          id?: string
          impressions?: number | null
          initiate_checkout?: number | null
          lifetime_budget?: number | null
          name?: string | null
          objective?: string | null
          project_id?: string | null
          purchase?: number | null
          purchase_value?: number | null
          reach?: number | null
          roas?: number | null
          spend?: number | null
          status?: string | null
          updated_at?: string | null
          view_content?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "facebook_campaigns_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          account_name: string | null
          created_at: string
          id: string
          last_sync: string | null
          name: string
          platform: string
          project_id: string
          status: string
          updated_at: string
        }
        Insert: {
          account_name?: string | null
          created_at?: string
          id?: string
          last_sync?: string | null
          name: string
          platform: string
          project_id: string
          status: string
          updated_at?: string
        }
        Update: {
          account_name?: string | null
          created_at?: string
          id?: string
          last_sync?: string | null
          name?: string
          platform?: string
          project_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          status: string | null
          thumbnail: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: string | null
          thumbnail?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: string | null
          thumbnail?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
