/* ===== 在线作业 : 答题 ===== */
// https://spoc-exam.icve.com.cn/exam/examflow_index.action?batchId=402883ad8341af34018368fa1f7a0db7
/*
 *  .q_content // 题目
 *      .divQuestionTitle // 标题
 *      .questionOptions // 选项容器
 *          .q_option // 选项... 下同
 *          .q_option
 *          ...
 */


/**
 * 题目 类, 只用于解析/储存题目信息, 不用于操作题目
 */
class Question {
    static types = {
        single: '单选题',
        multiple: '多选题',
        judge: '判断题',
        unknown: '未知题型'
    }
    id = null
    elem = null
    title = null
    options = null

    // 题目类型嗅探
    get type() {
        let questionType = 'unknown'

        // 单选题
        if (this.options.length === 4 && this.options.every(option => option.elem.className.startsWith('radio'))) {
            questionType = 'single'
        }
        // 多选题
        else if (this.options.length === 4 && this.options.every(option => option.elem.className.startsWith('checkbox'))) {
            questionType = 'multiple'
        }
        // 判断题
        else if (this.options.length === 2 && this.options.every(option => option.elem.className.startsWith('radio'))) {
            questionType = 'judge'
        }

        return questionType
    }

    constructor(elem) {
        if (elem?.className !== 'q_content') {
            throw new Error('非法的题目元素')
        }

        // 试题ID
        this.id = $0.querySelector('input[name="quesId"]').id;

        // 试题元素
        this.elem = elem;

        // 试题标题元素
        let titleElem = this.elem.querySelector('.divQuestionTitle')
        // 标题前后缀文本
        let [titlePrefix, titleSuffix] = [...titleElem.querySelectorAll('span')].map(elem => elem.innerText)
        // 标题匹配表达式
        let titleReg = new RegExp(`^${titlePrefix}[．、]\n?(.*?)${titleSuffix}$`, 'g')
        // 试题标题
        this.title = {
            elem: titleElem,
            text: titleElem.innerText.replaceAll(titleReg, '$1')
        }

        // 试题选项容器元素
        let optionsContainerElem = this.elem.querySelector('.questionOptions')

        // 选项列表
        this.options = [...optionsContainerElem.querySelectorAll('.q_option')].map(e => {
            let optionIndex = e.querySelector('.option_index').innerText
            let optionReg = new RegExp(`^${optionIndex}\n?(.*?)$`, 'g')
            return {
                elem: e,
                text: e.innerText.replaceAll(optionReg, '$1'),
                control: e.querySelector('.radio_on')
            }
        })
    }
}

class Homework {
    paperElem = null;
    questionsArray = [];

    constructor() {
        this.paperElem = document.querySelector('.paper_content')
        if (this.paperElem === null) {
            throw new Error('无法找到试卷元素')
        }
        let questionElems = this.paperElem.querySelectorAll('.q_content')
        for (questionElem in questionElems) {
            this.questionsArray.push(new Question(questionElem))
        }
    }



    // 自动填充答案 (*未实现)
    autofill() {

    }
    /**
     * 测试是否为"在线作业"页面 (*未实现)
     */
    test() {
        return true;
    }
}
