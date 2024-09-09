let allPokemonNames = [];
let allMatchingIDs = [];

let currentPokeID = 1;
let amountOfCards = 12;
let highestPokeID = 1025;

let volumeOn = false;
let searchMode = false;

let saveID = 1;

const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
const LIST_URL_1 = "?offset=";
const LIST_URL_2 = "&limit=";
const FORM_URL = "-form";

let chosenContent = "generalTab";

loadAllPokemonNames();


async function init(start = currentPokeID) {
    currentPokeID = start;
    document.getElementById("nextButton").style.display = "inline-block";

    // showModal(currentPokeID);

    let container = document.getElementById("container")

    container.innerHTML = "";
    await loadNextPokecards(amountOfCards);
}


async function loadNextPokecards(amount) {
    await loadPokecards(amount)

    currentPokeID = currentPokeID + amount;
    if (currentPokeID > highestPokeID) {
        currentPokeID = highestPokeID
    }
}


async function loadPokecards(idsOrAmount) {
    let container = document.getElementById("container");

    if (searchMode == false) {
        for (let id = currentPokeID; id < currentPokeID + idsOrAmount; id++) {
            await loadAndDisplayPokecard(id, container);
            if (id >= highestPokeID) {
                document.getElementById("nextButton").style.display = "none";
                break;
            }
        }
    } else {
        for (let i = 0; i < idsOrAmount.length; i++) {
            let id = idsOrAmount[i] + 1;
            await loadAndDisplayPokecard(id, container);
        }
    }
}


async function loadAndDisplayPokecard(id, container) {
    let overviewData = await loadOverviewData(id);
    let types = overviewData.types.map(t => t.type.name);
    container.innerHTML += await overviewCardHTML(overviewData, id);
    addTypesHTML(types, `typesOf${id}`);
    addBackgroundColour(overviewData, `pokeCardNo${id}`);
}


async function showModal(id) {
    let specificData = await loadSpecificData(id);
    let types = specificData.types.map(t => (t.type.name));
    let cry = await new Audio(specificData.cries.latest);

    saveID = id;
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
        let index = allMatchingIDs.indexOf(ID-1);
        newId = allMatchingIDs[index + upOrDown]+1;
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
    allMatchingIDs = [];
    let result = allPokemonNames.filter(checkNames);

    container.style = '';

    for (let i = 0; i < result.length; i++) {
        let name = result[i];

        let index = allPokemonNames.indexOf(name);
        allMatchingIDs.push(index)
    }

    if (allMatchingIDs.length == 1) {
        container.innerHTML = '';
        await loadPokecards(allMatchingIDs);
        searchMode = true;
        showModal(allMatchingIDs[0] + 1)
    } else if (input.value == '') {
        init(1);
        searchMode = false;
    } else if (allMatchingIDs == 0) {
        container.innerHTML = 'Es wurde kein passendes Pokemon gefunden.';
        container.style.color = "white";
        container.style.fontSize = "32px";
    } else {
        container.innerHTML = '';
        await loadPokecards(allMatchingIDs);
        searchMode = true;
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