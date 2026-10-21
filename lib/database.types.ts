// Generated from the Supabase schema (supabase gen types), trimmed to what the app uses.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Enums = {
  article_status: "draft" | "published";
  message_status: "new" | "read" | "archived";
  practice_group: "transactions" | "regulatory" | "disputes" | "sectors";
  profile_status: "published" | "hidden" | "inactive";
  staff_role: "admin" | "editor";
  team_group: "partner" | "lawyer" | "paralegal" | "administration";
};

type ArticleRow = {
  author_id: string | null;
  body_en: string | null;
  body_fr: string | null;
  category_id: string | null;
  cover_alt_en: string | null;
  cover_alt_fr: string | null;
  cover_path: string | null;
  created_at: string;
  created_by: string | null;
  excerpt_en: string | null;
  excerpt_fr: string | null;
  id: string;
  published_at: string | null;
  slug: string;
  status: Enums["article_status"];
  title_en: string | null;
  title_fr: string | null;
  updated_at: string;
  updated_by: string | null;
};

type CategoryRow = {
  created_at: string;
  id: string;
  name_en: string;
  name_fr: string;
  slug: string;
  sort_order: number;
};

type MessageRow = {
  created_at: string;
  email: string;
  id: string;
  locale: string;
  message: string;
  name: string;
  phone: string | null;
  status: Enums["message_status"];
  subject: string | null;
};

type PracticeAreaRow = {
  created_at: string;
  group_key: Enums["practice_group"];
  id: string;
  scope_en: string[];
  scope_fr: string[];
  slug: string;
  slug_fr: string;
  sort_order: number;
  summary_en: string;
  summary_fr: string;
  title_en: string;
  title_fr: string;
  updated_at: string;
  updated_by: string | null;
};

type StaffRow = {
  created_at: string;
  email: string;
  full_name: string | null;
  role: Enums["staff_role"];
  user_id: string;
};

type MemberPracticeAreaRow = { member_id: string; practice_area_id: string };

type TeamMemberRow = {
  bar_admission_en: string | null;
  bar_admission_fr: string | null;
  bio_en: string;
  bio_fr: string;
  created_at: string;
  created_by: string | null;
  email: string | null;
  featured: boolean;
  focus_areas_en: string[];
  focus_areas_fr: string[];
  full_name: string;
  group_key: Enums["team_group"];
  id: string;
  languages_en: string[];
  languages_fr: string[];
  linkedin_url: string | null;
  photo_path: string | null;
  photo_position: string;
  qualifications_en: string[];
  qualifications_fr: string[];
  slug: string;
  sort_order: number;
  status: Enums["profile_status"];
  title_en: string;
  title_fr: string;
  updated_at: string;
  updated_by: string | null;
};

type Table<Row, Required extends keyof Row, Rel = []> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, Required>;
  Update: Partial<Row>;
  Relationships: Rel;
};

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.18" };
  public: {
    Tables: {
      article_categories: Table<CategoryRow, "name_en" | "name_fr" | "slug">;
      articles: Table<
        ArticleRow,
        "slug",
        [
          {
            foreignKeyName: "articles_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "team_members";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "articles_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "article_categories";
            referencedColumns: ["id"];
          },
        ]
      >;
      contact_messages: Table<MessageRow, "email" | "message" | "name">;
      practice_areas: Table<PracticeAreaRow, "group_key" | "slug" | "slug_fr" | "title_en" | "title_fr">;
      staff: Table<StaffRow, "email" | "user_id">;
      team_member_practice_areas: Table<
        MemberPracticeAreaRow,
        "member_id" | "practice_area_id",
        [
          {
            foreignKeyName: "team_member_practice_areas_member_id_fkey";
            columns: ["member_id"];
            isOneToOne: false;
            referencedRelation: "team_members";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_member_practice_areas_practice_area_id_fkey";
            columns: ["practice_area_id"];
            isOneToOne: false;
            referencedRelation: "practice_areas";
            referencedColumns: ["id"];
          },
        ]
      >;
      team_members: Table<TeamMemberRow, "full_name" | "slug">;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: Enums;
    CompositeTypes: { [_ in never]: never };
  };
};

export type ArticleRecord = ArticleRow;
export type CategoryRecord = CategoryRow;
export type MessageRecord = MessageRow;
export type PracticeAreaRecord = PracticeAreaRow;
export type StaffRecord = StaffRow;
export type TeamMemberRecord = TeamMemberRow;
export type TeamGroup = Enums["team_group"];
export type ProfileStatus = Enums["profile_status"];
export type ArticleStatus = Enums["article_status"];
export type PracticeGroup = Enums["practice_group"];
export type StaffRole = Enums["staff_role"];
export type MessageStatus = Enums["message_status"];
