
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { alphabetsTable } from '../db/schema';
import { type CreateAlphabetInput } from '../schema';
import { getAlphabets } from '../handlers/get_alphabets';

const testAlphabets: CreateAlphabetInput[] = [
  {
    type: 'french',
    name: 'French Alphabet',
    description: 'The French alphabet with 26 letters',
    total_letters: 26
  },
  {
    type: 'polish',
    name: 'Polish Alphabet',
    description: 'The Polish alphabet with 32 letters',
    total_letters: 32
  },
  {
    type: 'hebrew',
    name: 'Hebrew Alphabet',
    description: null,
    total_letters: 22
  }
];

describe('getAlphabets', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no alphabets exist', async () => {
    const result = await getAlphabets();

    expect(result).toEqual([]);
  });

  it('should return all alphabets', async () => {
    // Create test alphabets
    await db.insert(alphabetsTable)
      .values(testAlphabets)
      .execute();

    const result = await getAlphabets();

    expect(result).toHaveLength(3);
    
    // Verify all alphabets are returned
    const alphabetTypes = result.map(a => a.type).sort();
    expect(alphabetTypes).toEqual(['french', 'hebrew', 'polish']);
    
    // Verify structure of returned alphabets
    result.forEach(alphabet => {
      expect(alphabet.id).toBeDefined();
      expect(alphabet.type).toBeDefined();
      expect(alphabet.name).toBeDefined();
      expect(alphabet.total_letters).toBeTypeOf('number');
      expect(alphabet.created_at).toBeInstanceOf(Date);
    });
  });

  it('should return alphabets with correct data', async () => {
    // Create single test alphabet
    await db.insert(alphabetsTable)
      .values([testAlphabets[0]])
      .execute();

    const result = await getAlphabets();

    expect(result).toHaveLength(1);
    
    const alphabet = result[0];
    expect(alphabet.type).toEqual('french');
    expect(alphabet.name).toEqual('French Alphabet');
    expect(alphabet.description).toEqual('The French alphabet with 26 letters');
    expect(alphabet.total_letters).toEqual(26);
    expect(alphabet.id).toBeTypeOf('number');
    expect(alphabet.created_at).toBeInstanceOf(Date);
  });

  it('should handle alphabets with null descriptions', async () => {
    // Create alphabet with null description
    await db.insert(alphabetsTable)
      .values([testAlphabets[2]]) // Hebrew alphabet has null description
      .execute();

    const result = await getAlphabets();

    expect(result).toHaveLength(1);
    
    const alphabet = result[0];
    expect(alphabet.type).toEqual('hebrew');
    expect(alphabet.name).toEqual('Hebrew Alphabet');
    expect(alphabet.description).toBeNull();
    expect(alphabet.total_letters).toEqual(22);
  });
});
