"use strict";
exports.__esModule = true;
// import Timer from './Timer'
// let t = new Timer({
//     runningMode: 'frequency',
//     clockMode: 'freqSync'
// });
// t.start();
var TypeChecker_1 = require("./Utils/TypeChecker");
var result = TypeChecker_1["default"].checkType([1, Number], [true, Boolean], ["", String]);
console.log(result);
TypeChecker_1["default"].matchAny(111);
TypeChecker_1["default"].matchAny(undefined);
