let allPokemonNames = [];
let allMatchingIDs = [];

let currentPokeID = 1;
let highestPokeID = 1025;

let volumeOn = true;
let searchMode = false;
let showNextButton = true

let arrayStart = 0;
let amountOfCards = 24;

const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
const LIST_URL_1 = "?offset=";
const LIST_URL_2 = "&limit=";
const FORM_URL = "-form";

let chosenContent = "generalTab";


async function init(start = currentPokeID) {
    currentPokeID = start;
    document.getElementById("container").innerHTML = '';

    hideContainer();
    await loadNextPokecards(amountOfCards);
}


async function loadNextPokecards(amount) {
    let container = document.getElementById("container");
    container.classList.remove('containerText');

    toggleNextButton(false);
    showSpinner();
    await tryLoadPokecards(amount)
    hideSpinner();
    toggleNextButton();
    showContainer()
}


async function tryLoadPokecards(amount) {
    try {
        await loadPokecards(amount)
    } catch (error) {
        container.innerHTML = "Leider konnten keine Daten geladen werden. Bitte versuchen sie es später erneut.";
        container.classList.add('containerText');
        showNextButton = false;
    }
}


async function loadPokecards(amount = amountOfCards) {
    if (!searchMode) {
        await loadPokecardsNoSearch(amount);
    } else {
        await loadPokecardsSearchMode(amount);
    }
}


async function loadPokecardsNoSearch(amount) {
    for (let id = currentPokeID; id < currentPokeID + amount; id++) {
        await loadAndDisplaySinglePokecard(id);
        if (id >= highestPokeID) {
            break;
        }
    }
    currentPokeID = Math.min(currentPokeID + amount, highestPokeID);
    showNextButton = currentPokeID < highestPokeID;
}


async function loadPokecardsSearchMode(amount) {
    for (let i = arrayStart; i < allMatchingIDs.length && i < arrayStart + amount; i++) {
        let id = allMatchingIDs[i] + 1;
        await loadAndDisplaySinglePokecard(id);
        arrayStart++;
        if (i >= allMatchingIDs.length - 1) {
            break;
        }
    }
    showNextButton = arrayStart < allMatchingIDs.length;
}


async function loadAndDisplaySinglePokecard(id) {
    let container = document.getElementById('container');

    let overviewData = await loadOverviewData(id);
    let types = overviewData.types.map(t => t.type.name);

    container.innerHTML += await overviewCardHTML(overviewData, id);
    addTypesHTML(types, `typesOf${id}`);
    addBackgroundColour(overviewData, `pokeCardNo${id}`);
}


async function showModal(id) {
    let specificData = await loadSpecificData(id);
    let types = specificData.types.map(t => (t.type.name));

    chosenContent = "generalTab";

    modalHTML(specificData, id);
    addTypesHTML(types, `typesOfSpecific`)
    addBackgroundColour(specificData, "modal-container");

    document.getElementById("pokemonModal").classList.remove('d-none')
    document.getElementById("pokemonModal").classList.add('d-flex')
    document.body.style.overflow = "hidden";

    closeModalOnclick(specificData);

    checkPrevoiusAndNextButtonStatus(id)

    if (volumeOn) {
        pokeCry(id);
    }
}


function checkPrevoiusAndNextButtonStatus(id) {
    if (searchMode) {
        checkButtonStatusInSearchMode(id);
    } else {
        checkButtonStatusNoSearchMode(id);
    }
}


function checkButtonStatusInSearchMode(id) {
    let index = allMatchingIDs.indexOf(id - 1);
    if (index + 1 >= arrayStart) {
        let nextButton = document.getElementById("modal-next-button")
        nextButton.disabled = true;
    } else if (index + 1 <= 1) {
        let prevoiusButton = document.getElementById("modal-prevoius-button")
        prevoiusButton.disabled = true;
    }
}


function checkButtonStatusNoSearchMode(id) {
    if (id >= currentPokeID - 1) {
        let nextButton = document.getElementById("modal-next-button")
        nextButton.disabled = true;
    } else if (id <= 1) {
        let prevoiusButton = document.getElementById("modal-prevoius-button")
        prevoiusButton.disabled = true;
    }
}


async function pokeCry(id) {
    let specificData = await loadSpecificData(id);
    let cry = await new Audio(specificData.cries.latest);
    cry.play();
}



function generateNavBorder() {
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
    let newId;

    specificData = await loadSpecificData(ID);
    closeModal(specificData);

    if (searchMode) {
        let index = allMatchingIDs.indexOf(ID - 1);
        newId = allMatchingIDs[index + upOrDown] + 1;
    } else {
        newId = ID + upOrDown;
    }
    showModal(newId);
}


function closeModalOnclick(specificData) {
    document.getElementById("pokemonModal").onclick = (event) => {
        if (event.target === document.getElementById("pokemonModal")) {
            closeModal(specificData);
        }
    }
}


function closeModal(specificData) {
    document.getElementById("pokemonModal").classList.remove('d-flex');
    document.getElementById("pokemonModal").classList.add('d-none');
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
    let input = document.getElementById("searchInput");
    allMatchingIDs = [];
    arrayStart = 0;

    document.getElementById("container").innerHTML = '';

    hideContainer();

    fillArrayWithIDs();

    if (input.value == '') {
        searchNoPokemon();
    } else if (allMatchingIDs.length == 1) {
        foundOnePokemon()
    } else if (allMatchingIDs.length == 0) {
        foundNoPokemon();
    } else {
        foundSeveralPokemon()
    }
}


async function searchWithNumber(id) {
    if (id <= 0) {
        container.innerHTML = 'Es wurde kein passendes Pokemon gefunden. Die eingegebene ID ist zu klein';
        container.classList.add('containerText');
    } else if (id > highestPokeID) {
        container.innerHTML = 'Es wurde kein passendes Pokemon gefunden. Die eingegebene ID ist zu gross';
        container.classList.add('containerText');
    } else {
        init(id)
        searchMode = false;
    }
    showContainer();
}


function fillArrayWithIDs() {
    let result = allPokemonNames.filter(checkNames);

    for (let i = 0; i < result.length; i++) {
        let name = result[i];

        let index = allPokemonNames.indexOf(name);
        allMatchingIDs.push(index)
    }
}


async function searchNoPokemon() {
    currentPokeID = 1;
    await init(1);
    searchMode = false;
}


async function foundOnePokemon() {
    searchMode = true;
    await loadNextPokecards(1);
    showModal(allMatchingIDs[0] + 1)
}


function foundNoPokemon() {
    container.innerHTML = 'Es wurde kein passendes Pokemon gefunden.';
    container.classList.add('containerText');
}


async function foundSeveralPokemon() {
    searchMode = true;
    await loadNextPokecards();
}


function checkNames(name) {
    let input = document.getElementById("searchInput").value.toLowerCase();
    return name.toLowerCase().includes(input);
}


function changeVolume() {
    if (volumeOn) {
        volumeOn = false;
        document.getElementById('volumeOnImg').classList.remove('d-block');
        document.getElementById('volumeOnImg').classList.add('d-none');
        document.getElementById("volumeOffImg").classList.remove('d-none');
        document.getElementById("volumeOffImg").classList.add('d-block');
    } else {
        volumeOn = true;
        document.getElementById('volumeOffImg').classList.remove('d-block');
        document.getElementById('volumeOffImg').classList.add('d-none');
        document.getElementById("volumeOnImg").classList.remove('d-none');
        document.getElementById("volumeOnImg").classList.add('d-block');
    }
}


function showSpinner() {
    document.querySelector('.spinner-container').classList.remove('d-none');
    document.querySelector('.spinner-container').classList.add('d-flex');
}


function hideSpinner() {
    document.querySelector('.spinner-container').classList.remove('d-flex');
    document.querySelector('.spinner-container').classList.add('d-none');
}


function hideContainer() {
    document.getElementById("container").classList.add('hideContainer');
    document.getElementById("container").classList.remove('showContainer');
}


function showContainer() {
    document.getElementById("container").classList.remove('hideContainer');
    document.getElementById("container").classList.add('showContainer')
}


function toggleNextButton(shouldShow = showNextButton) {
    let nextButton = document.getElementById("nextButton");
    if (shouldShow == true) {
        nextButton.classList.remove('d-none');
    } else {
        nextButton.classList.add('d-none');
    }
}