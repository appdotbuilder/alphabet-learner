
import { db } from '../db';
import { practiceSessionsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type UpdatePracticeSessionInput, type PracticeSession } from '../schema';

export const updatePracticeSession = async (input: UpdatePracticeSessionInput): Promise<PracticeSession | null> => {
  try {
    // Build update object with only provided fields
    const updateData: Partial<typeof practiceSessionsTable.$inferInsert> = {};
    
    if (input.completed_cards !== undefined) {
      updateData.completed_cards = input.completed_cards;
    }
    
    if (input.correct_answers !== undefined) {
      updateData.correct_answers = input.correct_answers;
    }
    
    if (input.completed_at !== undefined) {
      updateData.completed_at = input.completed_at;
    }

    // Return null if no fields to update
    if (Object.keys(updateData).length === 0) {
      return null;
    }

    // Update the practice session
    const result = await db.update(practiceSessionsTable)
      .set(updateData)
      .where(eq(practiceSessionsTable.id, input.id))
      .returning()
      .execute();

    // Return null if no rows were updated (session not found)
    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error('Practice session update failed:', error);
    throw error;
  }
};
