
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { alphabetsTable, lettersTable } from '../db/schema';
import { type GetLettersByAlphabetInput } from '../schema';
import { getRandomLetters } from '../handlers/get_random_letters';

describe('getRandomLetters', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return all letters for a given alphabet', async () => {
    // Create test alphabet
    const alphabetResult = await db.insert(alphabetsTable)
      .values({
        type: 'french',
        name: 'French Alphabet',
        description: 'Standard French alphabet',
        total_letters: 3
      })
      .returning()
      .execute();

    const alphabetId = alphabetResult[0].id;

    // Create test letters
    await db.insert(lettersTable)
      .values([
        {
          alphabet_id: alphabetId,
          letter: 'A',
          name: 'A',
          pronunciation: 'ah',
          pronunciation_guide: 'Like "ah" in father',
          order_position: 1
        },
        {
          alphabet_id: alphabetId,
          letter: 'B',
          name: 'B',
          pronunciation: 'bay',
          pronunciation_guide: 'Like "bay"',
          order_position: 2
        },
        {
          alphabet_id: alphabetId,
          letter: 'C',
          name: 'C',
          pronunciation: 'say',
          pronunciation_guide: 'Like "say"',
          order_position: 3
        }
      ])
      .execute();

    const input: GetLettersByAlphabetInput = {
      alphabet_id: alphabetId
    };

    const result = await getRandomLetters(input);

    // Should return all letters
    expect(result).toHaveLength(3);
    
    // Check that all expected letters are present
    const letters = result.map(l => l.letter).sort();
    expect(letters).toEqual(['A', 'B', 'C']);

    // Verify letter properties
    result.forEach(letter => {
      expect(letter.id).toBeDefined();
      expect(letter.alphabet_id).toEqual(alphabetId);
      expect(letter.letter).toBeDefined();
      expect(letter.name).toBeDefined();
      expect(letter.order_position).toBeGreaterThan(0);
      expect(letter.created_at).toBeInstanceOf(Date);
    });
  });

  it('should return empty array for non-existent alphabet', async () => {
    const input: GetLettersByAlphabetInput = {
      alphabet_id: 999
    };

    const result = await getRandomLetters(input);

    expect(result).toHaveLength(0);
  });

  it('should return letters in potentially different order across calls', async () => {
    // Create test alphabet
    const alphabetResult = await db.insert(alphabetsTable)
      .values({
        type: 'german',
        name: 'German Alphabet',
        description: 'German alphabet for testing',
        total_letters: 5
      })
      .returning()
      .execute();

    const alphabetId = alphabetResult[0].id;

    // Create multiple test letters
    await db.insert(lettersTable)
      .values([
        { alphabet_id: alphabetId, letter: 'A', name: 'A', order_position: 1 },
        { alphabet_id: alphabetId, letter: 'B', name: 'B', order_position: 2 },
        { alphabet_id: alphabetId, letter: 'C', name: 'C', order_position: 3 },
        { alphabet_id: alphabetId, letter: 'D', name: 'D', order_position: 4 },
        { alphabet_id: alphabetId, letter: 'E', name: 'E', order_position: 5 }
      ])
      .execute();

    const input: GetLettersByAlphabetInput = {
      alphabet_id: alphabetId
    };

    // Make multiple calls
    const result1 = await getRandomLetters(input);
    const result2 = await getRandomLetters(input);

    // Both should have all letters
    expect(result1).toHaveLength(5);
    expect(result2).toHaveLength(5);

    // Both should have the same letters (different order is possible but not guaranteed)
    const letters1 = result1.map(l => l.letter).sort();
    const letters2 = result2.map(l => l.letter).sort();
    expect(letters1).toEqual(['A', 'B', 'C', 'D', 'E']);
    expect(letters2).toEqual(['A', 'B', 'C', 'D', 'E']);
  });

  it('should handle alphabet with single letter', async () => {
    // Create test alphabet
    const alphabetResult = await db.insert(alphabetsTable)
      .values({
        type: 'hebrew',
        name: 'Test Single Letter',
        description: 'Single letter test',
        total_letters: 1
      })
      .returning()
      .execute();

    const alphabetId = alphabetResult[0].id;

    // Create single test letter
    await db.insert(lettersTable)
      .values({
        alphabet_id: alphabetId,
        letter: 'א',
        name: 'Aleph',
        pronunciation: 'aleph',
        pronunciation_guide: 'Silent or glottal stop',
        order_position: 1
      })
      .execute();

    const input: GetLettersByAlphabetInput = {
      alphabet_id: alphabetId
    };

    const result = await getRandomLetters(input);

    expect(result).toHaveLength(1);
    expect(result[0].letter).toEqual('א');
    expect(result[0].name).toEqual('Aleph');
    expect(result[0].pronunciation).toEqual('aleph');
  });
});
