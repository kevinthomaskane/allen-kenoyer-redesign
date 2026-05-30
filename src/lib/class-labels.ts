// Human-readable labels for the class enums. Keyed by the generated enum unions
// so adding an enum value is a compile error here until labelled
// (dev-guide § Type discipline).
import type { Enums } from "@/types/database";

export const CLASS_CATEGORY_LABELS: Record<Enums<"class_category">, string> = {
  stained_glass: "Stained glass",
  mosaic: "Mosaic",
  fused_glass: "Fused glass",
  other: "Other",
};

export const SKILL_LEVEL_LABELS: Record<Enums<"skill_level">, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  all_levels: "All levels",
};
