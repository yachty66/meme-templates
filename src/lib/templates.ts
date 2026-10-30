import data from "./templates.json";

export type Template = {
  id: string;
  rank: number;
  name: string;
  slug: string;
  file: string;
  width: number;
  height: number;
  boxes: number;
};

export const TEMPLATES: Template[] = data;

export const getTemplate = (slug: string) => TEMPLATES.find((t) => t.slug === slug);
