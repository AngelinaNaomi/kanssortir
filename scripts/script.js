var dateOut = null;

function showTime(){
    var date = new Date();
    var countdown = new Date();
    countdown.setHours(dateOut.getHours() - date.getHours(), dateOut.getMinutes() - date.getMinutes(), 60 - (date.getSeconds() + 1))
    var h = countdown.getHours(); // 0 - 23
    var m = countdown.getMinutes(); // 0 - 59
    var s = countdown.getSeconds(); // 0 - 59
    
    h = (h < 10) ? "0" + h : h;
    m = (m < 10) ? "0" + m : m;
    s = (s < 10) ? "0" + s : s;
    
    var time = h + ":" + m + ":" + s + " ";
    document.getElementById("MyClockDisplay").innerText = time;
    document.getElementById("MyClockDisplay").textContent = time;
    
    setTimeout(showTime, 1000);
    
}

function change() {
    dateOut = addTimeTo(getDateFromString(getFin()), 8, 45)
    document.getElementById("fout").value = dateToTimeString(dateOut);
    showTime();
    document.getElementById("countdown").hidden = false
}

function getFin(){
    return document.getElementById("fin").value;
}

/**
 * 
 * @param {String} time Heure au format "HH:MM" 
 * @returns Date à la date du jour avec l'heure à time
 */
function getDateFromString(time) {
    const timeSplitted = splitTime(time);
    const date = new Date();
    date.setHours(timeSplitted.hours, timeSplitted.minutes);
    return date;
}

function splitTime(time) {
    const timeSplitted = time.split(":");
    return {
        hours: parseInt(timeSplitted[0]),
        minutes: parseInt(timeSplitted[1])
    };
}

function numberToStringFormatted(number){
    if(number < 10) return "0" + number;
    else return number;
}

function addTimeTo(date, hours, minutes){
    return new Date(date.getYear(), date.getMonth(), date.getDate(), date.getHours() + hours, date.getMinutes() + minutes, 0);
}

function dateToTimeString(date){
    return numberToStringFormatted(date.getHours()) + ":" + numberToStringFormatted(date.getMinutes()) ;
}
