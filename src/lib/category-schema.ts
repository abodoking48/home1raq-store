import { z } from "zod";
import { CATEGORY_ICON_OPTIONS } from "@/lib/category-icons";

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(1),
  icon: z.enum(CATEGORY_ICON_OPTIONS).optional(),
  iconUrl: z.string().url().optional().or(z.literal("")),
  description: z.string().trim().optional().or(z.literal("")),
  active: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const categoryPatchSchema = z.object({
  name: z.string().trim().min(1).optional(),
  icon: z.enum(CATEGORY_ICON_OPTIONS).optional(),
  iconUrl: z.string().url().optional().or(z.literal("")),
  description: z.string().trim().optional().or(z.literal("")),
  active: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

