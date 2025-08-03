
import { db } from '../db';
import { alphabetsTable } from '../db/schema';
import { type Alphabet } from '../schema';

export const getAlphabets = async (): Promise<Alphabet[]> => {
  try {
    const results = await db.select()
      .from(alphabetsTable)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch alphabets:', error);
    throw error;
  }
};
