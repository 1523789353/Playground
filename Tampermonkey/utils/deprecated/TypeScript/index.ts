// import Timer from './Timer'
// let t = new Timer({
//     runningMode: 'frequency',
//     clockMode: 'freqSync'
// });
// t.start();
import TypeChecker from "./Utils/TypeChecker";
var result = TypeChecker.checkType([1, Number], [true, Boolean], ["", String])
console.log(result)
TypeChecker.matchAny(111)
TypeChecker.matchAny(undefined)
