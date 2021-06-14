window.addEventListener('load', function () {
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



function init() {
  const cookieTime = getCookie('time');
  const time = (cookieTime) ? cookieTime : "07:00";
  const cookiewd = getCookie('workingDuration');
  const cookiebd = getCookie('breakDuration');
  
  const workingDuration = splitTime((cookiewd) ? cookiewd : "08:00");  
  const breakDuration = splitTime((cookiebd) ? cookiebd : "00:45"); 
  
  const hoursToAdd = workingDuration.hours + breakDuration.hours;
  const minutesToAdd = workingDuration.minutes + breakDuration.minutes;

  if (time) {
    setInputTime(time);
    setBreakDuration((cookiebd) ? cookiebd : "00:45");
    setWorkingDuration((cookiewd) ? cookiewd : "08:00");
    setOutputTime(addTimeTo(parseDateToString(time), hoursToAdd, minutesToAdd));
  }
}

/**
 * Met à jour le compte à rebourd 
 * et envoie une notification
 */
function showTime() {
  const date = new Date();
  const inputTime = parseDateToString(getInputTime());
  const outputTime = parseDateToString(getOutputTime());
  const countdown = addTimeTo(outputTime, (inputTime > outputTime ? 24 : 0) - date.getHours(), -date.getMinutes(), -(date.getSeconds() + 1));

  const h = numberToStringFormatted(countdown.getHours());
  const m = numberToStringFormatted(countdown.getMinutes());
  const s = numberToStringFormatted(countdown.getSeconds());

  const countdownIsOver = (date.getDate() - 1) === countdown.getDate();

  const time = (countdownIsOver) ? "00:00:00" : h + ":" + m + ":" + s + " ";
  document.getElementById("MyClockDisplay").innerText = time;
  document.getElementById("MyClockDisplay").textContent = time;

  if (!countdownIsOver) {
    const timeoutId = getTimeoutId();
    if(timeoutId) clearTimeout(getTimeoutId());
    setTimeoutId(setTimeout(showTime, 1000));
  }
  else spawnNotification();
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
  setCookie('time', timeFromInput);
  
  const workingDuration = splitTime(getWorkingDuration());  
  const breakDuration = splitTime(getBreakDuration()); 
  
  const hoursToAdd = workingDuration.hours + breakDuration.hours;
  const minutesToAdd = workingDuration.minutes + breakDuration.minutes;

  const dateOut = addTimeTo(parseDateToString(timeFromInput), hoursToAdd, minutesToAdd);
  setOutputTime(dateOut);

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
  changeBreakDuration();
  changeWorkingDuration();
  change();
}

function cancelSettings() {
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
function parseDateToString(time) {
  const timeSplitted = splitTime(time);
  const date = new Date();
  date.setHours(timeSplitted.hours, timeSplitted.minutes, 0);
  return date;
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