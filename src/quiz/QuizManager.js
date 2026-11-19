const QUESTION_HISTORY_KEY = 'physics-adventure-3d-question-history-v1';
const QUESTION_HISTORY_VERSION = 1;

export class QuizManager {
  constructor(questionBank) {
    this.questionBank = questionBank;
    this.questionHistoryStorageAvailable = true;
  }

  start(levelId, questionCount = 3, maxAttempts = 3) {
    this.questionPool = this.shuffle(this.questionBank.getQuestions(levelId));
    if (this.questionPool.length < questionCount * maxAttempts) {
      throw new Error(`Bank soal level "${levelId}" memerlukan sedikitnya ${questionCount * maxAttempts} soal unik.`);
    }
    this.levelId = levelId;
    this.questionHistoryLevels = this.readQuestionHistory();
    const questionKeys = new Set(this.questionPool.map((question) => question.question));
    this.displayedQuestionHistory = new Set(
      (this.questionHistoryLevels[levelId] ?? []).filter((key) => questionKeys.has(key))
    );
    if (this.displayedQuestionHistory.size >= questionKeys.size) {
      this.displayedQuestionHistory.clear();
      this.questionHistoryLevels[levelId] = [];
      this.persistQuestionHistory();
    }
    this.questionCount = questionCount;
    this.maxAttempts = maxAttempts;
    this.usedQuestions = new Set();
    this.attempt = 0;
    this.correct = 0;
    this.wrong = 0;
    this.answered = 0;
    this.missedTopics = [];
    this.attemptCorrect = 0;
    this.attemptIndex = 0;
    this.attemptQuestions = [];
    this.attemptTimedOut = false;
  }

  startAttempt() {
    if (this.attempt >= this.maxAttempts) {
      throw new Error('Batas percobaan checkpoint sudah tercapai.');
    }
    const available = this.questionPool;
    if (available.length < this.questionCount) {
      throw new Error(`Bank soal level hanya memiliki ${this.questionPool.length} soal untuk ${this.maxAttempts} percobaan.`);
    }
    const unseen = available.filter((question) => !this.displayedQuestionHistory.has(question.question));
    const firstQuestions = this.shuffle(unseen).slice(0, this.questionCount);
    const firstQuestionSet = new Set(firstQuestions);
    const remainingCount = this.questionCount - firstQuestions.length;
    const nextCycleQuestions = this.shuffle(available.filter((question) => !firstQuestionSet.has(question)));
    this.attemptQuestions = [
      ...firstQuestions,
      ...nextCycleQuestions.slice(0, remainingCount)
    ];
    this.attempt += 1;
    this.attemptCorrect = 0;
    this.attemptIndex = 0;
    this.attemptTimedOut = false;
  }

  getCurrent() {
    return this.attemptQuestions[this.attemptIndex] ?? null;
  }

  recordQuestionDisplayed(question = this.getCurrent()) {
    if (!question || question !== this.getCurrent() || this.displayedQuestionHistory.has(question.question)) return false;

    this.displayedQuestionHistory.add(question.question);
    const questionCount = new Set(this.questionPool.map((item) => item.question)).size;
    if (this.displayedQuestionHistory.size >= questionCount) this.displayedQuestionHistory.clear();
    this.questionHistoryLevels[this.levelId] = [...this.displayedQuestionHistory];
    this.persistQuestionHistory();
    return true;
  }

  readQuestionHistory() {
    let storage;
    let serialized;
    try {
      storage = globalThis.localStorage;
      if (!storage) throw new Error('localStorage tidak tersedia.');
      serialized = storage.getItem(QUESTION_HISTORY_KEY);
    } catch {
      this.questionHistoryStorageAvailable = false;
      return {};
    }

    if (!serialized) return {};
    try {
      const parsed = JSON.parse(serialized);
      if (
        parsed?.version !== QUESTION_HISTORY_VERSION
        || !parsed.levels
        || typeof parsed.levels !== 'object'
        || Array.isArray(parsed.levels)
      ) return {};
      return Object.fromEntries(Object.entries(parsed.levels).map(([levelId, keys]) => [
        levelId,
        Array.isArray(keys) && keys.every((key) => typeof key === 'string')
          ? [...new Set(keys)]
          : []
      ]));
    } catch {
      return {};
    }
  }

  persistQuestionHistory() {
    if (!this.questionHistoryStorageAvailable) return;
    try {
      globalThis.localStorage.setItem(QUESTION_HISTORY_KEY, JSON.stringify({
        version: QUESTION_HISTORY_VERSION,
        levels: this.questionHistoryLevels
      }));
    } catch {
      this.questionHistoryStorageAvailable = false;
    }
  }

  answer(optionIndex) {
    const question = this.getCurrent();
    if (!question || this.attemptTimedOut) {
      throw new Error('Tidak ada pertanyaan yang sedang aktif.');
    }
    const correct = optionIndex === question.answer;
    this.answered += 1;
    if (correct) {
      this.correct += 1;
      this.attemptCorrect += 1;
    } else {
      this.wrong += 1;
      this.missedTopics.push(question.topic ?? question.formula);
    }
    const result = {
      correct,
      explanation: question.explanation,
      formula: question.formula,
      correctAnswer: question.options[question.answer]
    };
    this.attemptIndex += 1;
    return result;
  }

  timeOutAttempt() {
    this.attemptTimedOut = true;
  }

  get attemptComplete() {
    return this.attemptIndex >= this.questionCount || this.attemptTimedOut;
  }

  get attemptPassed() {
    return this.attemptCorrect >= 2 && !this.attemptTimedOut;
  }

  get canRetry() {
    return this.attempt < this.maxAttempts;
  }

  get total() {
    return this.questionCount;
  }

  shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
