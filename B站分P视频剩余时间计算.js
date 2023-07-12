let $videoSelectionBox = document.querySelector('#multi_page>.cur-list>.list-box');
let $videoSelectionList = [...$videoSelectionBox.querySelectorAll('li')];
let $videoSelectionNow = $videoSelectionBox.querySelector('li.on');

class Time {
    static timeToNum(time) {
        time = String(time);
        let timeParts = time.split(':');
        let seconds = 0;
        for (let index in timeParts) {
            seconds += parseInt(timeParts[index]) * Math.pow(60, timeParts.length - index - 1);
        }
        return seconds;
    }
    static numToTime(num) {
        num = parseInt(num);
        let timeParts = [];
        for (let i = num; i > 0; i = Math.floor(i / 60)) {
            let part = i % 60;
            timeParts.unshift(part > 9 ? part : '0' + part);
        }
        return timeParts.join(':');
    }
}

function getVideoSections() {
    let videoSelectionNowIndex = $videoSelectionList.indexOf($videoSelectionNow);
    let videoSections = [];

    for (let $section of $videoSelectionList) {
        let $sectionNum = $section.querySelector('.page-num');
        let $sectionName = $section.querySelector('.part');
        let $sectionTime = $section.querySelector('.duration');

        let section = {
            num: $sectionNum ? $sectionNum.innerText : null,
            name: $sectionName ? $sectionName.innerText : null,
            time: $sectionTime ? Time.timeToNum($sectionTime.innerText) : null
        };

        videoSections.push(section);
        videoSections.now = videoSelectionNowIndex;
    }

    return videoSections;
}

function timeLeft(sections) {
    let seconds = 0;
    let leftSections = sections.slice(sections.now + 1);
    for (let section of leftSections) {
        seconds += section.time;
    }
    return Time.numToTime(seconds);
}

function fullTime(sections) {
    let seconds = 0;
    for (let section of sections) {
        seconds += section.time;
    }
    return Time.numToTime(seconds);
}

let sections = getVideoSections();
let fullTime = Time.numToTime(sections.map(i => i.time).reduce((a, b) => a + b));
console.log(fullTime);
console.log(timeLeft(sections));
