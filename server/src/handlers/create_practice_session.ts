
import { db } from '../db';
import { practiceSessionsTable, alphabetsTable } from '../db/schema';
import { type CreatePracticeSessionInput, type PracticeSession } from '../schema';
import { eq } from 'drizzle-orm';

export const createPracticeSession = async (input: CreatePracticeSessionInput): Promise<PracticeSession> => {
  try {
    // Verify alphabet exists to prevent foreign key constraint violations
    const alphabets = await db.select()
      .from(alphabetsTable)
      .where(eq(alphabetsTable.id, input.alphabet_id))
      .execute();

    if (alphabets.length === 0) {
      throw new Error(`Alphabet with id ${input.alphabet_id} not found`);
    }

    // Insert practice session record
    const result = await db.insert(practiceSessionsTable)
      .values({
        alphabet_id: input.alphabet_id,
        session_type: input.session_type,
        total_cards: input.total_cards,
        completed_cards: 0, // Default value
        correct_answers: 0, // Default value
        started_at: new Date(),
        completed_at: null // Default to null
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Practice session creation failed:', error);
    throw error;
  }
};
