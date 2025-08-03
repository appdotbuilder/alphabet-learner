
import { z } from 'zod';

// Supported alphabets enum
export const alphabetTypeSchema = z.enum([
  'french',
  'polish', 
  'portuguese',
  'german',
  'belarusian',
  'georgian',
  'hebrew'
]);

export type AlphabetType = z.infer<typeof alphabetTypeSchema>;

// Alphabet schema
export const alphabetSchema = z.object({
  id: z.number(),
  type: alphabetTypeSchema,
  name: z.string(),
  description: z.string().nullable(),
  total_letters: z.number().int(),
  created_at: z.coerce.date()
});

export type Alphabet = z.infer<typeof alphabetSchema>;

// Letter schema
export const letterSchema = z.object({
  id: z.number(),
  alphabet_id: z.number(),
  letter: z.string(),
  name: z.string(),
  pronunciation: z.string().nullable(),
  pronunciation_guide: z.string().nullable(),
  order_position: z.number().int(),
  created_at: z.coerce.date()
});

export type Letter = z.infer<typeof letterSchema>;

// Practice session schema
export const practiceSessionSchema = z.object({
  id: z.number(),
  alphabet_id: z.number(),
  session_type: z.enum(['flashcard', 'quiz']),
  total_cards: z.number().int(),
  completed_cards: z.number().int(),
  correct_answers: z.number().int(),
  started_at: z.coerce.date(),
  completed_at: z.coerce.date().nullable()
});

export type PracticeSession = z.infer<typeof practiceSessionSchema>;

// Input schemas for creating data
export const createAlphabetInputSchema = z.object({
  type: alphabetTypeSchema,
  name: z.string(),
  description: z.string().nullable(),
  total_letters: z.number().int().positive()
});

export type CreateAlphabetInput = z.infer<typeof createAlphabetInputSchema>;

export const createLetterInputSchema = z.object({
  alphabet_id: z.number(),
  letter: z.string(),
  name: z.string(),
  pronunciation: z.string().nullable(),
  pronunciation_guide: z.string().nullable(),
  order_position: z.number().int().positive()
});

export type CreateLetterInput = z.infer<typeof createLetterInputSchema>;

export const createPracticeSessionInputSchema = z.object({
  alphabet_id: z.number(),
  session_type: z.enum(['flashcard', 'quiz']),
  total_cards: z.number().int().positive()
});

export type CreatePracticeSessionInput = z.infer<typeof createPracticeSessionInputSchema>;

// Update schemas
export const updatePracticeSessionInputSchema = z.object({
  id: z.number(),
  completed_cards: z.number().int().nonnegative().optional(),
  correct_answers: z.number().int().nonnegative().optional(),
  completed_at: z.coerce.date().nullable().optional()
});

export type UpdatePracticeSessionInput = z.infer<typeof updatePracticeSessionInputSchema>;

// Query input schemas
export const getLettersByAlphabetInputSchema = z.object({
  alphabet_id: z.number()
});

export type GetLettersByAlphabetInput = z.infer<typeof getLettersByAlphabetInputSchema>;

export const getLetterByIdInputSchema = z.object({
  id: z.number()
});

export type GetLetterByIdInput = z.infer<typeof getLetterByIdInputSchema>;

export const getAlphabetByTypeInputSchema = z.object({
  type: alphabetTypeSchema
});

export type GetAlphabetByTypeInput = z.infer<typeof getAlphabetByTypeInputSchema>;
