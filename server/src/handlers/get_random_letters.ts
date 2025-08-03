
import { db } from '../db';
import { lettersTable } from '../db/schema';
import { type GetLettersByAlphabetInput, type Letter } from '../schema';
import { eq, sql } from 'drizzle-orm';

export async function getRandomLetters(input: GetLettersByAlphabetInput): Promise<Letter[]> {
  try {
    // Get all letters for the alphabet in random order
    const results = await db.select()
      .from(lettersTable)
      .where(eq(lettersTable.alphabet_id, input.alphabet_id))
      .orderBy(sql`RANDOM()`)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to get random letters:', error);
    throw error;
  }
}
