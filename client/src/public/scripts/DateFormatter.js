function formatDate(timestamp) {
    const date = new Date(timestamp)
    const curr = new Date()

    var i = date.getDay() === curr.getDay() ? 1 : (date.getDay() === curr.getDay() - 1 ? 2 : 3)
    var i2 = i === 1 ? "Today" : "Yesterday"
    switch(i) {
        case 1:
        case 2:
            return i2 + " at " +
            (date.getHours() < 10 ? "0" + date.getHours() : date.getHours())
            + ":" +
            (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes())

        case 3:
            return date.toUTCString()

        default:
            return timestamp
    }
}

function formatDuration(timestamp, timestamp2) {
    var time = timestamp2 - timestamp;
    var timeString = "";
    var timeLeft = time;

    var ms = timeLeft % 1000;
    timeLeft = (timeLeft - ms) / 1000;
    var secs = timeLeft % 60;
    timeLeft = (timeLeft - secs) / 60;
    var mins = timeLeft % 60;
    timeLeft = (timeLeft - mins) / 60;
    var hrs = timeLeft % 24;
    timeLeft = (timeLeft - hrs) / 24;
    var days = timeLeft % 30;
    timeLeft = (timeLeft - days) / 30;
    var months = timeLeft % 12;
    timeLeft = (timeLeft - months) / 12;
    var years = timeLeft;

    if(years > 0) { timeString += years + "y "; }
    if(months > 0) { timeString += months + "mon "; }
    if(days > 0) { timeString += days + "d "; }
    if(hrs > 0) { timeString += hrs + "h "; }
    if(mins > 0) { timeString += mins + "m "; }
    if(secs > 0) { timeString += secs + "s "; }

    timeString = timeString.substring(0, timeString.length - 1);
    return timeString;
}

function formatDuration2(time) {
    var timeString = "";
    var timeLeft = time;

    var ms = timeLeft % 1000;
    timeLeft = (timeLeft - ms) / 1000;
    var secs = timeLeft % 60;
    timeLeft = (timeLeft - secs) / 60;
    var mins = timeLeft % 60;
    timeLeft = (timeLeft - mins) / 60;
    var hrs = timeLeft % 24;
    timeLeft = (timeLeft - hrs) / 24;
    var days = timeLeft;

    timeString = (secs < 10 ? "0" + secs : secs) + ":" + timeString;
    if(mins > 0) { timeString = (mins < 10 ? "0" + mins : mins) + ":" + timeString; } else { timeString = "0:" + timeString }
    if(hrs > 0) { timeString = (hrs < 10 ? "0" + hrs : hrs) + ":" + timeString; }
    if(days > 0) { timeString = (days < 10 ? "0" + days : days) + ":" + timeString; }

    timeString = timeString.substring(0, timeString.length - 1);
    return timeString;
}

export { formatDate, formatDuration, formatDuration2 }