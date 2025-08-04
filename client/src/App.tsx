
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, BookOpen, Play, Check, X } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { Alphabet, Letter, PracticeSession, AlphabetType } from '../../server/src/schema';

// Fallback data for demonstration when backend returns empty arrays
const FALLBACK_ALPHABETS: Alphabet[] = [
  {
    id: 1,
    type: 'french' as AlphabetType,
    name: 'French Alphabet',
    description: 'The standard French alphabet with 26 letters',
    total_letters: 26,
    created_at: new Date()
  },
  {
    id: 2,
    type: 'german' as AlphabetType,
    name: 'German Alphabet',
    description: 'German alphabet including umlauts and ß',
    total_letters: 30,
    created_at: new Date()
  },
  {
    id: 3,
    type: 'hebrew' as AlphabetType,
    name: 'Hebrew Alphabet',
    description: 'The Hebrew alphabet with 22 letters',
    total_letters: 22,
    created_at: new Date()
  },
  {
    id: 4,
    type: 'georgian' as AlphabetType,
    name: 'Georgian Alphabet',
    description: 'The Georgian Mkhedruli script with 33 letters',
    total_letters: 33,
    created_at: new Date()
  }
];

const FALLBACK_LETTERS: Record<number, Letter[]> = {
  1: [
    { id: 1, alphabet_id: 1, letter: 'A', name: 'A', pronunciation: '/a/', pronunciation_guide: 'Like "ah"', order_position: 1, created_at: new Date() },
    { id: 2, alphabet_id: 1, letter: 'B', name: 'Bé', pronunciation: '/be/', pronunciation_guide: 'Like "bay"', order_position: 2, created_at: new Date() },
    { id: 3, alphabet_id: 1, letter: 'C', name: 'Cé', pronunciation: '/se/', pronunciation_guide: 'Like "say"', order_position: 3, created_at: new Date() }
  ],
  2: [
    { id: 4, alphabet_id: 2, letter: 'A', name: 'A', pronunciation: '/aː/', pronunciation_guide: 'Long "ah"', order_position: 1, created_at: new Date() },
    { id: 5, alphabet_id: 2, letter: 'Ä', name: 'Ä', pronunciation: '/ɛː/', pronunciation_guide: 'Like "air"', order_position: 2, created_at: new Date() },
    { id: 6, alphabet_id: 2, letter: 'B', name: 'Be', pronunciation: '/beː/', pronunciation_guide: 'Like "bay"', order_position: 3, created_at: new Date() }
  ],
  3: [
    { id: 7, alphabet_id: 3, letter: 'א', name: 'Aleph', pronunciation: 'silent', pronunciation_guide: 'Silent letter', order_position: 1, created_at: new Date() },
    { id: 8, alphabet_id: 3, letter: 'ב', name: 'Bet', pronunciation: '/b/ or /v/', pronunciation_guide: 'B or V sound', order_position: 2, created_at: new Date() },
    { id: 9, alphabet_id: 3, letter: 'ג', name: 'Gimel', pronunciation: '/g/', pronunciation_guide: 'G sound', order_position: 3, created_at: new Date() }
  ],
  4: [
    { id: 10, alphabet_id: 4, letter: 'ა', name: 'An', pronunciation: '/a/', pronunciation_guide: 'Like "ah"', order_position: 1, created_at: new Date() },
    { id: 11, alphabet_id: 4, letter: 'ბ', name: 'Ban', pronunciation: '/b/', pronunciation_guide: 'B sound', order_position: 2, created_at: new Date() },
    { id: 12, alphabet_id: 4, letter: 'გ', name: 'Gan', pronunciation: '/g/', pronunciation_guide: 'G sound', order_position: 3, created_at: new Date() }
  ]
};

type View = 'alphabets' | 'letters' | 'letter-detail' | 'practice';

interface AppState {
  view: View;
  selectedAlphabet: Alphabet | null;
  selectedLetter: Letter | null;
  currentSession: PracticeSession | null;
  error: string | null;
}

function App() {
  const [appState, setAppState] = useState<AppState>({
    view: 'alphabets',
    selectedAlphabet: null,
    selectedLetter: null,
    currentSession: null,
    error: null
  });

  const [alphabets, setAlphabets] = useState<Alphabet[]>([]);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [practiceLetters, setPracticeLetters] = useState<Letter[]>([]);
  const [currentPracticeIndex, setCurrentPracticeIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [practiceStats, setPracticeStats] = useState({ correct: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(false);

  // Timeout wrapper for tRPC queries
  const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), timeoutMs)
      )
    ]);
  };

  const loadAlphabets = useCallback(async () => {
    try {
      setIsLoading(true);
      setAppState(prev => ({ ...prev, error: null }));
      
      const result = await withTimeout(trpc.getAlphabets.query());
      if (result.length > 0) {
        setAlphabets(result);
      }
    } catch (error) {
      console.error('Failed to load alphabets:', error);
      const errorMessage = error instanceof Error && error.message === 'Request timed out'
        ? 'Request timed out. Please check your internet connection or try again later.'
        : 'Failed to load data. Please check your internet connection or try again later.';
      
      setAppState(prev => ({ ...prev, error: errorMessage }));
      // Keep fallback data, don't reset it
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize with fallback data immediately to prevent endless loading
  useEffect(() => {
    // Set fallback data immediately so the UI is never empty
    setAlphabets(FALLBACK_ALPHABETS);
    
    // Then try to load real data
    const loadData = async () => {
      try {
        setIsLoading(true);
        setAppState(prev => ({ ...prev, error: null }));
        
        const result = await withTimeout(trpc.getAlphabets.query());
        if (result.length > 0) {
          setAlphabets(result);
        }
      } catch (error) {
        console.error('Failed to load alphabets:', error);
        const errorMessage = error instanceof Error && error.message === 'Request timed out'
          ? 'Request timed out. Please check your internet connection or try again later.'
          : 'Failed to load data. Please check your internet connection or try again later.';
        
        setAppState(prev => ({ ...prev, error: errorMessage }));
        // Keep fallback data
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const loadLetters = useCallback(async (alphabetId: number) => {
    try {
      setIsLoading(true);
      setAppState(prev => ({ ...prev, error: null }));
      
      const result = await withTimeout(trpc.getLettersByAlphabet.query({ alphabet_id: alphabetId }));
      const lettersData = result.length > 0 ? result : FALLBACK_LETTERS[alphabetId] || [];
      setLetters(lettersData);
    } catch (error) {
      console.error('Failed to load letters:', error);
      const errorMessage = error instanceof Error && error.message === 'Request timed out'
        ? 'Request timed out. Please check your internet connection or try again later.'
        : 'Failed to load letters. Please check your internet connection or try again later.';
      
      setAppState(prev => ({ ...prev, error: errorMessage }));
      setLetters(FALLBACK_LETTERS[alphabetId] || []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startPractice = useCallback(async (alphabet: Alphabet) => {
    try {
      setIsLoading(true);
      setAppState(prev => ({ ...prev, error: null }));
      
      const session = await withTimeout(trpc.createPracticeSession.mutate({
        alphabet_id: alphabet.id,
        session_type: 'flashcard',
        total_cards: 10
      }));
      
      const randomLetters = await withTimeout(trpc.getRandomLetters.query({ alphabet_id: alphabet.id }));
      const practiceData = randomLetters.length > 0 ? randomLetters : FALLBACK_LETTERS[alphabet.id]?.slice(0, 3) || [];
      
      setPracticeLetters(practiceData);
      setAppState(prev => ({ ...prev, view: 'practice', currentSession: session }));
      setCurrentPracticeIndex(0);
      setShowAnswer(false);
      setPracticeStats({ correct: 0, total: 0 });
    } catch (error) {
      console.error('Failed to start practice:', error);
      const errorMessage = error instanceof Error && error.message === 'Request timed out'
        ? 'Request timed out. Please check your internet connection or try again later.'
        : 'Failed to start practice session. Please check your internet connection or try again later.';
      
      setAppState(prev => ({ ...prev, error: errorMessage }));
      
      // Fallback to demo practice with available letters
      const practiceData = FALLBACK_LETTERS[alphabet.id]?.slice(0, 3) || [];
      if (practiceData.length > 0) {
        setPracticeLetters(practiceData);
        setAppState(prev => ({ ...prev, view: 'practice', currentSession: null }));
        setCurrentPracticeIndex(0);
        setShowAnswer(false);
        setPracticeStats({ correct: 0, total: 0 });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);



  const selectAlphabet = (alphabet: Alphabet) => {
    setAppState(prev => ({ ...prev, selectedAlphabet: alphabet, view: 'letters' }));
    loadLetters(alphabet.id);
  };

  const selectLetter = (letter: Letter) => {
    setAppState(prev => ({ ...prev, selectedLetter: letter, view: 'letter-detail' }));
  };

  const goBack = () => {
    if (appState.view === 'letter-detail') {
      setAppState(prev => ({ ...prev, view: 'letters', selectedLetter: null, error: null }));
    } else if (appState.view === 'letters') {
      setAppState(prev => ({ ...prev, view: 'alphabets', selectedAlphabet: null, error: null }));
      setLetters([]);
    } else if (appState.view === 'practice') {
      setAppState(prev => ({ ...prev, view: 'letters', currentSession: null, error: null }));
      setPracticeLetters([]);
    }
  };

  const retryDataLoad = () => {
    if (appState.view === 'alphabets') {
      loadAlphabets();
    } else if (appState.view === 'letters' && appState.selectedAlphabet) {
      loadLetters(appState.selectedAlphabet.id);
    }
  };

  const handlePracticeAnswer = (isCorrect: boolean) => {
    setPracticeStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    setTimeout(() => {
      if (currentPracticeIndex < practiceLetters.length - 1) {
        setCurrentPracticeIndex(prev => prev + 1);
        setShowAnswer(false);
      } else {
        alert(`Practice completed! Score: ${practiceStats.correct + (isCorrect ? 1 : 0)}/${practiceStats.total + 1}`);
        goBack();
      }
    }, 1500);
  };

  const getAlphabetIcon = (type: AlphabetType) => {
    const icons: Record<AlphabetType, string> = {
      french: '🇫🇷',
      polish: '🇵🇱',
      portuguese: '🇵🇹',
      german: '🇩🇪',
      belarusian: '🇧🇾',
      georgian: '🇬🇪',
      hebrew: '🇮🇱'
    };
    return icons[type] || '📝';
  };

  if (isLoading && appState.view === 'alphabets' && alphabets.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading alphabets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          {appState.view !== 'alphabets' && (
            <Button variant="ghost" size="sm" onClick={goBack} className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              Alphabet Learning
            </h1>
            {appState.selectedAlphabet && (
              <p className="text-gray-600 mt-1">
                {getAlphabetIcon(appState.selectedAlphabet.type)} {appState.selectedAlphabet.name}
              </p>
            )}
          </div>
        </div>

        {/* Error Message */}
        {appState.error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <X className="h-5 w-5 text-red-600" />
                  <p className="text-red-800">{appState.error}</p>
                </div>
                <Button 
                  onClick={retryDataLoad}
                  variant="outline" 
                  size="sm"
                  className="text-red-600 border-red-300 hover:bg-red-100"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alphabet Selection */}
        {appState.view === 'alphabets' && (
          <div>
            <p className="text-gray-600 mb-6">Choose an alphabet to start learning</p>
            {appState.error && alphabets.length > 0 && (
              <p className="text-amber-600 text-sm mb-4 bg-amber-50 p-3 rounded-lg">
                ⚠️ Showing fallback data due to connection issues. Some features may be limited.
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alphabets.map((alphabet: Alphabet) => (
                <Card 
                  key={alphabet.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow bg-white/70 backdrop-blur-sm"
                  onClick={() => selectAlphabet(alphabet)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <span className="text-2xl">{getAlphabetIcon(alphabet.type)}</span>
                      {alphabet.name}
                    </CardTitle>
                    <CardDescription>{alphabet.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary" className="text-xs">
                      {alphabet.total_letters} letters
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
            {alphabets.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <p className="text-gray-500">No alphabets available.</p>
                <Button 
                  onClick={retryDataLoad}
                  variant="outline" 
                  className="mt-4"
                >
                  Retry Loading
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Letters Grid */}
        {appState.view === 'letters' && appState.selectedAlphabet && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Letters
                  {isLoading && <span className="ml-2 text-sm text-gray-500">(Loading...)</span>}
                </h2>
                <p className="text-gray-600">Tap any letter to learn more</p>
              </div>
              <Button 
                onClick={() => startPractice(appState.selectedAlphabet!)}
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={letters.length === 0 || isLoading}
              >
                <Play className="h-4 w-4 mr-2" />
                Practice
              </Button>
            </div>
            
            {appState.error && letters.length > 0 && (
              <p className="text-amber-600 text-sm mb-4 bg-amber-50 p-3 rounded-lg">
                ⚠️ Showing fallback data due to connection issues. Some features may be limited.
              </p>
            )}
            
            {letters.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {letters.map((letter: Letter) => (
                  <Card 
                    key={letter.id}
                    className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 bg-white/70 backdrop-blur-sm"
                    onClick={() => selectLetter(letter)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl font-bold text-indigo-600 mb-2">
                        {letter.letter}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">
                        {letter.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Position {letter.order_position}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : !isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No letters available for this alphabet.</p>
                <Button 
                  onClick={retryDataLoad}
                  variant="outline" 
                  className="mt-4"
                >
                  Retry Loading
                </Button>
              </div>
            ) : null}
          </div>
        )}

        {/* Letter Detail */}
        {appState.view === 'letter-detail' && appState.selectedLetter && (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <div className="text-8xl font-bold text-indigo-600 mb-4">
                  {appState.selectedLetter.letter}
                </div>
                <CardTitle className="text-3xl">{appState.selectedLetter.name}</CardTitle>
                {appState.selectedLetter.pronunciation && (
                  <CardDescription className="text-lg">
                    Pronunciation: <span className="font-mono text-indigo-600">
                      {appState.selectedLetter.pronunciation}
                    </span>
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {appState.selectedLetter.pronunciation_guide && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Pronunciation Guide</h3>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {appState.selectedLetter.pronunciation_guide}
                    </p>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600 pt-4 border-t">
                  <span>Position: {appState.selectedLetter.order_position}</span>
                  <span>ID: {appState.selectedLetter.id}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Practice Mode */}
        {appState.view === 'practice' && practiceLetters.length > 0 && (
          <div className="max-w-2xl mx-auto">
            {appState.error && (
              <p className="text-amber-600 text-sm mb-4 bg-amber-50 p-3 rounded-lg">
                ⚠️ Using fallback practice data due to connection issues.
              </p>
            )}
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  Card {currentPracticeIndex + 1} of {practiceLetters.length}
                </span>
                <span className="text-sm text-gray-600">
                  Score: {practiceStats.correct}/{practiceStats.total}
                </span>
              </div>
              <Progress 
                value={((currentPracticeIndex + 1) / practiceLetters.length) * 100} 
                className="h-2"
              />
            </div>

            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <div className="text-8xl font-bold text-indigo-600 mb-4">
                  {practiceLetters[currentPracticeIndex]?.letter}
                </div>
                {!showAnswer ? (
                  <div>
                    <CardTitle className="text-xl mb-4">What is this letter?</CardTitle>
                    <Button 
                      onClick={() => setShowAnswer(true)}
                      variant="outline"
                      className="mb-4"
                    >
                      Show Answer
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <CardTitle className="text-2xl text-green-600">
                      {practiceLetters[currentPracticeIndex]?.name}
                    </CardTitle>
                    {practiceLetters[currentPracticeIndex]?.pronunciation && (
                      <CardDescription className="text-lg">
                        {practiceLetters[currentPracticeIndex]?.pronunciation}
                      </CardDescription>
                    )}
                    {practiceLetters[currentPracticeIndex]?.pronunciation_guide && (
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {practiceLetters[currentPracticeIndex]?.pronunciation_guide}
                      </p>
                    )}
                    <div className="flex gap-4 justify-center pt-4">
                      <Button 
                        onClick={() => handlePracticeAnswer(false)}
                        variant="outline"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Incorrect
                      </Button>
                      <Button 
                        onClick={() => handlePracticeAnswer(true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Correct
                      </Button>
                    </div>
                  </div>
                )}
              </CardHeader>
            </Card>
          </div>
        )}

        {appState.view === 'practice' && practiceLetters.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No practice letters available.</p>
            <Button 
              onClick={goBack}
              variant="outline" 
              className="mt-4"
            >
              Go Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
