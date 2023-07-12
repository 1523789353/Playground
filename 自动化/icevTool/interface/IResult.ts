export interface IAnswer {
    id: string;
    elem: HTMLElement;
    rightAnswer: {
        optionId: string;
        optionText: string;
    };
}

export interface IResult {
    id: string;
    elem: HTMLElement;
    answers: Array<IAnswer>;
}
