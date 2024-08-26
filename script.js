let currentPokeID = 1024;
let amountOfCards = 120;
let highestPokeID = 1025;
const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
const FORM_URL = "-form"

let chosenContent = "generalTab";


async function init() {

    // showModal(currentPokeID);

    let container = document.getElementById("container")

    container.innerHTML = ""; 
    await loadNextPokecards(amountOfCards);


}


async function loadNextPokecards(amount) {
    let container = document.getElementById("container");
    for (let id = currentPokeID; id < currentPokeID + amount && id <= highestPokeID; id++) {
        let overviewData = await loadOverviewData(id);
        let types = overviewData.types.map(t => (t.type.name));
        container.innerHTML += await overviewCardHTML(overviewData, id);
        addTypesHTML(types, `typesOf${id}`);
        addBackgroundColour(overviewData, `pokeCardNo${id}`);
        currentPokeID = id;
    }
    if(currentPokeID >= highestPokeID) {
        document.getElementById("nextButton").style.display = "none";

    }
}


async function showModal(id) {
    let specificData = await loadSpecificData(id);
    let types = specificData.types.map(t => (t.type.name));
    let cry = await new Audio(specificData.cries.latest);

    chosenContent = "statsTab";

    modalHTML(specificData, id);
    addTypesHTML(types, `typesOfSpecific`)
    addBackgroundColour(specificData, "modal-container");

    document.getElementById("pokemonModal").style.display = "block";
    document.body.style.overflow = "hidden";

    closeModalOnclick(specificData);

    cry.play();
}


function generateNavBorderBot() {
    switch (chosenContent) {
        case 'generalTab':
            document.getElementById("generalTab").style.borderBottom = "unset";
            document.getElementById("statsTab").style.borderBottom = "solid 0.5px grey";
            break;
        case 'statsTab':
            document.getElementById("generalTab").style.borderBottom = "solid 0.5px grey";
            document.getElementById("statsTab").style.borderBottom = "unset";
            break;
    }
}


async function openTab(tab, id) {
    chosenContent = tab;

    let specificData = await loadSpecificData(id);
    modalNavHTML(specificData, id);
    modalContentHTML(specificData);
}


async function changeModalCard(currentId, newId) {
    specificData = await loadSpecificData(currentId);
    closeModal(specificData);
    showModal(newId);

    if (newId > currentPokeID-1) {
        loadNextPokecards(amountOfCards);
    }
}


function closeModalOnclick(specificData) {
    document.getElementById("pokemonModal").onclick = (event) => {
        if (event.target === document.getElementById("pokemonModal")) {
            closeModal(specificData);
        }
    }
}


function closeModal(specificData) {
    document.getElementById("pokemonModal").style.display = "none";
    removeBackgroundColour(specificData, "modal-container");
    document.body.style.overflow = "scroll";
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
    return word.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-');
}


function addBackgroundColour(overviewData, element) {
    document.getElementById(element).classList.add(`bc-${overviewData.types[0].type.name}`);
}


function removeBackgroundColour(overviewData, element) {
    document.getElementById(element).classList.remove(`bc-${overviewData.types[0].type.name}`);
}


function calculatePercent(x, y) {
    percent = ((x / y) * 100) + '%';
    return percent;
}