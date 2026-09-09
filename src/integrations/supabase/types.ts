export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string;
          detail: string | null;
          id: string;
          target: string | null;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string;
          detail?: string | null;
          id?: string;
          target?: string | null;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          created_at?: string;
          detail?: string | null;
          id?: string;
          target?: string | null;
        };
        Relationships: [];
      };
      balance_transactions: {
        Row: {
          amount: number;
          created_at: string;
          description: string | null;
          id: string;
          ref_id: string | null;
          type: Database["public"]["Enums"]["txn_type"];
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          description?: string | null;
          id?: string;
          ref_id?: string | null;
          type: Database["public"]["Enums"]["txn_type"];
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          description?: string | null;
          id?: string;
          ref_id?: string | null;
          type?: Database["public"]["Enums"]["txn_type"];
          user_id?: string;
        };
        Relationships: [];
      };
      faqs: {
        Row: {
          answer: string;
          category: string;
          id: string;
          question: string;
          sort_order: number;
        };
        Insert: {
          answer: string;
          category?: string;
          id?: string;
          question: string;
          sort_order?: number;
        };
        Update: {
          answer?: string;
          category?: string;
          id?: string;
          question?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          id: string;
          payment_account: string | null;
          payment_method: string | null;
          suspended: boolean;
          updated_at: string;
          username: string;
          whatsapp: string | null;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id: string;
          payment_account?: string | null;
          payment_method?: string | null;
          suspended?: boolean;
          updated_at?: string;
          username: string;
          whatsapp?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: string;
          payment_account?: string | null;
          payment_method?: string | null;
          suspended?: boolean;
          updated_at?: string;
          username?: string;
          whatsapp?: string | null;
        };
        Relationships: [];
      };
      settings: {
        Row: {
          ai_faq_enabled: boolean;
          announcement: string;
          announcement_title: string;
          daily_quota: number;
          dashboard_name: string;
          deposit_password: string;
          human_support_enabled: boolean;
          id: number;
          max_bulk: number;
          min_withdrawal: number;
          rate_per_account: number;
          rules_today: string;
          submission_open: boolean;
          tiktok_link: string;
          updated_at: string;
          whatsapp_link: string;
        };
        Insert: {
          ai_faq_enabled?: boolean;
          announcement?: string;
          announcement_title?: string;
          daily_quota?: number;
          dashboard_name?: string;
          deposit_password?: string;
          human_support_enabled?: boolean;
          id?: number;
          max_bulk?: number;
          min_withdrawal?: number;
          rate_per_account?: number;
          rules_today?: string;
          submission_open?: boolean;
          tiktok_link?: string;
          updated_at?: string;
          whatsapp_link?: string;
        };
        Update: {
          ai_faq_enabled?: boolean;
          announcement?: string;
          announcement_title?: string;
          daily_quota?: number;
          dashboard_name?: string;
          deposit_password?: string;
          human_support_enabled?: boolean;
          id?: number;
          max_bulk?: number;
          min_withdrawal?: number;
          rate_per_account?: number;
          rules_today?: string;
          submission_open?: boolean;
          tiktok_link?: string;
          updated_at?: string;
          whatsapp_link?: string;
        };
        Relationships: [];
      };
      submissions: {
        Row: {
          account_ref: string;
          admin_note: string | null;
          batch_id: string | null;
          created_at: string;
          id: string;
          internal_token: string | null;
          rate: number;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: Database["public"]["Enums"]["submission_status"];
          user_id: string;
        };
        Insert: {
          account_ref: string;
          admin_note?: string | null;
          batch_id?: string | null;
          created_at?: string;
          id?: string;
          internal_token?: string | null;
          rate?: number;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["submission_status"];
          user_id: string;
        };
        Update: {
          account_ref?: string;
          admin_note?: string | null;
          batch_id?: string | null;
          created_at?: string;
          id?: string;
          internal_token?: string | null;
          rate?: number;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["submission_status"];
          user_id?: string;
        };
        Relationships: [];
      };
      support_messages: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          is_admin: boolean;
          sender_id: string | null;
          ticket_id: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          is_admin?: boolean;
          sender_id?: string | null;
          ticket_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          is_admin?: boolean;
          sender_id?: string | null;
          ticket_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey";
            columns: ["ticket_id"];
            isOneToOne: false;
            referencedRelation: "support_tickets";
            referencedColumns: ["id"];
          },
        ];
      };
      support_tickets: {
        Row: {
          category: string;
          created_at: string;
          id: string;
          status: Database["public"]["Enums"]["ticket_status"];
          subject: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          category?: string;
          created_at?: string;
          id?: string;
          status?: Database["public"]["Enums"]["ticket_status"];
          subject: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          id?: string;
          status?: Database["public"]["Enums"]["ticket_status"];
          subject?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      withdrawals: {
        Row: {
          account_name: string;
          account_number: string;
          admin_note: string | null;
          amount: number;
          created_at: string;
          id: string;
          idempotency_key: string | null;
          method: string;
          processed_at: string | null;
          status: Database["public"]["Enums"]["withdrawal_status"];
          user_id: string;
        };
        Insert: {
          account_name: string;
          account_number: string;
          admin_note?: string | null;
          amount: number;
          created_at?: string;
          id?: string;
          idempotency_key?: string | null;
          method: string;
          processed_at?: string | null;
          status?: Database["public"]["Enums"]["withdrawal_status"];
          user_id: string;
        };
        Update: {
          account_name?: string;
          account_number?: string;
          admin_note?: string | null;
          amount?: number;
          created_at?: string;
          id?: string;
          idempotency_key?: string | null;
          method?: string;
          processed_at?: string | null;
          status?: Database["public"]["Enums"]["withdrawal_status"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      check_deposit_password: { Args: { _password: string }; Returns: boolean };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "user";
      submission_status: "PENDING" | "ACCEPTED" | "REJECTED" | "DUPLICATE" | "INVALID";
      ticket_status: "OPEN" | "ANSWERED" | "CLOSED";
      txn_type: "CREDIT" | "RESERVE" | "REFUND" | "PAYOUT" | "ADJUSTMENT";
      withdrawal_status: "PENDING" | "APPROVED" | "PROCESSING" | "PAID" | "REJECTED";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      submission_status: ["PENDING", "ACCEPTED", "REJECTED", "DUPLICATE", "INVALID"],
      ticket_status: ["OPEN", "ANSWERED", "CLOSED"],
      txn_type: ["CREDIT", "RESERVE", "REFUND", "PAYOUT", "ADJUSTMENT"],
      withdrawal_status: ["PENDING", "APPROVED", "PROCESSING", "PAID", "REJECTED"],
    },
  },
} as const;
