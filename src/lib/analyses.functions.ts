import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

type JsonValue = string | number | boolean | null | { [k: string]: JsonValue } | JsonValue[];

export type AnalysisRow = {
  id: string;
  kind: "threat" | "url";
  input: string;
  report: JsonValue;
  risk_score: number;
  created_at: string;
};

export const saveAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      kind: z.enum(["threat", "url"]),
      input: z.string().min(1).max(4000),
      report: z.unknown(),
      risk_score: z.number().int().min(0).max(100),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("analyses")
      .insert({ user_id: userId, kind: data.kind, input: data.input, report: data.report, risk_score: data.risk_score })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const listAnalyses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AnalysisRow[]> => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("analyses")
      .select("id,kind,input,report,risk_score,created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return (data ?? []) as AnalysisRow[];
  });

export const deleteAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("analyses").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const clearAnalyses = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("analyses").delete().eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
