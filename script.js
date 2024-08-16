let pokeID = 208;
let amountOfCards = 5;
const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
const FORM_URL = "-form"


async function init() {
    let container = document.getElementById("container")

    container.innerHTML = "";

    for (let id = pokeID; id < pokeID + amountOfCards; id++) {
        let overviewData = await loadOverviewData(id);
        container.innerHTML += await overviewCardHTML(overviewData, id);
        addTypesHTML(overviewData, id);
        addBackgroundColour(overviewData, `pokeCardNo${id}`);
    }
}


async function loadOverviewData(id) {
    let response = await fetch(BASE_URL + FORM_URL + "/" + id)
    let responseAsJSON = await response.json();
    return responseAsJSON;
}


function upperCaseFirstLetter(word) {
    word = word[0].toUpperCase() + word.substring(1);
    return word;
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


function addTypesHTML(overviewData, id) {
    let typeContainer = document.getElementById(`typesOf${id}`)
    let type0 = upperCaseFirstLetter(overviewData.types[0].type.name);

    typeContainer.innerHTML = `<div>${type0}</div>`

    if (overviewData.types.length > 1) {
        let type1 = upperCaseFirstLetter(overviewData.types[1].type.name);
        typeContainer.innerHTML += `<div>${type1}</div>`;
    }
}


function addBackgroundColour(overviewData, element) {
    document.getElementById(element).classList.add(`bc-${overviewData.types[0].type.name}`);
}


function removeBackgroundColour(overviewData, element){
    document.getElementById(element).classList.remove(`bc-${overviewData.types[0].type.name}`);
}


async function showModal(id) {
    let overviewData = await loadOverviewData(id);
    let name = upperCaseFirstLetter(overviewData.name);
    let sprite = overviewData.sprites.front_default;
    let height = overviewData.height / 10;  // Höhe in Metern
    let weight = overviewData.weight / 10;  // Gewicht in Kilogramm
    let types = overviewData.types.map(t => upperCaseFirstLetter(t.type.name)).join(", ");
    
    let modalContent = `
        <h3>${name} (#${id})</h3>
        <img src="${sprite}" alt="${name}">
        <p><strong>Type(s):</strong> ${types}</p>
        <p><strong>Height:</strong> ${height} m</p>
        <p><strong>Weight:</strong> ${weight} kg</p>
    `;

    document.getElementById("pokemonDetails").innerHTML = modalContent;
    document.getElementById("pokemonModal").style.display = "block";

    addBackgroundColour(overviewData, "modal-container");

    document.getElementById("closeModal").onclick = function() {
        document.getElementById("pokemonModal").style.display = "none";
        removeBackgroundColour(overviewData, "modal-container")
    }
}