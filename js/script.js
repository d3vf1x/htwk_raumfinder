const segmentsPerHour = 4;
const dataUrl = "data.json";

function init() {
    let currentDate = new Date();
    const weekday = getCurrentWeekDay();
    const weeknumber = getWeekNumber(currentDate);

    document.getElementById("weekday").value = weekday;
    document.getElementById("week").value = weeknumber;


    document.getElementById("calenderTableHead").getElementsByTagName("th").item(weekday + 1).classList.add("table-active");
    document.getElementById("currentWeek").innerHTML = document.getElementById("week").value;
}


function fetchHeader(url, wch) {
    try {
        var req=new XMLHttpRequest();
        req.open("HEAD", url, false);
        req.send(null);
        if(req.status== 200){
            return req.getResponseHeader(wch);
        }
        else return false;
    } catch(er) {
        return er.message;
    }
}

function getDataLastModified(){
    const date = new Date(fetchHeader(dataUrl,'Last-Modified')); 
    return date.toLocaleString('de-DE');
}

function checkInput() {
    const room = document.getElementById("roomName");
    const weekday = document.getElementById("weekday").value;

    room.value = room.value.trim();
    document.getElementById("calenderTable").hidden = true;
    document.getElementById("resultTable").hidden = true;

    if (room.value === "") {
        messageFail("Bitte Raum angeben!");
        return false;
    }
    if (weekday < 0 || weekday > 5) {
        messageFail("Es sind nur Tage zwischen Montag und Samstag möglich!");
        return false;
    }
    return true;
}


function loadDay() {
    if (!checkInput())
        return;

    fetch(dataUrl, { method: 'GET' })
        .then(response => {
            return response.json();
        })
        .then(jsondata => processDay(jsondata));
}

function loadWeek() {
    if (!checkInput())
        return;

    fetch(dataUrl, { method: 'GET' })
        .then(response => {
            return response.json();
        })
        .then(jsondata => processWeek(jsondata));
}

function processDay(jsondata) {
    const room = document.getElementById("roomName").value;
    const week = document.getElementById("week").value;
    const weekday = document.getElementById("weekday").value;
    let roomData = searchRoom(jsondata, room);

    if (roomData == null)
        return;

    let occupancies = getOccupancy(roomData, week, weekday, null);
    if (occupancies == null || occupancies.length === 0) {
        messageSuccess("Der Raum '" + room + "' ist für den geprüften Zeitraum nicht beleg! " + " (Stand: " + getDataLastModified() + ")");
    } else {
        messagewarning("Der Raum '" + room + "' ist für den geprüften Zeitraum belegt. Für Belegungsdetails siehe Tabelle unten." + "(Stand: " + getDataLastModified() + ")");
        fillTable(occupancies);
        //console.log(occupancies);
    }
}

function processWeek(jsondata) {
    //console.log(jsondata);
    const room = document.getElementById("roomName").value;
    const week = document.getElementById("week").value;

    var roomData = searchRoom(jsondata, room)
    if (roomData == null) {
        return null;
    }

    let occupancies = getWeekOccupancy(roomData, week);
    let isEmpty = true;
    occupancies.forEach(element => {
        if (isEmpty && occupancies != null && occupancies.length > 0)
            isEmpty = false;
    });

    if (isEmpty) {
        messageSuccess("Der Raum '" + room + "' ist für den geprüften Zeitraum nicht beleg!" + " (Stand: " + getDataLastModified() + ")");
    } else {
        fillCalender(occupancies);
        messagewarning("Die Belegung für den Raum '" + room + "' ist in den Kalender geladen wurden." + " (Stand: " + getDataLastModified() + ")");
    } 
}

function getWeekOccupancy(roomData, week) {
    if (roomData == null) {
        console.error("roomData is null!");
    }
    array = [[], [], [], [], [], []];

    for (d = 0; d < roomData.length; d++) {
        for (i = 0; i < roomData[d].length; i++) {
            if (roomData[d][i].week_numbers.includes(week))
                array[d].push(roomData[d][i]);
        }
    }
    return array;
}

function getOccupancy(roomData, week, weekday, time) {
    if (roomData[weekday].length == null)
        return null;

    let array = [];
    for (let attr in roomData[weekday]) {
        if (roomData[weekday][attr].week_numbers.includes(week)) {
            var start = roomData[weekday][attr].start_time;
            var end = roomData[weekday][attr].end_time;
            array.push(roomData[weekday][attr])
            //console.log(roomData[weekday][attr])
            //return roomData[weekday][attr];
        }
    }
    return array;
}



function fillTable(array) {
    const resultTableWeekNumber = document.getElementById("resultTableWeekNumber");
    resultTableWeekNumber.innerHTML = document.getElementById("week").value;

    const resultTable = document.getElementById("resultTable");
    const table = document.getElementById("resultTableBody");
    removeChilds(table);

    array.forEach(element => {
        const row = document.createElement("tr");

        let col = document.createElement("td");
        let colText = document.createTextNode(element.start_time);
        col.appendChild(colText);
        row.appendChild(col);

        col = document.createElement("td");
        colText = document.createTextNode(element.end_time);
        col.appendChild(colText);
        row.appendChild(col);

        col = document.createElement("td");
        colText = document.createTextNode(element.course_name);
        col.appendChild(colText);
        row.appendChild(col);

        table.appendChild(row);
    });

    //make it visible
    resultTable.hidden = false;
}


function searchRoom(jsondata, room) {
    for (let attr in jsondata) {
        if (attr.toLocaleLowerCase().includes(room.toLocaleLowerCase())) {
            return jsondata[attr];
        }
    }
    console.error("Could not find a room with this name: '" + room + "'");
    messageFail("Der Raum '" + room + "' konnte nicht gefunden werden!");
    return null;
}

function removeChilds(parent) {
    while (parent.lastChild) {
        parent.removeChild(parent.lastChild);
    }
};

function filterItems(arr, room, weekday, weeknumber) {
    return arr.filter((el) => el.room.toLowerCase().includes(room.toLowerCase()))
        .filter(element => element.weekday === weekday)
        .filter((el) => el.week_numbers.toLowerCase().includes(weeknumber.toLowerCase()));
}

function getDuration(start, end) {
    return Math.round(((end - start) / (1000 * 60)) / (60 / segmentsPerHour)); // in segmentsPerHour
}


/**
 * Function takes an array of 6 array (monday to saturday) and generates a calender view for this given week.
 * 
 * @param {array} occupanciesPerWeekDay [mon,tues,wednesday...]
 */
function fillCalender(occupanciesPerWeekDay) {
    const startHour = 7;
    const endHour = 20;
    const calenderNode = document.getElementById("calenderTableBody");
    const calenderTable = document.getElementById("calenderTable");
    removeChilds(calenderNode);
    let hour = startHour;
    calenderTable.hidden = false;

    const calenderWeekNumber = document.getElementById("calenderWeekNumber");
    calenderWeekNumber.innerHTML = document.getElementById("week").value;

    rowspanActive = [0, 0, 0, 0, 0, 0, 0];
    for (r = 0; r < ((endHour - startHour) * segmentsPerHour + segmentsPerHour); r++) {
        const row = document.createElement("tr");

        for (c = 0; c < rowspanActive.length; c++) {
            dayOccupations = occupanciesPerWeekDay[c - 1];

            //skip columns where rowspan is still active
            if (rowspanActive[c] == 0) {
                const cell = document.createElement("td");
                if (r % segmentsPerHour == 0) {
                    cell.classList.add("cal-hour");
                    if (c == 0) {
                        cell.setAttribute("rowspan", segmentsPerHour.toString());
                        cell.innerHTML = hour2String(hour++);
                        rowspanActive[c] = segmentsPerHour;
                    }
                }

                if (c > 0 && dayOccupations != null && dayOccupations.length > 0) {
                    for (counter = 0; counter < dayOccupations.length; counter++) {
                        const occupancy = dayOccupations[counter];
                        //console.log("occupancy ");
                        //console.log(occupancy);
                        const minutes = r * (60 / segmentsPerHour) + (startHour - 1) * 60;
                        const current = new Date(minutes * 60 * 1000);
                        const start_time = new Date('0000T' + cleanUpDateString(occupancy.start_time));
                        //console.log(current + " ? " + start_time);
                        if (current.getHours() === start_time.getHours() && current.getMinutes() === start_time.getMinutes()) {
                            const end_time = new Date('0000T' + cleanUpDateString(occupancy.end_time));
                            let duration = getDuration(start_time, end_time);
                            rowspanActive[c] = duration;
                            //console.log("MATCH: (" + c + ")" + current);
                            cell.classList.add("table-primary", "occupancy");
                            cell.setAttribute("rowspan", duration.toString());
                            cell.innerHTML = getTimeString(start_time) + " - " + getTimeString(end_time);
                            break; //only first match! -> Assumption: no overlapping occupations
                        }
                    }

                }
                row.appendChild(cell);
            }

            if (rowspanActive[c] > 0)
                rowspanActive[c]--;

        }
        calenderNode.appendChild(row)

    }
}
