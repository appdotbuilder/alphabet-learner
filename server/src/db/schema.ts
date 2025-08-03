
import { serial, text, pgTable, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enum for alphabet types
export const alphabetTypeEnum = pgEnum('alphabet_type', [
  'french',
  'polish',
  'portuguese', 
  'german',
  'belarusian',
  'georgian',
  'hebrew'
]);

// Enum for practice session types
export const sessionTypeEnum = pgEnum('session_type', ['flashcard', 'quiz']);

// Alphabets table
export const alphabetsTable = pgTable('alphabets', {
  id: serial('id').primaryKey(),
  type: alphabetTypeEnum('type').notNull(),
  name: text('name').notNull(),
  description: text('description'), // Nullable by default
  total_letters: integer('total_letters').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Letters table
export const lettersTable = pgTable('letters', {
  id: serial('id').primaryKey(),
  alphabet_id: integer('alphabet_id').notNull().references(() => alphabetsTable.id),
  letter: text('letter').notNull(),
  name: text('name').notNull(),
  pronunciation: text('pronunciation'), // Nullable by default
  pronunciation_guide: text('pronunciation_guide'), // Nullable by default
  order_position: integer('order_position').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Practice sessions table
export const practiceSessionsTable = pgTable('practice_sessions', {
  id: serial('id').primaryKey(),
  alphabet_id: integer('alphabet_id').notNull().references(() => alphabetsTable.id),
  session_type: sessionTypeEnum('session_type').notNull(),
  total_cards: integer('total_cards').notNull(),
  completed_cards: integer('completed_cards').notNull().default(0),
  correct_answers: integer('correct_answers').notNull().default(0),
  started_at: timestamp('started_at').defaultNow().notNull(),
  completed_at: timestamp('completed_at'), // Nullable by default
});

// Relations
export const alphabetsRelations = relations(alphabetsTable, ({ many }) => ({
  letters: many(lettersTable),
  practiceSessions: many(practiceSessionsTable),
}));

export const lettersRelations = relations(lettersTable, ({ one }) => ({
  alphabet: one(alphabetsTable, {
    fields: [lettersTable.alphabet_id],
    references: [alphabetsTable.id],
  }),
}));

export const practiceSessionsRelations = relations(practiceSessionsTable, ({ one }) => ({
  alphabet: one(alphabetsTable, {
    fields: [practiceSessionsTable.alphabet_id],
    references: [alphabetsTable.id],
  }),
}));

// TypeScript types for the table schemas
export type Alphabet = typeof alphabetsTable.$inferSelect;
export type NewAlphabet = typeof alphabetsTable.$inferInsert;
export type Letter = typeof lettersTable.$inferSelect;
export type NewLetter = typeof lettersTable.$inferInsert;
export type PracticeSession = typeof practiceSessionsTable.$inferSelect;
export type NewPracticeSession = typeof practiceSessionsTable.$inferInsert;

// Export all tables and relations for proper query building
export const tables = { 
  alphabets: alphabetsTable,
  letters: lettersTable,
  practiceSessions: practiceSessionsTable
};
