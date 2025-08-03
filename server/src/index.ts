
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

import { 
  getAlphabetByTypeInputSchema,
  getLettersByAlphabetInputSchema,
  getLetterByIdInputSchema,
  createPracticeSessionInputSchema,
  updatePracticeSessionInputSchema
} from './schema';

import { getAlphabets } from './handlers/get_alphabets';
import { getAlphabetByType } from './handlers/get_alphabet_by_type';
import { getLettersByAlphabet } from './handlers/get_letters_by_alphabet';
import { getLetterById } from './handlers/get_letter_by_id';
import { createPracticeSession } from './handlers/create_practice_session';
import { updatePracticeSession } from './handlers/update_practice_session';
import { getRandomLetters } from './handlers/get_random_letters';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Alphabet routes
  getAlphabets: publicProcedure
    .query(() => getAlphabets()),
  
  getAlphabetByType: publicProcedure
    .input(getAlphabetByTypeInputSchema)
    .query(({ input }) => getAlphabetByType(input)),
  
  // Letter routes
  getLettersByAlphabet: publicProcedure
    .input(getLettersByAlphabetInputSchema)
    .query(({ input }) => getLettersByAlphabet(input)),
  
  getLetterById: publicProcedure
    .input(getLetterByIdInputSchema)
    .query(({ input }) => getLetterById(input)),
  
  getRandomLetters: publicProcedure
    .input(getLettersByAlphabetInputSchema)
    .query(({ input }) => getRandomLetters(input)),
  
  // Practice session routes
  createPracticeSession: publicProcedure
    .input(createPracticeSessionInputSchema)
    .mutation(({ input }) => createPracticeSession(input)),
  
  updatePracticeSession: publicProcedure
    .input(updatePracticeSessionInputSchema)
    .mutation(({ input }) => updatePracticeSession(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
