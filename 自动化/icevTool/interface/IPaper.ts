import { QuestionType, IQuestion } from './IQuestion'

interface IPaper {
    id: string;
    elem: HTMLElement;
    paperType: QuestionType;
    questions: Array<IQuestion>;
    timeleft: number;
    autofill(): void;
    antiDetect(): void;
}
