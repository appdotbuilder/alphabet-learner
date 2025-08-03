
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { alphabetsTable } from '../db/schema';
import { type CreateAlphabetInput, type GetAlphabetByTypeInput } from '../schema';
import { getAlphabetByType } from '../handlers/get_alphabet_by_type';

describe('getAlphabetByType', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return alphabet when type exists', async () => {
    // Create test alphabet
    const testAlphabet: CreateAlphabetInput = {
      type: 'french',
      name: 'French Alphabet',
      description: 'The standard French alphabet',
      total_letters: 26
    };

    await db.insert(alphabetsTable)
      .values({
        type: testAlphabet.type,
        name: testAlphabet.name,
        description: testAlphabet.description,
        total_letters: testAlphabet.total_letters
      })
      .execute();

    const input: GetAlphabetByTypeInput = {
      type: 'french'
    };

    const result = await getAlphabetByType(input);

    expect(result).toBeDefined();
    expect(result!.type).toBe('french');
    expect(result!.name).toBe('French Alphabet');
    expect(result!.description).toBe('The standard French alphabet');
    expect(result!.total_letters).toBe(26);
    expect(result!.id).toBeDefined();
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should return null when type does not exist', async () => {
    const input: GetAlphabetByTypeInput = {
      type: 'hebrew'
    };

    const result = await getAlphabetByType(input);

    expect(result).toBeNull();
  });

  it('should return correct alphabet when multiple alphabets exist', async () => {
    // Create multiple test alphabets
    const frenchAlphabet: CreateAlphabetInput = {
      type: 'french',
      name: 'French Alphabet',
      description: 'French letters',
      total_letters: 26
    };

    const germanAlphabet: CreateAlphabetInput = {
      type: 'german',
      name: 'German Alphabet',
      description: 'German letters',
      total_letters: 26
    };

    await db.insert(alphabetsTable)
      .values([
        {
          type: frenchAlphabet.type,
          name: frenchAlphabet.name,
          description: frenchAlphabet.description,
          total_letters: frenchAlphabet.total_letters
        },
        {
          type: germanAlphabet.type,
          name: germanAlphabet.name,
          description: germanAlphabet.description,
          total_letters: germanAlphabet.total_letters
        }
      ])
      .execute();

    const input: GetAlphabetByTypeInput = {
      type: 'german'
    };

    const result = await getAlphabetByType(input);

    expect(result).toBeDefined();
    expect(result!.type).toBe('german');
    expect(result!.name).toBe('German Alphabet');
    expect(result!.description).toBe('German letters');
    expect(result!.total_letters).toBe(26);
  });

  it('should handle null description correctly', async () => {
    const testAlphabet: CreateAlphabetInput = {
      type: 'polish',
      name: 'Polish Alphabet',
      description: null,
      total_letters: 32
    };

    await db.insert(alphabetsTable)
      .values({
        type: testAlphabet.type,
        name: testAlphabet.name,
        description: testAlphabet.description,
        total_letters: testAlphabet.total_letters
      })
      .execute();

    const input: GetAlphabetByTypeInput = {
      type: 'polish'
    };

    const result = await getAlphabetByType(input);

    expect(result).toBeDefined();
    expect(result!.type).toBe('polish');
    expect(result!.name).toBe('Polish Alphabet');
    expect(result!.description).toBeNull();
    expect(result!.total_letters).toBe(32);
  });
});
