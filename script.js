let pokeID = 1;
let amountOfCards = 100;
let firstVisibleCard = 0
const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
const FORM_URL = "-form"


async function init() {
    let container = document.getElementById("container")

    container.innerHTML = "";

    for (let id = pokeID; id < pokeID + amountOfCards; id++) {
        let overviewData = await loadOverviewData(id);
        container.innerHTML += await overviewCardHTML(overviewData, id);
        addTypesHTML(overviewData, id);
        addBackgroundColour(overviewData, id);
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
        <div id="pokeCardNo${id}" class="pokeCard rounded">
            <h3>${name}</h3>
            <div class="d-flex">
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


function addBackgroundColour(overviewData, id) {
    document.getElementById(`pokeCardNo${id}`).classList.add(`bc-${overviewData.types[0].type.name}`);
}

