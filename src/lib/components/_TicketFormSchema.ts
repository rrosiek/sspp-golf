import type { SchemaOf } from "yup";
import { object, number, string, mixed } from "yup";
import states from "$lib/states";

interface PurchaseSchema {
  dinnerTicketsPurchased: number;
  golferName1: string;
  golferContact1: string;
  golferName2?: string;
  golferContact2?: string;
  golferName3?: string;
  golferContact3?: string;
  golferName4?: string;
  golferContact4?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  email: string;
  phone: string;
}

export const schema: SchemaOf<PurchaseSchema> = object().shape({
  dinnerTicketsPurchased: number()
    .integer()
    .required()
    .moreThan(-1)
    .lessThan(10),
  golferName1: string().required().min(3).max(250).trim(),
  golferContact1: string().required().min(3).max(250).trim(),
  golferName2: string().optional().min(3).max(250).trim(),
  golferContact2: string().min(3).max(250).trim().optional(),
  // .when("golfer2Name", ([name], schema) =>
  // name.length > 0 ? schema.required() : schema.optional()
  // ),
  golferName3: string().optional().min(3).max(250).trim(),
  golferContact3: string().min(3).max(250).trim().optional(),
  // .when("golfer3Name", ([name], schema) =>
  // name.length > 0 ? schema.required() : schema.optional()
  // ),
  golferName4: string().optional().min(3).max(250).trim(),
  golferContact4: string().min(3).max(250).trim().optional(),
  // .when("golfer4Name", ([name], schema) =>
  // name.length > 0 ? schema.required() : schema.optional()
  // ),
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
