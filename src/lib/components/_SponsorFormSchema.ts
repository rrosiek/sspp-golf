import type { SchemaOf } from "yup";
import { object, number, string, mixed } from "yup";
import states from "$lib/states";

const sponsors = [
  "sponsor_memory",
  "sponsor_hole",
  "sponsor_birdie",
  "sponsor_eagle",
  "sponsor_ace",
  "sponsor_presenting",
];

interface PurchaseSchema {
  sponsorSelected: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  email: string;
  phone: string;
}

export const schema: SchemaOf<PurchaseSchema> = object().shape({
  sponsorSelected: string().required().oneOf(sponsors),
  name: string().required().min(3).max(250).trim(),
  address: string().required().min(3).max(250).trim(),
  city: string().required().min(3).max(250).trim(),
  state: mixed().oneOf(states.map((s) => s.value)),
  zipCode: string()
    .required()
    .matches(/[0-9]{5}/),
  email: string().required().email(),
  phone: string()
    .required()
    .matches(/^\(?[0-9]{3}\)?-?\s?[0-9]{3}-?[0-9]{4}$/),
});
