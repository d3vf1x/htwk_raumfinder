function getTime() {
    let currentDate = new Date();
    return currentDate.getHours() + ":" + currentDate.getMinutes()
}

function getKW(date) {
    var tdt = new Date(date.valueOf());
    var dayn = (date.getDay() + 6) % 7;
    tdt.setDate(tdt.getDate() - dayn + 3);
    var firstThursday = tdt.valueOf();
    tdt.setMonth(0, 1);
    if (tdt.getDay() !== 4) {
        tdt.setMonth(0, 1 + ((4 - tdt.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - tdt) / 604800000);
}

function getWeekNumber(date) {
    var kw = getKW(date);
    if (kw >= 13) {
        return kw;
    } else {
        var maxWeek = getKW(new Date(date.getFullYear() + "-12-31"));
        return maxWeek + kw;
    }
}

function getCurrentWeekDay() {
    let currentDate = new Date();
    var day = currentDate.getDay();
    if (day === 0)
        day = 6;
    else
        day--;
    return day;
}

function cleanUpDateString(string) {
    if (string.length === 5) {
        return string;
    }
    const hour = Number(string.split(":")[0]);
    const min = Number(string.split(":")[1]);

    return number2String(hour) + ":" + number2String(min);
}

function number2String(n) {
    if (n >= 0 && n < 10) {
        return "0" + n;
    }
    if (n >= 10) {
        return n;
    }
}

function getTimeString(date) {
    return number2String(date.getHours()) + ":" + number2String(date.getMinutes());
}


function hour2String(h) {
    return number2String(h) + ":00";
}