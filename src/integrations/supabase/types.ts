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
          account_id: string
          action_values: Json | null
          actions: Json | null
          ad_account_id: string
          ad_id: string
          ad_name: string | null
          adset_id: string
          adset_name: string | null
          campaign_id: string
          campaign_name: string | null
          conversion_rate_ranking: string | null
          cpc: number | null
          cpm: number | null
          created_at: string | null
          date: string | null
          date_start: string
          date_stop: string
          engagement_rate_ranking: string | null
          frequency: number | null
          id: string
          inline_link_click_ctr: number | null
          inline_link_clicks: number | null
          project_id: string | null
          purchase_roas: Json | null
          quality_ranking: string | null
          spend: number | null
          unique_actions: Json | null
          updated_at: string | null
          video_avg_time_watched_actions: Json | null
          video_continuous_2_sec_watched_actions: Json | null
          video_p100_watched_actions: Json | null
          video_p50_watched_actions: Json | null
          video_play_actions: Json | null
        }
        Insert: {
          account_id: string
          action_values?: Json | null
          actions?: Json | null
          ad_account_id: string
          ad_id: string
          ad_name?: string | null
          adset_id: string
          adset_name?: string | null
          campaign_id: string
          campaign_name?: string | null
          conversion_rate_ranking?: string | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string | null
          date?: string | null
          date_start: string
          date_stop: string
          engagement_rate_ranking?: string | null
          frequency?: number | null
          id?: string
          inline_link_click_ctr?: number | null
          inline_link_clicks?: number | null
          project_id?: string | null
          purchase_roas?: Json | null
          quality_ranking?: string | null
          spend?: number | null
          unique_actions?: Json | null
          updated_at?: string | null
          video_avg_time_watched_actions?: Json | null
          video_continuous_2_sec_watched_actions?: Json | null
          video_p100_watched_actions?: Json | null
          video_p50_watched_actions?: Json | null
          video_play_actions?: Json | null
        }
        Update: {
          account_id?: string
          action_values?: Json | null
          actions?: Json | null
          ad_account_id?: string
          ad_id?: string
          ad_name?: string | null
          adset_id?: string
          adset_name?: string | null
          campaign_id?: string
          campaign_name?: string | null
          conversion_rate_ranking?: string | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string | null
          date?: string | null
          date_start?: string
          date_stop?: string
          engagement_rate_ranking?: string | null
          frequency?: number | null
          id?: string
          inline_link_click_ctr?: number | null
          inline_link_clicks?: number | null
          project_id?: string | null
          purchase_roas?: Json | null
          quality_ranking?: string | null
          spend?: number | null
          unique_actions?: Json | null
          updated_at?: string | null
          video_avg_time_watched_actions?: Json | null
          video_continuous_2_sec_watched_actions?: Json | null
          video_p100_watched_actions?: Json | null
          video_p50_watched_actions?: Json | null
          video_play_actions?: Json | null
        }
        Relationships: [
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
          account_id: string
          action_values: Json | null
          actions: Json | null
          ad_account_id: string
          adset_id: string
          adset_name: string | null
          campaign_id: string
          campaign_name: string | null
          conversion_rate_ranking: string | null
          cpc: number | null
          cpm: number | null
          created_at: string | null
          date: string | null
          date_start: string
          date_stop: string
          engagement_rate_ranking: string | null
          frequency: number | null
          id: string
          inline_link_click_ctr: number | null
          inline_link_clicks: number | null
          project_id: string | null
          purchase_roas: Json | null
          quality_ranking: string | null
          spend: number | null
          unique_actions: Json | null
          updated_at: string | null
        }
        Insert: {
          account_id: string
          action_values?: Json | null
          actions?: Json | null
          ad_account_id: string
          adset_id: string
          adset_name?: string | null
          campaign_id: string
          campaign_name?: string | null
          conversion_rate_ranking?: string | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string | null
          date?: string | null
          date_start: string
          date_stop: string
          engagement_rate_ranking?: string | null
          frequency?: number | null
          id?: string
          inline_link_click_ctr?: number | null
          inline_link_clicks?: number | null
          project_id?: string | null
          purchase_roas?: Json | null
          quality_ranking?: string | null
          spend?: number | null
          unique_actions?: Json | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          action_values?: Json | null
          actions?: Json | null
          ad_account_id?: string
          adset_id?: string
          adset_name?: string | null
          campaign_id?: string
          campaign_name?: string | null
          conversion_rate_ranking?: string | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string | null
          date?: string | null
          date_start?: string
          date_stop?: string
          engagement_rate_ranking?: string | null
          frequency?: number | null
          id?: string
          inline_link_click_ctr?: number | null
          inline_link_clicks?: number | null
          project_id?: string | null
          purchase_roas?: Json | null
          quality_ranking?: string | null
          spend?: number | null
          unique_actions?: Json | null
          updated_at?: string | null
        }
        Relationships: [
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
          account_id: string
          action_values: Json | null
          actions: Json | null
          ad_account_id: string
          campaign_id: string
          campaign_name: string | null
          conversion_rate_ranking: string | null
          cpc: number | null
          cpm: number | null
          created_at: string | null
          date: string | null
          date_start: string
          date_stop: string
          engagement_rate_ranking: string | null
          frequency: number | null
          id: string
          inline_link_click_ctr: number | null
          inline_link_clicks: number | null
          project_id: string | null
          purchase_roas: Json | null
          quality_ranking: string | null
          spend: number | null
          unique_actions: Json | null
          updated_at: string | null
        }
        Insert: {
          account_id: string
          action_values?: Json | null
          actions?: Json | null
          ad_account_id: string
          campaign_id: string
          campaign_name?: string | null
          conversion_rate_ranking?: string | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string | null
          date?: string | null
          date_start: string
          date_stop: string
          engagement_rate_ranking?: string | null
          frequency?: number | null
          id?: string
          inline_link_click_ctr?: number | null
          inline_link_clicks?: number | null
          project_id?: string | null
          purchase_roas?: Json | null
          quality_ranking?: string | null
          spend?: number | null
          unique_actions?: Json | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          action_values?: Json | null
          actions?: Json | null
          ad_account_id?: string
          campaign_id?: string
          campaign_name?: string | null
          conversion_rate_ranking?: string | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string | null
          date?: string | null
          date_start?: string
          date_stop?: string
          engagement_rate_ranking?: string | null
          frequency?: number | null
          id?: string
          inline_link_click_ctr?: number | null
          inline_link_clicks?: number | null
          project_id?: string | null
          purchase_roas?: Json | null
          quality_ranking?: string | null
          spend?: number | null
          unique_actions?: Json | null
          updated_at?: string | null
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
      project_widgets: {
        Row: {
          created_at: string | null
          formula: string | null
          id: string
          metrics: Json
          platform: string
          position: number
          project_id: string
          updated_at: string | null
          visualization_type: string
          widget_name: string
        }
        Insert: {
          created_at?: string | null
          formula?: string | null
          id?: string
          metrics: Json
          platform: string
          position?: number
          project_id: string
          updated_at?: string | null
          visualization_type: string
          widget_name: string
        }
        Update: {
          created_at?: string | null
          formula?: string | null
          id?: string
          metrics?: Json
          platform?: string
          position?: number
          project_id?: string
          updated_at?: string | null
          visualization_type?: string
          widget_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_widgets_project_id_fkey"
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
      facebook_campaign_metrics: {
        Row: {
          avg_cpc: number | null
          avg_cpm: number | null
          avg_frequency: number | null
          avg_inline_link_click_ctr: number | null
          end_date: string | null
          landing_page_view: number | null
          project_id: string | null
          spend: number | null
          start_date: string | null
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
      vw_facebook_metrics: {
        Row: {
          account_id: string | null
          ad_id: string | null
          adset_id: string | null
          campaign_id: string | null
          cpc: number | null
          cpm: number | null
          date: string | null
          frequency: number | null
          inline_link_click_ctr: number | null
          inline_link_clicks: number | null
          landing_page_view: number | null
          landing_page_view_value: number | null
          omni_add_to_cart: number | null
          omni_add_to_cart_value: number | null
          omni_initiated_checkout: number | null
          omni_initiated_checkout_value: number | null
          omni_purchase: number | null
          omni_purchase_value: number | null
          omni_view_content: number | null
          omni_view_content_value: number | null
          project_id: string | null
          purchase_roas: number | null
          spend: number | null
        }
        Relationships: [
          {
            foreignKeyName: "facebook_ads_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_dashboard_metrics: {
        Args: {
          p_project_id: string
          p_platform: string
          p_metrics: string[]
          p_start_date: string
          p_end_date: string
        }
        Returns: Json
      }
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
