let pokeID = 208;
let amountOfCards = 4;
const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
const FORM_URL = "-form"


async function init() {
    let container = document.getElementById("container")

    container.innerHTML = "";

    for (let id = pokeID; id < pokeID + amountOfCards; id++) {
        let overviewData = await loadOverviewData(id);
        let types = overviewData.types.map(t => upperCaseFirstLetter(t.type.name));
        container.innerHTML += await overviewCardHTML(overviewData, id);
        addTypesHTML(types, `typesOf${id}`);
        addBackgroundColour(overviewData, `pokeCardNo${id}`);
    }

    showModal(pokeID);

}


async function loadOverviewData(id) {
    let response = await fetch(BASE_URL + FORM_URL + "/" + id)
    let responseAsJSON = await response.json();
    return responseAsJSON;
}


async function loadSpecificData(id) {
    let response = await fetch(BASE_URL + "/" + id)
    let responseAsJSON = await response.json();
    return responseAsJSON;
}


function upperCaseFirstLetter(word) {
    // word = word[0].toUpperCase() + word.substring(1);
    // return word;

    return word
        .split('-')  // Teilt den String bei jedem Bindestrich in ein Array von Wörtern auf
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))  // Kapitalisiert den ersten Buchstaben jedes Wortes
        .join('-');  // Fügt die Wörter wieder mit Bindestrichen zusammen
}


async function overviewCardHTML(overviewData, id) {
    let name = upperCaseFirstLetter(overviewData.name);
    let sprite = await overviewData.sprites.front_default;

    let pokeCard = `
        <div id="pokeCardNo${id}" class="d-flex flex-column p-2 pokeCard rounded" onclick="showModal(${id})">
            <p class="align-self-end">#${id}</p>
            <h3>${name}</h3>
            <div class="d-flex justify-content-between">
                <div id=typesOf${id}></div> 
                <img src="${sprite}" alt="${name}">
            </div>
        </div>
    `

    return pokeCard;
}


function addTypesHTML(types, elementID) {
    let element = document.getElementById(elementID);
    element.innerHTML = ''

    for (let i = 0; i < types.length; i++) {
        element.innerHTML += `<div>${types[i]}</div>`
    }
}


function addBackgroundColour(overviewData, element) {
    document.getElementById(element).classList.add(`bc-${overviewData.types[0].type.name}`);
}


function removeBackgroundColour(overviewData, element) {
    document.getElementById(element).classList.remove(`bc-${overviewData.types[0].type.name}`);
}


async function showModal(id) {
    let specificData = await loadSpecificData(id);
    let types = specificData.types.map(t => upperCaseFirstLetter(t.type.name));
    let cry = await new Audio(specificData.cries.latest);

    let modalContent = modalContentHTML(specificData, id);


    document.getElementById("pokemonDetails").innerHTML = modalContent;
    document.getElementById("pokemonModal").style.display = "block";
    document.body.style.overflow = "hidden";

    addBackgroundColour(specificData, "modal-container");
    addTypesHTML(types, `typesOfSpecific`)
    addStats(specificData);

    document.getElementById("closeModal").onclick = () => {
        closeModal(specificData);
    };

    cry.play();
}


function modalContentHTML(specificData, id) {
    let name = upperCaseFirstLetter(specificData.name);
    let sprite = specificData.sprites.other["official-artwork"].front_default;
    let height = specificData.height / 10;  // Höhe in Metern
    let weight = specificData.weight / 10;  // Gewicht in Kilogramm
    let types = specificData.types.map(t => upperCaseFirstLetter(t.type.name));


    let content = `
        <h3>${name} (#${id})</h3>
        <div class="d-flex justify-content-between w-100">
            <div id="typesOfSpecific"></div> 
            <img class="w-50" src="${sprite}" alt="${name}">
        </div>
        <div>
            <p><strong>Type(s):</strong> ${types}</p>
            <p><strong>Height:</strong> ${height} m</p>
            <p><strong>Weight:</strong> ${weight} kg</p>
        </div>
        <div id="baseStats"></div>
    `;


    return content;
}


function addStats(specificData){
    statsContainer = document.getElementById("baseStats");
    stats = specificData.stats;
    let statValueSum = 0;

    statsContainer.innerHTML = '';

    for (let i = 0; i < stats.length; i++) {
        const singleStat = stats[i];
        let name = singleStat.stat.name;
        let statValue = singleStat["base_stat"];
        let sValueInPercent = calculatePercent(statValue, 255);

        statValueSum += statValue

        statsContainer.innerHTML += `
        <div>
            <p>${upperCaseFirstLetter(name)}</p>
            <div class="progress">
                <div class="progress-bar" role="progressbar" style="width: ${sValueInPercent}" aria-valuenow="${statValue}" aria-valuemin="0" aria-valuemax="255"></div>
            </div>
        </div>
        `
    }


    let sValueInPercent = calculatePercent(statValueSum, 720);
    statsContainer.innerHTML += `
        <div>
            <p>Summary</p>
            <div class="progress">
                <div class="progress-bar" role="progressbar" style="width: ${sValueInPercent}" aria-valuenow="${statValueSum}" aria-valuemin="0" aria-valuemax="255"></div>
            </div>
        </div>
        `
}


function calculatePercent(x, y) {
    percent = ((x / y)*100) + '%';
    return percent;
}


function closeModal(specificData) {
    document.getElementById("pokemonModal").style.display = "none";
    removeBackgroundColour(specificData, "modal-container");
    document.body.style.overflow = "scroll";
}