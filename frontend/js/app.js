if('serviceWorker' in navigator) {
    navigator.serviceWorker.register("./sw.js");
}

let url = localStorage.getItem('url');
let data = {};
let schedule = {};
let current_day = 0;
let week_type = "even";
let currentPreparePage = 0;
const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

if(localStorage.getItem('url') === null) {
    url = prompt("Wpisz adres URL planu zajęć");
    localStorage.setItem('url', url);
}

let links = document.querySelectorAll('.navigation li');

for(let link of links) {
    link.addEventListener('click', () => {
        document.querySelector('.navigation .active').removeAttribute('class');
        link.setAttribute('class', 'active');
        current_day = parseInt(link.getAttribute('data-day'));
        displaySchedule(current_day);
    })
}

if(localStorage.getItem("data") !== null) {
    data = JSON.parse(localStorage.getItem("data"));
}

if(localStorage.getItem("schedule") !== null) {
    schedule = JSON.parse(localStorage.getItem("schedule"));
    displaySchedule(0);
}

fetch(`https://api.jaroslawlesniak.pl/schedule/parser.php?url=${url}`)
.then(e => e.json())
.then(e => {
    if(JSON.stringify(e) !== localStorage.getItem("data")) {
        localStorage.setItem("data", JSON.stringify(e));
        schedule = {};
    }
});

function prepareSchedule() {
    let container = document.querySelector(".container");
    container.innerHTML += `
    <div class='header'>
        Konfiguracja <span class='day'></span>
        <p>Zaznacz swoje zajęcia</p>
    </div>
    <div class='activities_list'></div>
    <button onclick="displayNextPreparePage()">Następna strona</button>`;
    prepareDay(0);
}

function prepareDay(d) {
    if(d >= 1 && d <= 5) {
        let checkboxex = document.querySelectorAll('input:checked');
        let day = days[d - 1];

        schedule[day] = {};

        for(let chbox of checkboxex) {
            
            let hour = chbox.getAttribute('data-hour');
            if(schedule[day][hour]) {
                schedule[day][hour].push({
                    "activity": chbox.getAttribute('data-name'),
                    "classroom": chbox.getAttribute('data-classroom'),
                    "even_week": chbox.getAttribute('data-even_week'),
                    "odd_week": chbox.getAttribute('data-odd_week')
                });
            } else {
                schedule[day][hour] = [];
                schedule[day][hour].push({
                    "activity": chbox.getAttribute('data-name'),
                    "classroom": chbox.getAttribute('data-classroom'),
                    "even_week": chbox.getAttribute('data-even_week'),
                    "odd_week": chbox.getAttribute('data-odd_week')
                });
            }
        }

        if(d === 5) {
            localStorage.setItem("schedule", JSON.stringify(schedule));
            displaySchedule(0);
        }
    }

    if(d < 5) {
        let container = document.querySelector(".activities_list");
        let hourIndex = 0;
        let day = days[d];

        container.innerHTML = "";
        
        for(let hour in data[day]) {
            container.innerHTML += `
                <span>${hour}</span>
                <div id='h${hourIndex}'></div>
            `;
            
            for(let index in data[day][hour]) {
                let activity = data[day][hour][index];
                
                document.querySelector("#h" + hourIndex).innerHTML += `
                    <div class="option">
                        <label><input type="checkbox" data-hour='${hour}' data-name='${activity.activity}' data-classroom='${activity.classroom}' data-even_week='${activity.even_week}' data-odd_week='${activity.odd_week}'/>${activity.activity_name}</label>
                    </div>
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
    document.querySelector("header").style.display = "block";
    let container = document.querySelector(".container");
    let day = days[d];

    container.innerHTML = "";

    let hourIndex = 0;

    for(let hour in schedule[day]) {
         
        container.innerHTML += `
            <div id='header-${hourIndex}' class="option">
                <span><i class='icon-clock'></i>${hour}</span>
                <div id='h${hourIndex}'></div>
            </div>
        `;

        for(let activity of schedule[day][hour]) {
            if((activity.even_week === "true" && week_type === 'even') || (activity.odd_week === "true" && week_type === 'odd')) {            
                document.querySelector("#h" + hourIndex).innerHTML += `
                        <span class="activity">${activity.activity}</span>
                        <span class="info">${activity.classroom}</span>
                `;
            }
        }

        if(document.querySelector("#h" + hourIndex).innerHTML === "") {
            document.querySelector("#header-" + hourIndex).outerHTML = "";
        }

        hourIndex++;
    }
}

function changeWeek(e) {
    if(week_type === "even") {
        week_type = "odd";
        e.innerHTML = "Nieparzysty";
    } else {
        week_type = "even";
        e.innerHTML = "Parzysty";
    }
    displaySchedule(current_day);
}

if(Object.keys(schedule).length === 0 && schedule.constructor === Object) {
    prepareSchedule();
}