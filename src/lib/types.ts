import type { ValidationError } from "yup";

export type AnyObject = Record<string, unknown>;
export type CustomFormData = { name: string; value: string | number | Date };
export type Result<T> = [error: Boolean | ValidationError, result: T | unknown];
export type Sponsorship = {
  id: string;
  name: string;
  price: number;
};
