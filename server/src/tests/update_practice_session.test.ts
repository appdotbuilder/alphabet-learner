
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { alphabetsTable, practiceSessionsTable } from '../db/schema';
import { type UpdatePracticeSessionInput, type CreateAlphabetInput, type CreatePracticeSessionInput } from '../schema';
import { updatePracticeSession } from '../handlers/update_practice_session';
import { eq } from 'drizzle-orm';

describe('updatePracticeSession', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testAlphabetId: number;
  let testSessionId: number;

  beforeEach(async () => {
    // Create test alphabet
    const alphabetInput: CreateAlphabetInput = {
      type: 'french',
      name: 'French Alphabet',
      description: 'Basic French alphabet',
      total_letters: 26
    };

    const alphabetResult = await db.insert(alphabetsTable)
      .values(alphabetInput)
      .returning()
      .execute();
    
    testAlphabetId = alphabetResult[0].id;

    // Create test practice session
    const sessionInput: CreatePracticeSessionInput = {
      alphabet_id: testAlphabetId,
      session_type: 'flashcard',
      total_cards: 10
    };

    const sessionResult = await db.insert(practiceSessionsTable)
      .values({
        ...sessionInput,
        completed_cards: 0,
        correct_answers: 0
      })
      .returning()
      .execute();

    testSessionId = sessionResult[0].id;
  });

  it('should update completed cards', async () => {
    const updateInput: UpdatePracticeSessionInput = {
      id: testSessionId,
      completed_cards: 5
    };

    const result = await updatePracticeSession(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(testSessionId);
    expect(result!.completed_cards).toEqual(5);
    expect(result!.correct_answers).toEqual(0); // Should remain unchanged
    expect(result!.completed_at).toBeNull(); // Should remain unchanged
  });

  it('should update correct answers', async () => {
    const updateInput: UpdatePracticeSessionInput = {
      id: testSessionId,
      correct_answers: 3
    };

    const result = await updatePracticeSession(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(testSessionId);
    expect(result!.completed_cards).toEqual(0); // Should remain unchanged
    expect(result!.correct_answers).toEqual(3);
    expect(result!.completed_at).toBeNull(); // Should remain unchanged
  });

  it('should update completion time', async () => {
    const completionTime = new Date();
    const updateInput: UpdatePracticeSessionInput = {
      id: testSessionId,
      completed_at: completionTime
    };

    const result = await updatePracticeSession(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(testSessionId);
    expect(result!.completed_cards).toEqual(0); // Should remain unchanged
    expect(result!.correct_answers).toEqual(0); // Should remain unchanged
    expect(result!.completed_at).toEqual(completionTime);
  });

  it('should update multiple fields at once', async () => {
    const completionTime = new Date();
    const updateInput: UpdatePracticeSessionInput = {
      id: testSessionId,
      completed_cards: 10,
      correct_answers: 8,
      completed_at: completionTime
    };

    const result = await updatePracticeSession(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(testSessionId);
    expect(result!.completed_cards).toEqual(10);
    expect(result!.correct_answers).toEqual(8);
    expect(result!.completed_at).toEqual(completionTime);
  });

  it('should save updates to database', async () => {
    const updateInput: UpdatePracticeSessionInput = {
      id: testSessionId,
      completed_cards: 7,
      correct_answers: 5
    };

    await updatePracticeSession(updateInput);

    // Verify in database
    const sessions = await db.select()
      .from(practiceSessionsTable)
      .where(eq(practiceSessionsTable.id, testSessionId))
      .execute();

    expect(sessions).toHaveLength(1);
    expect(sessions[0].completed_cards).toEqual(7);
    expect(sessions[0].correct_answers).toEqual(5);
  });

  it('should return null for non-existent session', async () => {
    const updateInput: UpdatePracticeSessionInput = {
      id: 99999, // Non-existent ID
      completed_cards: 5
    };

    const result = await updatePracticeSession(updateInput);

    expect(result).toBeNull();
  });

  it('should return null when no fields to update', async () => {
    const updateInput: UpdatePracticeSessionInput = {
      id: testSessionId
      // No update fields provided
    };

    const result = await updatePracticeSession(updateInput);

    expect(result).toBeNull();
  });

  it('should handle setting completed_at to null', async () => {
    // First set completion time
    await updatePracticeSession({
      id: testSessionId,
      completed_at: new Date()
    });

    // Then set it back to null
    const updateInput: UpdatePracticeSessionInput = {
      id: testSessionId,
      completed_at: null
    };

    const result = await updatePracticeSession(updateInput);

    expect(result).not.toBeNull();
    expect(result!.completed_at).toBeNull();
  });
});
