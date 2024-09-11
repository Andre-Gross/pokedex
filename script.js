let allPokemonNames = [];
let allMatchingIDs = [];

let currentPokeID = 1;
let amountOfCards = 6;
let highestPokeID = 1025;

let volumeOn = false;
let searchMode = false;

let arrayStart = 0;

const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
const LIST_URL_1 = "?offset=";
const LIST_URL_2 = "&limit=";
const FORM_URL = "-form";

let chosenContent = "generalTab";

let saveHTML = ``;

loadAllPokemonNames();


async function init(start = currentPokeID) {
    currentPokeID = start;
    let container = document.getElementById("container");
    container.innerHTML = '';
    document.getElementById("nextButton").style.display = "inline-block";


    container.style.display = "none";
    container.style.flex = "none";
    await loadNextPokecards(amountOfCards);
    container.style.flex = "1";
    container.style.display = "flex";
}


async function loadNextPokecards(amount) {
    let nextButton = document.getElementById("nextButton");


    nextButton.style.display = "none";
    showSpinner();
    await loadPokecards(amount)
    container.innerHTML += invisible.innerHTML;
    invisible.innerHTML = '';
    hideSpinner();
}


async function loadPokecards(amount = amountOfCards) {
    if (searchMode == false) {
        for (let id = currentPokeID; id < currentPokeID + amount; id++) {
            await loadAndDisplayPokecard(id);
            if (id >= highestPokeID) {
                document.getElementById("nextButton").style.display = "none";
                break;
            }
        }
        currentPokeID = currentPokeID + amount;
        if (currentPokeID > highestPokeID) {
            currentPokeID = highestPokeID
        } else {
            nextButton.style.display = "inline-block";
        }
    } else {
        for (let i = arrayStart; i < allMatchingIDs.length && i < arrayStart + amount; i++) {
            let id = allMatchingIDs[i] + 1;
            await loadAndDisplayPokecard(id);
            if (i >= allMatchingIDs.length - 1) {
                document.getElementById("nextButton").style.display = "none";
                break;
            }
        }
        arrayStart = arrayStart + amount;
        if (arrayStart < allMatchingIDs) {
            nextButton.style.display = "inline-block";
        }
    }
}


async function loadAndDisplayPokecard(id) {
    let invisible = document.getElementById('invisible');

    let overviewData = await loadOverviewData(id);
    let types = overviewData.types.map(t => t.type.name);
    invisible.innerHTML += await overviewCardHTML(overviewData, id);
    addTypesHTML(types, `typesOf${id}`);
    addBackgroundColour(overviewData, `pokeCardNo${id}`);
}


async function showModal(id) {
    let specificData = await loadSpecificData(id);
    let types = specificData.types.map(t => (t.type.name));
    let cry = await new Audio(specificData.cries.latest);

    chosenContent = "generalTab";

    modalHTML(specificData, id);
    addTypesHTML(types, `typesOfSpecific`)
    addBackgroundColour(specificData, "modal-container");

    document.getElementById("pokemonModal").style.display = "block";
    document.body.style.overflow = "hidden";

    closeModalOnclick(specificData);

    if (volumeOn) {
        cry.play();
    }
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
    modalNavHTML(id);
    modalContentHTML(specificData);
}


async function changeModalCard(ID, upOrDown) {
    specificData = await loadSpecificData(ID);
    closeModal(specificData);
    let newId;

    if (searchMode) {
        let index = allMatchingIDs.indexOf(ID - 1);
        newId = allMatchingIDs[index + upOrDown] + 1;
    } else {
        newId = ID + upOrDown;
    }
    showModal(newId);

    if (newId > currentPokeID - 1) {
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


async function loadAllPokemonNames() {
    let response = await fetch(BASE_URL + LIST_URL_1 + "0" + LIST_URL_2 + highestPokeID + ".json");
    let responseAsJSON = await response.json();

    for (let i = 0; i < responseAsJSON.results.length; i++) {
        const name = responseAsJSON.results[i].name;
        allPokemonNames.push(name);
    }
}


async function searchPokemon() {
    let container = document.getElementById("container");
    let input = document.getElementById("searchInput");
    let result = allPokemonNames.filter(checkNames);
    allMatchingIDs = [];
    arrayStart = 0;

    container.innerHTML = '';
    document.getElementById("nextButton").style.display = "inline-block";

    container.style = '';
    container.style.flex = '1';

    for (let i = 0; i < result.length; i++) {
        let name = result[i];

        let index = allPokemonNames.indexOf(name);
        allMatchingIDs.push(index)
    }

    if (allMatchingIDs.length == 1) {
        await loadPokecards(allMatchingIDs);
        searchMode = true;
        showModal(allMatchingIDs[0] + 1)
    } else if (input.value == '') {
        currentPokeID = 1;
        init(1);
        searchMode = false;
    } else if (allMatchingIDs.length == 0) {
        container.innerHTML = 'Es wurde kein passendes Pokemon gefunden.';
        container.style.color = "white";
        container.style.fontSize = "32px";
    } else {
        searchMode = true;
        await loadNextPokecards();
    }
}


function checkNames(name) {
    let input = document.getElementById("searchInput").value.toLowerCase();
    return name.toLowerCase().includes(input);
}


function changeVolume() {
    if (volumeOn) {
        volumeOn = false;
        document.getElementById('volumeOnImg').style.display = "none";
        document.getElementById("volumeOffImg").style.display = "block";
    } else {
        volumeOn = true;
        document.getElementById('volumeOnImg').style.display = "block";
        document.getElementById("volumeOffImg").style.display = "none";
    }
}


function showSpinner() {
    document.querySelector('.spinner-container').style.display = 'flex';
}

function hideSpinner() {
    document.querySelector('.spinner-container').style.display = 'none';
}