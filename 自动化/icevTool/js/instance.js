let personType = new Type({
    name: String,
    age: Number
})

let studentType = new Type({
    school: String,
    class: Number
}).extends(personType)

let childType = new Type({

    parent: String
}).extends(personType)

let teacherType = new Type({
    school: String,
    class: String,
    subject: String
})

let SomeOneInSchool = Type.oneOf(studentType, teacherType)

