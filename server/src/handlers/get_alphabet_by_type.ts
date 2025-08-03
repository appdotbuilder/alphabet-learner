
import { db } from '../db';
import { alphabetsTable } from '../db/schema';
import { type GetAlphabetByTypeInput, type Alphabet } from '../schema';
import { eq } from 'drizzle-orm';

export async function getAlphabetByType(input: GetAlphabetByTypeInput): Promise<Alphabet | null> {
  try {
    const result = await db.select()
      .from(alphabetsTable)
      .where(eq(alphabetsTable.type, input.type))
      .limit(1)
      .execute();

    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error('Failed to get alphabet by type:', error);
    throw error;
  }
}
