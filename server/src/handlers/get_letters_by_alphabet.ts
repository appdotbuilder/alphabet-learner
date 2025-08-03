
import { db } from '../db';
import { lettersTable } from '../db/schema';
import { type GetLettersByAlphabetInput, type Letter } from '../schema';
import { eq, asc } from 'drizzle-orm';

export async function getLettersByAlphabet(input: GetLettersByAlphabetInput): Promise<Letter[]> {
  try {
    // Query letters for the specific alphabet, ordered by position
    const results = await db.select()
      .from(lettersTable)
      .where(eq(lettersTable.alphabet_id, input.alphabet_id))
      .orderBy(asc(lettersTable.order_position))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch letters by alphabet:', error);
    throw error;
  }
}
