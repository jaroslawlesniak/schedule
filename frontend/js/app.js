if('serviceWorker' in navigator) {
    navigator.serviceWorker.register("./sw.js");
}

let url = localStorage.getItem('url');
let data = JSON.parse(localStorage.getItem("schedule")) || {};
let schedule = JSON.parse(localStorage.getItem("schedule")) || {};
let grade_name = localStorage.getItem("name") || "";
let current_day = 0;
let week_type = "even";
let currentPreparePage = 0;
const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

let links = document.querySelectorAll('.navigation li');

for(let link of links) {
    link.addEventListener('click', () => {
        document.querySelector('.navigation .active').removeAttribute('class');
        link.setAttribute('class', 'active');
        current_day = parseInt(link.getAttribute('data-day'));
        displaySchedule(current_day);
    })
}

if(url === null || (Object.keys(schedule).length === 0 && schedule.constructor === Object)) {
    configureApp();
} else {
    document.querySelector("#name").innerHTML = grade_name;
    displaySchedule(0);
}

let grades = [];

function configureApp() {
    document.querySelector("header").style.display = "none";
    document.querySelector(".container").innerHTML = "";
    let container = document.querySelector(".configure");
    document.querySelector("meta[name=theme-color").setAttribute("content", "#ffffff");

    container.style.display = "block";
    currentPreparePage = 0;

    container.innerHTML = `
         <div class="header">
            <h1>Grupa</h1>
            <label>
                <i class="icon-search"></i>
                <input type="text" name="url" placeholder="Wyszukaj nazwę oddziału" onInput="loadGrades(this.value)" autocomplete="off"/>
            </label>
        </div>
        <div class="grades"></div>
    `;

    fetch("https://api.jaroslawlesniak.pl/schedule/grades.php")
    .then(e => e.json())
    .then(data => {
        grades = data;
        loadGrades();
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
    })
}

function prepareSchedule() {
    let container = document.querySelector(".configure");
    container.innerHTML += `
    <div class='header'>
        <h1 id="currentDay">Zajęcia</h1>
        <div class="additional_info">Zaznacz wszystkie swoje zajęcia</div>
    </div>
    <div class='activities_list'></div>
    <button class="nextPage" onclick="displayNextPreparePage()">Następny dzień</button>`;
    prepareDay(0);
}

function prepareDay(d) {
    document.documentElement.scrollTop = 0;
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
            displaySchedule(0);
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
            
            for(let index in data[day][hour]) {
                let activity = data[day][hour][index];
                
                document.querySelector("#h" + hourIndex).innerHTML += `
                    <label class="option">
                        <input type="checkbox" data-hour='${hour}' data-name='${activity.activity}' data-classroom='${activity.classroom}' data-even_week='${activity.even_week}' data-odd_week='${activity.odd_week}'/>${activity.activity_name}
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
    document.documentElement.scrollTop = 0;
    document.querySelector("meta[name=theme-color").setAttribute("content", "#0c3d75");
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