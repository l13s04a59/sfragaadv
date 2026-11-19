export type FormSource = "trabalhista" | "gestante";

export type FieldType =
  | "choice"
  | "multi"
  | "text"
  | "textarea"
  | "phone"
  | "number"
  | "date"
  | "info";

export type Answers = Record<string, string | string[] | boolean | null | undefined>;

export type FieldOption = {
  label: string;
  value: string;
};

export type FormField = {
  id: string;
  type: FieldType;
  label: string;
  required?: boolean;
  placeholder?: string;
  help?: string;
  options?: FieldOption[];
  /** When true, field starts hidden and only shows via visibility rules */
  showWhen?: (answers: Answers) => boolean;
};

export type FormPage = {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  /** Skip remaining pages and go to early-exit / submit */
  earlyExitWhen?: (answers: Answers) => boolean;
  earlyExitMessage?: string;
};

export type FormDefinition = {
  source: FormSource;
  gestante: boolean;
  title: string;
  subtitle: string;
  pages: FormPage[];
};
