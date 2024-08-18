let pokeID = 133;
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
return word
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join('-'); 
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

    await loadEvolutionChain(specificData, id);

    document.getElementById("pokemonModal").onclick = (event) => {
        if (event.target === document.getElementById("pokemonModal")) {
            closeModal(specificData);
        }
    };

    // document.getElementById("closeModal").onclick = () => {
    //     closeModal(specificData);
    // };

    cry.play();
}


async function loadEvolutionChain(specificData, id) {
    let speciesUrl = specificData.species.url;
    let speciesData = await fetch(speciesUrl).then(res => res.json());
    let evolutionChainUrl = speciesData.evolution_chain.url;
    let evolutionChainData = await fetch(evolutionChainUrl).then(res => res.json());

    console.log(evolutionChainData);

    let chain = evolutionChainData.chain;
    let evolutionsHTML = generateEvolutionsHTML(chain, id);
    
    document.getElementById("pokemonDetails").innerHTML += `
        <div class="p-2 rounded mt-3">
            <h4>Evolution Chain</h4>
            <div id="evolutionChain">${evolutionsHTML}</div>
        </div>
    `;
}

function generateEvolutionsHTML(chain, currentId) {
    let html = '';

    function traverseChain(chainNode, isCurrent) {
        let speciesName = upperCaseFirstLetter(chainNode.species.name);
        let speciesId = extractIdFromUrl(chainNode.species.url);  // Diese Funktion extrahiert die Pokémon-ID
        let spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`;
        
        // Hervorhebung für das aktuelle Pokémon
        let highlightClass = isCurrent ? 'border border-primary rounded' : '';

        html += `
            <div class="d-flex align-items-center ${highlightClass}">
                <img src="${spriteUrl}" alt="${speciesName}" class="w-25">
                <p class="mb-0 mx-2">${speciesName}</p>
            </div>
        `;

        // Falls es weitere Entwicklungen gibt
        if (chainNode.evolves_to.length > 0) {
            html += '<div class="d-flex flex-column align-items-center">';
            chainNode.evolves_to.forEach(childChainNode => traverseChain(childChainNode, false));
            html += '</div>';
        }
    }

    traverseChain(chain, chain.species.name === currentId);

    return html;
}

function extractIdFromUrl(url) {
    return url.split('/').filter(Boolean).pop();  // Extrahiere die letzte ID aus der URL
}


function modalContentHTML(specificData, id) {
    let name = upperCaseFirstLetter(specificData.name);
    let sprite = specificData.sprites.other["official-artwork"].front_default;
    let abilities = specificData.abilities.map(t => upperCaseFirstLetter(t.ability.name));
    let types = specificData.types.map(t => upperCaseFirstLetter(t.type.name));
    let height = specificData.height / 10;  // Höhe in Metern
    let weight = specificData.weight / 10;  // Gewicht in Kilogramm


    let content = `
        <h3>${name} (#${id})</h3>
        <div class="d-flex justify-content-between w-100">
            <div id="typesOfSpecific"></div> 
            <img class="w-50" src="${sprite}" alt="${name}">
        </div>
        <div class="p-2 rounded text-dark bc-textBackground">
            <p> <span class="fw-bold">Abilities:</span> ${abilities.join(", ")}</p>
            <p> <span class="fw-bold">Type(s)</span>: ${types}</p>
            <p> <span class="fw-bold">Height:</span> ${height} m</p>
            <p> <span class="fw-bold">Weight:</span> ${weight} kg</p>
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
                <div class="progress-bar" role="progressbar" style="width: ${sValueInPercent}" aria-valuenow="${statValue}" aria-valuemin="0" aria-valuemax="255">${statValue}</div>
            </div>
        </div>
        `
    }


    let sValueInPercent = calculatePercent(statValueSum, 720);
    statsContainer.innerHTML += `
        <div>
            <p>Summary</p>
            <div class="progress">
                <div class="progress-bar" role="progressbar" style="width: ${sValueInPercent}" aria-valuenow="${statValueSum}" aria-valuemin="0" aria-valuemax="255">${statValueSum}</div>
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