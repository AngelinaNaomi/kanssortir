window.addEventListener("load", function () {
  "use strict";

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
  }

  // Premièrement, vérifions que nous avons la permission de publier des notifications. Si ce n'est pas le cas, demandons la
  if (window.Notification && Notification.permission !== "granted") {
    Notification.requestPermission(function (status) {
      if (Notification.permission !== status) {
        Notification.permission = status;
      }
    });
  }
  init();
});

function enableButton() {
  const regex = /^[0-9]+:[0-9]{2}$/;
  document.getElementById("paraForm").classList.add('was-validated');
  const workingDuration = getWorkingDuration();
  const breakDuration = getBreakDuration();
  document.getElementById('bSaveAndApply').disabled = !(regex.test(workingDuration) && regex.test(breakDuration));
}


function init() {
  const now = new Date() 

  const cookieTime = getCookie('time');
  const time = (cookieTime) ? cookieTime : "07:00";
  const cookiewd = getCookie('workingDuration');
  const cookiebd = getCookie('breakDuration');
  
  const workingDuration = splitTime((cookiewd) ? cookiewd : "08:00");  
  const breakDuration = splitTime((cookiebd) ? cookiebd : "00:45"); 
  
  const hoursToAdd = workingDuration.hours + breakDuration.hours;
  const minutesToAdd = workingDuration.minutes + breakDuration.minutes;

  if (time) {
    const timeParsed = parseTimeStringToDate(time);
    if(time > now){
      timeParsed.setDate(timeParsed.getDate() - 1);
    }
    const outputDate = addTimeTo(timeParsed, hoursToAdd, minutesToAdd);

    setInputTime(time);
    setBreakDuration((cookiebd) ? cookiebd : "00:45");
    setWorkingDuration((cookiewd) ? cookiewd : "08:00");
    setOutputTime(outputDate);
    setInputDate(dateToDateString(timeParsed));
    setOutputDate(dateToDateString(outputDate));
  }
}

/**
 * Met à jour le compte à rebourd 
 * et envoie une notification
 */
function showTime() {
  const now = new Date();
  const inputTime = parseDateTimeStringToDate(getInputDate(), getInputTime());
  const outputTime = parseDateTimeStringToDate(getOutputDate(), getOutputTime());
  const countdown = addTimeTo(outputTime, - now.getHours(), -now.getMinutes(), -(now.getSeconds() + 1));

  const h = numberToStringFormatted(countdown.getHours());
  const m = numberToStringFormatted(countdown.getMinutes());
  const s = numberToStringFormatted(countdown.getSeconds());

  const countdownIsOver = now > outputTime;
  const numberDaysBeatween = daysBetween(now, outputTime);
  const daysBetweenString = (numberDaysBeatween !== 0) ? (numberToStringFormatted(numberDaysBeatween) + ":") : "";

  const clock = daysBetweenString + ((countdownIsOver) ? "00:00:00" : h + ":" + m + ":" + s + " ");
  document.getElementById("MyClockDisplay").innerText = clock;
  document.getElementById("MyClockDisplay").textContent = clock;

  if (!countdownIsOver) {
    const timeoutId = getTimeoutId();
    if(timeoutId) clearTimeout(getTimeoutId());
    setTimeoutId(setTimeout(showTime, 1000));
  }
  else spawnNotification();
}

/**
 * Calcule le nombre de jour entre date1 et date2
 * @param {Date} date1 
 * @param {Date} date2 
 * @returns {number} Nombre de jour entre date1 et date2
 */
function daysBetween(date1, date2) {
  const delta = Math.abs(date1.getTime() - date2.getTime());
  const coef = (1000 * 60 * 60 * 24);
  return Math.floor(delta / coef);
}

/**
 * Affiche une Notification
 */
function spawnNotification() {
  const opt = {
    body: 'Il est l\'heure d\'arrêter de travailler ! uwu',
    requireInteraction: true
  };
  const notif = new Notification("Kanssortir : Ta journée est finie !", opt);
  notif.onclick = function (event) {
    event.target.close();
  }
}

/**
 * Fonction exécuté à l'appuie du bouton
 * Met à jour le cookie et démarre le chrono
 */
function change() {
  const timeFromInput = getInputTime();
  const dateFromInput = getInputDate();
  setCookie('time', timeFromInput);
  
  const workingDuration = splitTime(getWorkingDuration());  
  const breakDuration = splitTime(getBreakDuration()); 
  
  const hoursToAdd = workingDuration.hours + breakDuration.hours;
  const minutesToAdd = workingDuration.minutes + breakDuration.minutes;

  const dateOut = addTimeTo(parseDateTimeStringToDate(dateFromInput, timeFromInput), hoursToAdd, minutesToAdd);
  setOutputTime(dateOut);
  setOutputDate(dateToDateString(dateOut));

  showTime();
  document.getElementById("countdown").hidden = false;
}

/**
 * Met à jour le temps de travail
 */
function changeWorkingDuration() {
  const duration = getWorkingDuration();
  setCookie('workingDuration', duration);
}

/**
 * Met à jour le temps de pause
 */
function changeBreakDuration() {
  const duration = getBreakDuration();
  setCookie('breakDuration', duration);
}

function saveSettings() {
  document.getElementById("paraForm").classList.remove('was-validated');
  console.log('Je suis un easter-egg ! Teehee ~ uwu')
  changeBreakDuration();
  changeWorkingDuration();
  change();
}

function cancelSettings() {
  document.getElementById("paraForm").classList.remove('was-validated');
  const cookiewd = getCookie('workingDuration');
  const cookiebd = getCookie('breakDuration');
  setBreakDuration((cookiebd) ? cookiebd : "00:45");
  setWorkingDuration((cookiewd) ? cookiewd : "08:00");
}

/**
 * 
 * @param {String} time Heure au format "HH:MM" 
 * @returns Date à la date du jour avec l'heure à time
 */
 function parseTimeStringToDate(time) {
  const timeSplitted = splitTime(time);
  const date = new Date();
  date.setHours(timeSplitted.hours, timeSplitted.minutes, 0);
  return date;
}

/**
 * 
 * @param {String} date Heure au format "yyyy-mm-dd" 
 * @param {String} time Heure au format "HH:MM" 
 * @returns Date à la date du jour avec l'heure à time
 */
function parseDateTimeStringToDate(date, time) {
  return new Date(date+"T"+time);
}

/**
 * Crée un objet {hours: number, minutes: number}
 * @param {String} time Heure au format "hh:mm" 
 * @returns l'heure dans un objet
 */
 function splitTime(time) {
  const timeSplitted = time.split(":");
  return {
    hours: parseInt(timeSplitted[0]),
    minutes: parseInt(timeSplitted[1])
  };
}

/**
 * Crée un objet {day: number, month: number, year: number}
 * @param {String} date Date au format "yyyy-mm-dd" 
 * @returns la date dans un objet
 */
function splitDate(date) {
  const timeSplitted = date.split("-");
  return {
    year: parseInt(timeSplitted[0]),
    month: parseInt(timeSplitted[1]),
    day: parseInt(timeSplitted[2])
  };
}

/**
 * Formate un nombre pou avoir toujours le chiffre des dizaines.
 * @param {number} number Nombre à formatter
 * @returns Le nombre formatté
 */
 function numberToStringFormatted(number) {
  return ((number < 10) ? "0" : "") + number;
}

/**
 * 
 * @param {Date} date Date à laquelle ajouter une heure
 * @param {number} hours heures à ajouter
 * @param {number} minutes minutes à ajouter
 * @param {number} second secondes à ajouter, par defaut 0
 */
function addTimeTo(date, hours, minutes, second = 0) {
  const res = new Date(date);
  res.setHours(date.getHours() + hours, date.getMinutes() + minutes, date.getSeconds() + second);
  return res;
}

/**
 * @param {Date} date Date à parser
 * @returns La Date au format "hh:mm"
 */
 function dateToTimeString(date) {
  return numberToStringFormatted(date.getHours()) + ":" + numberToStringFormatted(date.getMinutes());
}

/**
 * @param {Date} date Date à parser
 * @returns La Date au format "yyyy-mm-dd"
 */
 function dateToDateString(date) {
  return numberToStringFormatted(numberToStringFormatted(date.getFullYear()) + "-" + numberToStringFormatted(date.getMonth() + 1) + "-" +  numberToStringFormatted(date.getDate()));
}


//////////////////////////////////
//                              //
//           GET/SET            //
//                              //
//////////////////////////////////


/**
 * @returns {String} workingDuration au format "hh:mm"
 */
 function getWorkingDuration() {
  return document.getElementById("workingDuration").value;
}

/**
 * @param {String} workingDuration Valeur à set
 */
function setWorkingDuration(workingDuration) {
  document.getElementById("workingDuration").value = workingDuration;
}


/**
 * @returns {String} breakDuration au format "hh:mm"
 */
 function getBreakDuration() {
  return document.getElementById("breakDuration").value;
}

/**
 * @param {String} breakDuration Valeur à set
 */
function setBreakDuration(breakDuration) {
  document.getElementById("breakDuration").value = breakDuration;
}

/**
 * @returns {String} Heure Output au format "hh:mm"
 */
 function getOutputTime() {
  return document.getElementById("outputTime").value;
}

/**
 * @param {Date} dateOut Valeur à set
 */
function setOutputTime(dateOut) {
  document.getElementById("outputTime").value = dateToTimeString(dateOut);
}

/**
 * @returns {String} la value contenu dans l'input sous forme "hh:mm"
 */
function getInputTime() {
  return document.getElementById("inputTime").value;
}

/**
 * Met à jour l'input
 * @param {String} value Nouvelle Value de forme "hh:mm"
 */
function setInputTime(value) {
  document.getElementById("inputTime").value = value;
}

/**
 * Set a cookie
 * repris de https://www.w3schools.com/js/js_cookies.asp
 * @param {String} cname Nom du cookie
 * @param {any} cvalue valeur à set
 * @param {number} exdays Nombre de jour d'expiration du cookie (default = 7)
 * @returns cvalue
 */
function setCookie(cname, cvalue, exdays = 7) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  const expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  return cvalue;
}

/**
 * Get a cookie
 * repris de https://www.w3schools.com/js/js_cookies.asp
 * @param {String} cname Nom du cookie
 * @returns Valeur du cookie (si cookie inexistant null)
 */
function getCookie(cname) {
  const name = cname + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return null;
}

/**
 * @returns Id du dernier setTimeout
 */
 function getTimeoutId() {
  return sessionStorage.getItem('kanssortir_timeoutId');
}

/**
 * @param {String} timeoutId Id du dernier Timeout
 * @returns timeoutId
 */
function setTimeoutId(timeoutId) {
  sessionStorage.setItem('kanssortir_timeoutId', timeoutId);
  return timeoutId;
}



/**
 * @returns {String} la value contenu dans l'input sous forme "yyyy-mm-dd"
 */
 function getInputDate() {
  return document.getElementById("inputDate").value;
}

/**
 * Met à jour l'input
 * @param {String} value Nouvelle Value de forme "yyyy-mm-dd"
 */
function setInputDate(value) {
  document.getElementById("inputDate").value = value;
}



/**
 * @returns {String} la value contenu dans l'output sous forme "yyyy-mm-dd"
 */
 function getOutputDate() {
  return document.getElementById("outputDate").value;
}

/**
 * Met à jour l'output
 * @param {String} value Nouvelle Value de forme "yyyy-mm-dd"
 */
function setOutputDate(value) {
  document.getElementById("outputDate").value = value;
}