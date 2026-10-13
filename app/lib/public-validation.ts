// app/lib/public-validation.ts
// Schemas for the anonymous website forms.
//
// These endpoints are reachable by anyone, so unlike the admin routes they get
// strict length caps on every field — an unbounded TEXT column written straight
// from a public POST is an easy way to fill the database.

import { z } from 'zod';

const shortText = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) =>
  z.preprocess((v) => (v === '' || v === undefined ? null : v), z.string().trim().max(max).nullable());
const phone = z
  .string()
  .trim()
  .min(1)
  .max(20)
  .regex(/^(?=(?:\D*\d){7,15}\D*$)\+?[\d -]+$/, 'a valid phone number is required');

export const appointmentSchema = z.object({
  name: shortText(120),
  phone,
  email: z.preprocess(
    (v) => (v === '' || v === undefined ? null : v),
    z.string().trim().email('a valid email is required').max(200).nullable()
  ),
  preferred_date: optionalText(30),
  preferred_time: optionalText(50),
  test_type: z.string().trim().max(100).default('Eye Testing'),
  wears_glasses: z.string().trim().max(10).default('No'),
  notes: optionalText(1000),
});

export const inquirySchema = z.object({
  name: shortText(120),
  phone,
  email: z.preprocess(
    (v) => (v === '' || v === undefined ? null : v),
    z.string().trim().email('a valid email is required').max(200).nullable()
  ),
  interest: z.string().trim().max(100).default('General Inquiry'),
  message: optionalText(2000),
});
