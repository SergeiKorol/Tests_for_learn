import type { Question } from '@/domain/types';

interface QuestionViewProps {
  question: Question;
  selectedIndex: number | null | undefined;
  onSelect: (index: number) => void;
}

/** Отображение вопроса и вариантов ответа */
export function QuestionView({ question, selectedIndex, onSelect }: QuestionViewProps) {
  return (
    <div>
      <h2>{question.text}</h2>
      <ul className="options-list">
        {question.options.map((opt, idx) => (
          <li key={idx}>
            <button
              type="button"
              className={`option-btn ${selectedIndex === idx ? 'selected' : ''}`}
              onClick={() => onSelect(idx)}
            >
              {opt}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
