
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { practiceSessionsTable, alphabetsTable } from '../db/schema';
import { type CreatePracticeSessionInput } from '../schema';
import { createPracticeSession } from '../handlers/create_practice_session';
import { eq } from 'drizzle-orm';

describe('createPracticeSession', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testAlphabetId: number;

  // Create prerequisite alphabet data before each test
  beforeEach(async () => {
    const alphabetResult = await db.insert(alphabetsTable)
      .values({
        type: 'french',
        name: 'French Alphabet',
        description: 'Standard French alphabet',
        total_letters: 26
      })
      .returning()
      .execute();
    
    testAlphabetId = alphabetResult[0].id;
  });

  const createTestInput = (overrides: Partial<CreatePracticeSessionInput> = {}): CreatePracticeSessionInput => ({
    alphabet_id: testAlphabetId,
    session_type: 'flashcard',
    total_cards: 20,
    ...overrides
  });

  it('should create a practice session', async () => {
    const testInput = createTestInput();
    const result = await createPracticeSession(testInput);

    // Basic field validation
    expect(result.alphabet_id).toEqual(testAlphabetId);
    expect(result.session_type).toEqual('flashcard');
    expect(result.total_cards).toEqual(20);
    expect(result.completed_cards).toEqual(0);
    expect(result.correct_answers).toEqual(0);
    expect(result.id).toBeDefined();
    expect(result.started_at).toBeInstanceOf(Date);
    expect(result.completed_at).toBeNull();
  });

  it('should save practice session to database', async () => {
    const testInput = createTestInput();
    const result = await createPracticeSession(testInput);

    // Query database to verify session was saved
    const sessions = await db.select()
      .from(practiceSessionsTable)
      .where(eq(practiceSessionsTable.id, result.id))
      .execute();

    expect(sessions).toHaveLength(1);
    expect(sessions[0].alphabet_id).toEqual(testAlphabetId);
    expect(sessions[0].session_type).toEqual('flashcard');
    expect(sessions[0].total_cards).toEqual(20);
    expect(sessions[0].completed_cards).toEqual(0);
    expect(sessions[0].correct_answers).toEqual(0);
    expect(sessions[0].started_at).toBeInstanceOf(Date);
    expect(sessions[0].completed_at).toBeNull();
  });

  it('should create quiz session type', async () => {
    const testInput = createTestInput({
      session_type: 'quiz',
      total_cards: 15
    });
    
    const result = await createPracticeSession(testInput);

    expect(result.session_type).toEqual('quiz');
    expect(result.total_cards).toEqual(15);
  });

  it('should throw error for non-existent alphabet', async () => {
    const testInput = createTestInput({
      alphabet_id: 99999 // Non-existent alphabet ID
    });

    await expect(createPracticeSession(testInput))
      .rejects.toThrow(/alphabet with id 99999 not found/i);
  });

  it('should initialize session with current timestamp', async () => {
    const beforeTime = new Date();
    const testInput = createTestInput();
    const result = await createPracticeSession(testInput);
    const afterTime = new Date();

    expect(result.started_at).toBeInstanceOf(Date);
    expect(result.started_at >= beforeTime).toBe(true);
    expect(result.started_at <= afterTime).toBe(true);
  });
});
