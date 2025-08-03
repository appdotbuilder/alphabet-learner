
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { alphabetsTable, lettersTable } from '../db/schema';
import { type GetLettersByAlphabetInput, type CreateAlphabetInput, type CreateLetterInput } from '../schema';
import { getLettersByAlphabet } from '../handlers/get_letters_by_alphabet';

// Test data
const testAlphabet: CreateAlphabetInput = {
  type: 'french',
  name: 'French Alphabet',
  description: 'Standard French alphabet',
  total_letters: 3
};

const testLetters: CreateLetterInput[] = [
  {
    alphabet_id: 1, // Will be set after alphabet creation
    letter: 'A',
    name: 'A',
    pronunciation: 'ah',
    pronunciation_guide: 'Like "ah" in father',
    order_position: 1
  },
  {
    alphabet_id: 1, // Will be set after alphabet creation
    letter: 'B',
    name: 'B',
    pronunciation: 'bay',
    pronunciation_guide: 'Like "bay"',
    order_position: 2
  },
  {
    alphabet_id: 1, // Will be set after alphabet creation
    letter: 'C',
    name: 'C',
    pronunciation: 'say',
    pronunciation_guide: 'Like "say"',
    order_position: 3
  }
];

describe('getLettersByAlphabet', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return letters for a specific alphabet ordered by position', async () => {
    // Create alphabet first
    const alphabetResult = await db.insert(alphabetsTable)
      .values({
        type: testAlphabet.type,
        name: testAlphabet.name,
        description: testAlphabet.description,
        total_letters: testAlphabet.total_letters
      })
      .returning()
      .execute();

    const alphabetId = alphabetResult[0].id;

    // Create letters with correct alphabet_id
    const lettersToInsert = testLetters.map(letter => ({
      ...letter,
      alphabet_id: alphabetId
    }));

    await db.insert(lettersTable)
      .values(lettersToInsert)
      .execute();

    // Test the handler
    const input: GetLettersByAlphabetInput = {
      alphabet_id: alphabetId
    };

    const result = await getLettersByAlphabet(input);

    // Verify results
    expect(result).toHaveLength(3);
    expect(result[0].letter).toEqual('A');
    expect(result[0].order_position).toEqual(1);
    expect(result[1].letter).toEqual('B');
    expect(result[1].order_position).toEqual(2);
    expect(result[2].letter).toEqual('C');
    expect(result[2].order_position).toEqual(3);

    // Verify proper ordering by checking order_position sequence
    for (let i = 0; i < result.length; i++) {
      expect(result[i].order_position).toEqual(i + 1);
    }
  });

  it('should return empty array for non-existent alphabet', async () => {
    const input: GetLettersByAlphabetInput = {
      alphabet_id: 999
    };

    const result = await getLettersByAlphabet(input);

    expect(result).toHaveLength(0);
  });

  it('should return letters in correct order even when inserted out of order', async () => {
    // Create alphabet first
    const alphabetResult = await db.insert(alphabetsTable)
      .values({
        type: testAlphabet.type,
        name: testAlphabet.name,
        description: testAlphabet.description,
        total_letters: testAlphabet.total_letters
      })
      .returning()
      .execute();

    const alphabetId = alphabetResult[0].id;

    // Insert letters in reverse order to test ordering
    const reversedLetters = [...testLetters].reverse().map(letter => ({
      ...letter,
      alphabet_id: alphabetId
    }));

    await db.insert(lettersTable)
      .values(reversedLetters)
      .execute();

    // Test the handler
    const input: GetLettersByAlphabetInput = {
      alphabet_id: alphabetId
    };

    const result = await getLettersByAlphabet(input);

    // Should still be ordered by position, not insertion order
    expect(result).toHaveLength(3);
    expect(result[0].letter).toEqual('A');
    expect(result[0].order_position).toEqual(1);
    expect(result[1].letter).toEqual('B');
    expect(result[1].order_position).toEqual(2);
    expect(result[2].letter).toEqual('C');
    expect(result[2].order_position).toEqual(3);
  });

  it('should only return letters for the specified alphabet', async () => {
    // Create two alphabets
    const alphabet1Result = await db.insert(alphabetsTable)
      .values({
        type: 'french',
        name: 'French Alphabet',
        description: 'French letters',
        total_letters: 2
      })
      .returning()
      .execute();

    const alphabet2Result = await db.insert(alphabetsTable)
      .values({
        type: 'german',
        name: 'German Alphabet',
        description: 'German letters',
        total_letters: 2
      })
      .returning()
      .execute();

    const alphabet1Id = alphabet1Result[0].id;
    const alphabet2Id = alphabet2Result[0].id;

    // Create letters for both alphabets
    await db.insert(lettersTable)
      .values([
        {
          alphabet_id: alphabet1Id,
          letter: 'A',
          name: 'A French',
          pronunciation: 'ah',
          pronunciation_guide: null,
          order_position: 1
        },
        {
          alphabet_id: alphabet2Id,
          letter: 'A',
          name: 'A German',
          pronunciation: 'ah',
          pronunciation_guide: null,
          order_position: 1
        }
      ])
      .execute();

    // Query letters for alphabet 1
    const input: GetLettersByAlphabetInput = {
      alphabet_id: alphabet1Id
    };

    const result = await getLettersByAlphabet(input);

    // Should only return letters for alphabet 1
    expect(result).toHaveLength(1);
    expect(result[0].alphabet_id).toEqual(alphabet1Id);
    expect(result[0].name).toEqual('A French');
  });
});
