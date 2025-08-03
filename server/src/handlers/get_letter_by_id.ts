
import { db } from '../db';
import { lettersTable } from '../db/schema';
import { type GetLetterByIdInput, type Letter } from '../schema';
import { eq } from 'drizzle-orm';

export const getLetterById = async (input: GetLetterByIdInput): Promise<Letter | null> => {
  try {
    const result = await db.select()
      .from(lettersTable)
      .where(eq(lettersTable.id, input.id))
      .execute();

    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error('Failed to get letter by id:', error);
    throw error;
  }
};
