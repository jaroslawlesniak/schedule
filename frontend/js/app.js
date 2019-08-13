if('serviceWorker' in navigator) {
    navigator.serviceWorker.register("./sw.js");
}

let url = localStorage.getItem('url');
let data = JSON.parse(localStorage.getItem("schedule")) || {};
let schedule = JSON.parse(localStorage.getItem("schedule")) || {};
let grade_name = localStorage.getItem("name") || "";
let current_day = parseInt(localStorage.getItem("day")) || 0;
let week_type = localStorage.getItem("week") || "even";
let currentPreparePage = 0;
const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
let links = document.querySelectorAll('.navigation li');

function selectMenuOption(link) {
    document.querySelector(".configure").innerHTML = "";

    document.querySelector('.navigation .active').removeAttribute('class');
    links[link].setAttribute('class', 'active');
    current_day = parseInt(links[link].getAttribute('data-day'));
    displaySchedule(current_day);
}

if(week_type === "even") {
    document.querySelector("#week-btn").innerHTML = "Parzysty";
} else {
    document.querySelector("#week-btn").innerHTML = "Nieparzysty";
}

for(let i = 0; i <= links.length - 1; i++) {
    links[i].addEventListener('click', () => {
        selectMenuOption(i);
    })
}

if(applicationIsNotConfigured()) {
    configureApp();
} else {
    document.querySelector("#name").innerHTML = grade_name;
    document.querySelector("title").innerHTML = "Plan zajęć " + grade_name;
    selectMenuOption(current_day);
}

let grades = [];

function applicationIsNotConfigured() {
    return url === null || (Object.keys(schedule).length === 0 && schedule.constructor === Object)
}

function settingsPage() {
    document.querySelector("header").style.display = "none";
    document.querySelector(".container").innerHTML = "";
    let container = document.querySelector(".configure");
    document.querySelector("meta[name=theme-color").setAttribute("content", "#ffffff");

    container.style.display = "block";
    currentPreparePage = 0;

    container.innerHTML = `
         <div class="header">
            <h1><i class="icon-left-open" onClick="selectMenuOption(${current_day})"></i>Ustawienia</h1>
        </div>
        <div class="settings">
            <button id="update-btn" onClick="ckeckUpdates()">Sprawdź aktualizację planu</button>
            <button onClick="reconfigureApp()">Konfiguruj zajęcia</button>
            <button onClick="configureApp(true)">Zmień grupę</button>
        </div>
    `;
}

function ckeckUpdates() {
    document.querySelector("#update-btn").innerHTML = "<div class='loader small-inline'></div>Sprawdzanie ...";

    fetch("https://api.jaroslawlesniak.pl/schedule/parser.php?url=" + url)
    .then(e => e.json())
    .then(e => {
        setTimeout(() => {
            document.querySelector("#update-btn").innerHTML = "Sprawdź aktualizację planu";
            let prevData = localStorage.getItem("data");
            if(prevData !== JSON.stringify(e)) {
                if(confirm("Dostępna jest nowa wersja planu zajęć. Czy chcesz teraz ją skonfigurować?")) {
                    document.querySelector(".configure").innerHTML = "";
                    localStorage.setItem("data", JSON.stringify(e));
                    data = e;
                    prepareSchedule();
                }
            } else {
                alert("Brak dostępnych aktualizacji");
            }
        }, 300)
    });
}

function configureApp(back_btn = false) {
    document.querySelector("header").style.display = "none";
    document.querySelector(".container").innerHTML = "";
    let container = document.querySelector(".configure");
    document.querySelector("meta[name=theme-color").setAttribute("content", "#ffffff");

    container.style.display = "block";
    currentPreparePage = 0;

    let back = "";

    if(back_btn) {
        back = `<i class="icon-left-open" onClick="settingsPage()"></i>`;
    }

    container.innerHTML = `
         <div class="header">
            <h1>${back}Grupa</h1>
            <label class="search">
                <i class="icon-search"></i>
                <input type="text" name="url" placeholder="Wyszukaj nazwę grupy" onInput="loadGrades(this.value)" autocomplete="off"/>
            </label>
        </div>
        <div class="grades"></div>
    `;

    document.querySelector(".grades").innerHTML = "<div class='loader'></div>";
    fetch("https://api.jaroslawlesniak.pl/schedule/grades.php")
    .then(e => e.json())
    .then(data => {
        grades = data;
        loadGrades();
    })
    .catch(e => {
        document.querySelector(".grades").innerHTML = "<span class='alert'>Brak połączenia z internetem</span>";
    })
}

function reconfigureApp() {
    document.querySelector(".configure").innerHTML = "<div class='loader'></div>";
    fetch("https://api.jaroslawlesniak.pl/schedule/parser.php?url=" + url)
    .then(e => e.json())
    .then(e => {
        data = e;
        prepareSchedule();
    })
    .catch(e => {
        document.querySelector(".configure").innerHTML = "<span class='alert'>Brak połączenia z internetem</span>";
    });
}

function loadGrades(pattern = "") {
    document.querySelector(".grades").innerHTML = "";

    for(let grade of grades) {
        if(grade.name.toLowerCase().indexOf(pattern.toLowerCase()) !== -1) {
            document.querySelector(".grades").innerHTML += `
                <div class="grade" onClick="getActivitiesFromApi('${grade.name}', '${grade.href}')">${grade.name}</div>`;
        }
    }
}

function getActivitiesFromApi(_name, _url) {
    document.querySelector(".configure").innerHTML = "<div class='loader'></div>";
    fetch("https://api.jaroslawlesniak.pl/schedule/parser.php?url=" + _url)
    .then(e => e.json())
    .then(e => {
        setTimeout(() => {
            document.querySelector(".configure").innerHTML = "";
            data = e;
            url = _url;
            grade_name = _name;
            prepareSchedule();
        }, 300);
    });
}

function prepareSchedule() {
    let container = document.querySelector(".configure");
    container.innerHTML = "";

    container.innerHTML += `
    <div class='header'>
        <h1><i class="icon-left-open" onClick="preparePrevDay()"></i><span id="currentDay">Zajęcia</span></h1>
    </div>
    <div class='activities_list'></div>
    <button class="nextPage" onclick="displayNextPreparePage()">Następny dzień</button>`;
    prepareDay(0);
}

function preparePrevDay() {
    prepareDay(--currentPreparePage, false);
}

function prepareDay(d, update = true) {
    if(d < 0) {
        configureApp(!applicationIsNotConfigured());
        return;
    }
    document.documentElement.scrollTop = 0;
    document.querySelector(".nextPage").innerHTML = "Następny dzień";

    if(d >= 1 && d <= 5 && update) {
        let checkboxex = document.querySelectorAll('input:checked');
        let day = days[d - 1];

        schedule[day] = {};

        for(let chbox of checkboxex) {
            let activity = chbox.getAttribute('data-name');
            let activity_name = chbox.getAttribute('data-activity');
            let classroom = chbox.getAttribute('data-classroom');
            let even_week = chbox.getAttribute('data-even_week');
            let odd_week = chbox.getAttribute('data-odd_week');
            let hour = chbox.getAttribute('data-hour');

            if(schedule[day][hour]) {
                schedule[day][hour].push({
                    "activity": activity,
                    "classroom": classroom,
                    "even_week": even_week,
                    "odd_week": odd_week,
                    "activity_name": activity_name
                });
            } else {
                schedule[day][hour] = [];
                schedule[day][hour].push({
                    "activity": activity,
                    "classroom": classroom,
                    "even_week": even_week,
                    "odd_week": odd_week,
                    "activity_name": activity_name
                });
            }
        }

        if(d === 4) {
            document.querySelector(".nextPage").innerHTML = "Zakończ konfigurację";
        }
        
        if(d === 5) {
            document.querySelector("#name").innerHTML = grade_name;
            localStorage.setItem("schedule", JSON.stringify(schedule));
            document.querySelector(".configure").style.display = "none";
            document.querySelector(".configure").style.innerHTML = "";
            localStorage.setItem("url", url);
            localStorage.setItem("name", grade_name);
            localStorage.setItem("data", JSON.stringify(data));
            localStorage.setItem("schedule", JSON.stringify(schedule));
            document.querySelector("title").innerHTML = "Plan zajęć " + grade_name;
            selectMenuOption(0);
        }
    }

    if(d < 5) {
        const visible_days = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek"];

        let container = document.querySelector(".activities_list");
        document.querySelector("#currentDay").innerHTML = visible_days[d];
        let hourIndex = 0;
        let day = days[d];

        container.innerHTML = "";
        
        for(let hour in data[day]) {
            container.innerHTML += `
                <span><i class="icon-clock"></i>${hour}</span>
                <div id='h${hourIndex}'></div>
            `;
            
            for(let activity of data[day][hour]) {
                let checked = "";

                if(schedule.hasOwnProperty(day) && schedule[day].hasOwnProperty(hour)) {
                    for(let config_activity of schedule[day][hour]) {
                        if(activity.activity_name === config_activity.activity_name) {
                            checked = "checked='checked'";
                        }
                    }
                }

                document.querySelector("#h" + hourIndex).innerHTML += `
                    <label class="option">
                        <input type="checkbox" ${checked} data-hour='${hour}' data-name='${activity.activity}' data-classroom='${activity.classroom}' data-activity='${activity.activity_name}' data-even_week='${activity.even_week}' data-odd_week='${activity.odd_week}'/>${activity.activity_name}
                    </label>
                `;
            }

            hourIndex++;
        }
    }
}

function displayNextPreparePage() {
    prepareDay(++currentPreparePage);
}

function displaySchedule(d) {
    localStorage.setItem("day", d);
    document.querySelector("meta[name=theme-color").setAttribute("content", "#0c3d75");
    document.querySelector("header").style.display = "block";
    let container = document.querySelector(".container");
    let day = days[d];

    container.innerHTML = "";

    let hourIndex = 0;

    for(let hour in schedule[day]) {
        let activity_hours = hour.split("-");
        container.innerHTML += `
            <div id='header-${hourIndex}' class="option" data-start="${activity_hours[0]}" data-end="${activity_hours[1]}">
                <span><i class='icon-clock'></i></span>
                <div id='h${hourIndex}'></div>
            </div>
        `;

        for(let activity of schedule[day][hour]) {
            if((activity.even_week === "true" && week_type === 'even') || (activity.odd_week === "true" && week_type === 'odd')) {            
                document.querySelector("#h" + hourIndex).innerHTML += `
                        <span class="activity">${activity.activity}</span>
                        <span class="info">Sala: ${activity.classroom}<p class="time"></p></span>
                `;
            }
        }

        if(document.querySelector("#h" + hourIndex).innerHTML === "") {
            document.querySelector("#header-" + hourIndex).outerHTML = "";
        }

        hourIndex++;
    }

    let activities = document.querySelectorAll("div.option");

    let prevActivity = activities[0] || null;

    for(let currentActivity of activities) {
        if(prevActivity !== null && prevActivity !== currentActivity) {
            if(prevActivity.querySelector("div").innerHTML === currentActivity.querySelector("div").innerHTML) {
                prevActivity.setAttribute("data-end", currentActivity.getAttribute("data-end"));
                currentActivity.outerHTML = "";
                continue;
            }
        }
        prevActivity = currentActivity;
    }

    activities = document.querySelectorAll("div.option");
    
    let date = new Date();
    let date_timestamp = date.getHours()*60 + date.getMinutes();
    let day_of_week = date.getDay() - 1;
    let is_next_lesson = false;

    for(let activity of activities) {
        let startHour = activity.getAttribute("data-start").split(":");
        let endHour = activity.getAttribute("data-end").split(":");

        activity.querySelector("span").innerHTML += startHour[0] + ":" + startHour[1] + "-" + endHour[0] + ":" + endHour[1];

        let start_timestamp = parseInt(startHour[0])*60 + parseInt(startHour[1]);
        let end_timestamp = parseInt(endHour[0])*60 + parseInt(endHour[1]);

        if(date_timestamp >= start_timestamp && date_timestamp < end_timestamp && current_day === day_of_week) {
            let difference = (end_timestamp - date_timestamp);

            let hours = Math.floor(difference/60);
            let hours_info = hours + " godz. ";
            let minutes_info = difference%60 + " min";

            if(hours === 0) {
                hours_info = "";
            }

            if(difference%60 === 0) {
                minutes_info = "";
            }

            activity.querySelector(".time").innerHTML = "Kończy się za " + hours_info + minutes_info;
            activity.classList.add("active");
            is_next_lesson = true;
        }
        if(date_timestamp < start_timestamp && is_next_lesson === false && current_day === day_of_week) {
            let difference = start_timestamp - date_timestamp;

            let hours = Math.floor(difference/60);
            let hours_info = hours + " godz. ";
            let minutes_info = difference%60 + " min";

            if(hours === 0) {
                hours_info = "";
            }

            if(difference%60 === 0) {
                minutes_info = "";
            }

            activity.querySelector(".time").innerHTML = "Zaczyna się za " + hours_info + minutes_info;
            is_next_lesson = true;
        }
    }
}

function changeWeek(e) {
    if(week_type === "even") {
        week_type = "odd";
        e.innerHTML = "Nieparzysty";
        localStorage.setItem("week", "odd");
    } else {
        week_type = "even";
        e.innerHTML = "Parzysty";
        localStorage.setItem("week", "even");
    }
    displaySchedule(current_day);
}