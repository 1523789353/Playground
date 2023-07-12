export enum QuestionType {
    Single,
    Multiple,
    Judge,
    Unknown
};

export interface IQuestionOption {
    id: string;
    elem: HTMLElement;
    control: HTMLElement;
    text: string;
    value: boolean;
}

export interface IQuestion {
    id: string;
    elem: HTMLElement;
    title: {
        elem: HTMLElement;
        text: string;
    };
    options: Array<IQuestionOption>;
    type: QuestionType;
}
