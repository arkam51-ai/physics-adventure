export class QuizManager {
  constructor(questionBank) {
    this.questionBank = questionBank;
  }

  start(levelId) {
    this.questions = this.shuffle(this.questionBank.getQuestions(levelId));
    this.index = 0;
    this.correct = 0;
    this.wrong = 0;
    this.missedTopics = [];
  }

  getCurrent() {
    return this.questions[this.index] ?? null;
  }

  answer(optionIndex) {
    const question = this.getCurrent();
    if (!question) throw new Error('Tidak ada pertanyaan yang sedang aktif.');
    const correct = optionIndex === question.answer;
    if (correct) this.correct += 1;
    else {
      this.wrong += 1;
      this.missedTopics.push(question.topic ?? question.formula);
    }
    const result = {
      correct,
      explanation: question.explanation,
      formula: question.formula,
      correctAnswer: question.options[question.answer]
    };
    this.index += 1;
    return result;
  }

  get total() {
    return this.questions?.length ?? 0;
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
