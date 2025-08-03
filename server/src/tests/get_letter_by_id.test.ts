
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { alphabetsTable, lettersTable } from '../db/schema';
import { type GetLetterByIdInput, type CreateAlphabetInput, type CreateLetterInput } from '../schema';
import { getLetterById } from '../handlers/get_letter_by_id';

// Test data
const testAlphabet: CreateAlphabetInput = {
  type: 'french',
  name: 'French Alphabet',
  description: 'The French alphabet for testing',
  total_letters: 26
};

const testLetter: CreateLetterInput = {
  alphabet_id: 1, // Will be set after alphabet creation
  letter: 'A',
  name: 'A',
  pronunciation: 'ah',
  pronunciation_guide: 'Like "ah" in father',
  order_position: 1
};

describe('getLetterById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return a letter by id', async () => {
    // Create alphabet first
    const alphabetResult = await db.insert(alphabetsTable)
      .values(testAlphabet)
      .returning()
      .execute();
    
    const alphabetId = alphabetResult[0].id;

    // Create letter
    const letterResult = await db.insert(lettersTable)
      .values({
        ...testLetter,
        alphabet_id: alphabetId
      })
      .returning()
      .execute();

    const letterId = letterResult[0].id;

    // Test the handler
    const input: GetLetterByIdInput = { id: letterId };
    const result = await getLetterById(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(letterId);
    expect(result!.alphabet_id).toEqual(alphabetId);
    expect(result!.letter).toEqual('A');
    expect(result!.name).toEqual('A');
    expect(result!.pronunciation).toEqual('ah');
    expect(result!.pronunciation_guide).toEqual('Like "ah" in father');
    expect(result!.order_position).toEqual(1);
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent letter id', async () => {
    const input: GetLetterByIdInput = { id: 999 };
    const result = await getLetterById(input);

    expect(result).toBeNull();
  });

  it('should handle letter with null pronunciation fields', async () => {
    // Create alphabet first
    const alphabetResult = await db.insert(alphabetsTable)
      .values(testAlphabet)
      .returning()
      .execute();
    
    const alphabetId = alphabetResult[0].id;

    // Create letter with null pronunciation fields
    const letterWithNulls: CreateLetterInput = {
      alphabet_id: alphabetId,
      letter: 'B',
      name: 'Be',
      pronunciation: null,
      pronunciation_guide: null,
      order_position: 2
    };

    const letterResult = await db.insert(lettersTable)
      .values(letterWithNulls)
      .returning()
      .execute();

    const letterId = letterResult[0].id;

    // Test the handler
    const input: GetLetterByIdInput = { id: letterId };
    const result = await getLetterById(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(letterId);
    expect(result!.letter).toEqual('B');
    expect(result!.name).toEqual('Be');
    expect(result!.pronunciation).toBeNull();
    expect(result!.pronunciation_guide).toBeNull();
    expect(result!.order_position).toEqual(2);
  });
});
