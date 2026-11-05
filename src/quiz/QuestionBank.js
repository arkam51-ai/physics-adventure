import { QUESTIONS } from '../data/questions.js';

export class QuestionBank {
  getQuestions(levelId) {
    const bank = QUESTIONS[levelId];
    if (!bank) throw new Error(`Bank soal tidak ditemukan untuk level "${levelId}".`);
    return [...bank];
  }
}
