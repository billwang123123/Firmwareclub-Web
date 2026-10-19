export type ForumTag =
  | "STM32"
  | "Arduino"
  | "ESP32"
  | "嵌入式Linux"
  | "RTOS"
  | "工具链"
  | "杂谈";

export type Database = {
  public: {
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          github_url: string | null;
          is_admin: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          github_url?: string | null;
          is_admin?: boolean;
          created_at?: string;
        };
        Update: {
          username?: string;
          avatar_url?: string | null;
          github_url?: string | null;
          is_admin?: boolean;
        };
        Relationships: [];
      };
      blog_posts: {
        Row: {
          id: string;
          slug: string;
          title: string;
          excerpt: string;
          cover_url: string | null;
          body_md: string;
          author_id: string;
          published_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          excerpt: string;
          cover_url?: string | null;
          body_md: string;
          author_id: string;
          published_at?: string;
        };
        Update: {
          slug?: string;
          title?: string;
          excerpt?: string;
          cover_url?: string | null;
          body_md?: string;
        };
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey";
            columns: ["author_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      members: {
        Row: {
          id: string;
          name: string;
          avatar_url: string | null;
          grade: string | null;
          major: string | null;
          tags: string[];
          bio: string | null;
          github_url: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          avatar_url?: string | null;
          grade?: string | null;
          major?: string | null;
          tags?: string[];
          bio?: string | null;
          github_url?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          avatar_url?: string | null;
          grade?: string | null;
          major?: string | null;
          tags?: string[];
          bio?: string | null;
          github_url?: string | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          body_md: string;
          tag: string;
          cover_url: string | null;
          like_count: number;
          reply_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          title: string;
          body_md: string;
          tag: string;
          cover_url?: string | null;
          like_count?: number;
          reply_count?: number;
          created_at?: string;
        };
        Update: {
          title?: string;
          body_md?: string;
          tag?: string;
          cover_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey";
            columns: ["author_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      replies: {
        Row: {
          id: string;
          post_id: string;
          parent_id: string | null;
          author_id: string;
          body_md: string;
          like_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          parent_id?: string | null;
          author_id: string;
          body_md: string;
          like_count?: number;
          created_at?: string;
        };
        Update: {
          body_md?: string;
        };
        Relationships: [
          {
            foreignKeyName: "replies_post_id_fkey";
            columns: ["post_id"];
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "replies_author_id_fkey";
            columns: ["author_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "replies_parent_id_fkey";
            columns: ["parent_id"];
            referencedRelation: "replies";
            referencedColumns: ["id"];
          },
        ];
      };
      likes: {
        Row: {
          user_id: string;
          target_id: string;
          target_type: "post" | "reply";
          created_at: string;
        };
        Insert: {
          user_id: string;
          target_id: string;
          target_type: "post" | "reply";
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Enums: {
      forum_tag: ForumTag;
    };
    CompositeTypes: Record<never, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"];
export type Member = Database["public"]["Tables"]["members"]["Row"];
export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type Reply = Database["public"]["Tables"]["replies"]["Row"];
export type Like = Database["public"]["Tables"]["likes"]["Row"];

export type PostWithAuthor = Post & {
  author: Pick<Profile, "id" | "username" | "avatar_url">;
};

export type ReplyWithAuthor = Reply & {
  author: Pick<Profile, "id" | "username" | "avatar_url">;
};

export type BlogPostWithAuthor = BlogPost & {
  author: Pick<Profile, "id" | "username" | "avatar_url">;
};
