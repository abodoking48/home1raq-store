export const CATEGORY_ICON_OPTIONS = [
  "kitchen",
  "tv",
  "sofa",
  "dumbbell",
] as const;

export type CategoryIcon = (typeof CATEGORY_ICON_OPTIONS)[number];

export const DEFAULT_CATEGORY_ICON: CategoryIcon = "kitchen";

