if('serviceWorker' in navigator) {
    navigator.serviceWorker.register("./sw.js");
}

if(localStorage.getItem('url') === null) {
    let url = prompt("Wpisz adres URL planu zajęć");
    localStorage.setItem('url', url);
}

let links = document.querySelectorAll('.navigation li');

for(let link of links) {
    link.addEventListener('click', () => {
        document.querySelector('.navigation .active').removeAttribute('class');
        link.setAttribute('class', 'active');
    })
}

let url = localStorage.getItem('url');
let data = {};
let schedule = {};
let current_day = "monday";
let week_type = "even";
let currentPreparePage = 0;

if(localStorage.getItem("data") !== null) {
    data = JSON.parse(localStorage.getItem("data"));
}

fetch(`https://api.jaroslawlesniak.pl/schedule/parser.php?url=${url}`)
.then(data => data.json())
.then(data => {
    if(JSON.stringify(data) !== localStorage.getItem("data")) {
        localStorage.setItem("data", JSON.stringify(data));
        prepareSchedule();
    }
})

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
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

    if(d > 0 && d <= 5) {
        let checkboxex = document.querySelectorAll('input:checked');
        let day = days[d - 1];

        schedule[day] = [];
        for(let chbox of checkboxex) {
            
            let hour = chbox.getAttribute('data-hour');
            if(schedule[day][hour]) {
                schedule[day][hour].push({
                    "acvtivity": chbox.getAttribute('data-name'),
                    "classroom": chbox.getAttribute('data-classroom'),
                    "even_week": chbox.getAttribute('data-even_week'),
                    "odd_week": chbox.getAttribute('data-odd_week')
                });
            } else {
                schedule[day][hour] = [];
                schedule[day][hour].push({
                    "acvtivity": chbox.getAttribute('data-name'),
                    "classroom": chbox.getAttribute('data-classroom'),
                    "even_week": chbox.getAttribute('data-even_week'),
                    "odd_week": chbox.getAttribute('data-odd_week')
                });
            }
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
    if(d === 5) {
        console.log("Save data", schedule);
        document.querySelector('.container').style.display = "none";
    }
}

function displayNextPreparePage() {
    prepareDay(++currentPreparePage);
}

prepareSchedule();