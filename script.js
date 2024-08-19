let pokeID = 133;
let amountOfCards = 12;
const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
const FORM_URL = "-form"

let chosenContent = "generalTab";


async function init() {
    let container = document.getElementById("container")

    container.innerHTML = "";

    for (let id = pokeID; id < pokeID + amountOfCards; id++) {
        let overviewData = await loadOverviewData(id);
        let types = overviewData.types.map(t => (t.type.name));
        container.innerHTML += await overviewCardHTML(overviewData, id);
        addTypesHTML(types, `typesOf${id}`);
        addBackgroundColour(overviewData, `pokeCardNo${id}`);
    }

    // showModal(pokeID);

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

    closeModal(specificData);

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


function calculatePercent(x, y) {
    percent = ((x / y)*100) + '%';
    return percent;
}


function closeModal(specificData) {
    document.getElementById("pokemonModal").onclick = (event) => {
        if (event.target === document.getElementById("pokemonModal")) {
            document.getElementById("pokemonModal").style.display = "none";
            removeBackgroundColour(specificData, "modal-container");
            document.body.style.overflow = "scroll";
        }
    }
}