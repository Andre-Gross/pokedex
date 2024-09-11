async function overviewCardHTML(overviewData, id) {
    let name = upperCaseFirstLetter(overviewData.name);
    let sprite = await overviewData.sprites.front_default;

    let pokeCard = `
        <div id="pokeCardNo${id}" class="d-flex flex-column p-2 pokeCard rounded" onclick="showModal(${id})">
            <p class="align-self-end">#${id}</p>
            <h3>${name}</h3>
            <div class="d-flex justify-content-between">
                <div id=typesOf${id} class="d-flex flex-column" style="gap: 8px"></div>
                <div class="d-flex justify-content-center align-items-center pokeCardImgContainer"> 
                    <img src="${sprite}" alt="${name}">
                </div>
            </div>
        </div>
    `

    return pokeCard;
}


function addTypesHTML(types, elementID) {
    let element = document.getElementById(elementID);
    element.innerHTML = ''

    for (let i = 0; i < types.length; i++) {
        let type = upperCaseFirstLetter(types[i]);
        element.innerHTML += `<div class="d-flex justify-content-center rounded-pill bc-${types[0]} text-dark p-1", style="filter: brightness(120%); box-shadow: 0px 0px 3px 0.2px #000000;">${type}</div>`
    }
}


function modalHTML(specificData, id) {
    modalHeadHTML(specificData, id)
    modalNavHTML(id);
    modalContentHTML(specificData);
    modalPreviousNextButtonHTML(id);
}


function modalHeadHTML(specificData, id) {
    let name = upperCaseFirstLetter(specificData.name);
    let sprite = specificData.sprites.other["official-artwork"].front_default;

    let head = `
        <h3>${name} (#${id})</h3>
        <div class="d-flex justify-content-between w-100">
            <div id="typesOfSpecific" class="d-flex flex-column" style="gap: 8px"></div> 
            <img class="w-50" src="${sprite}" alt="${name}">
        </div>
    `

    document.getElementById("modalHead").innerHTML = head;
}


function modalNavHTML(id) {
    document.getElementById("modalNav").innerHTML = `
    <ul class="nav">
        <li id="generalTab" class="rounded-top p-2 d-flex justify-content-center align-items-center flex-fill bc-text" onclick="openTab('generalTab', ${id})">
            <p class="m-0 fw-bold text-dark">General</p>
        </li>
        <li id="statsTab" class="rounded-top d-flex justify-content-center align-items-center flex-fill bc-text" onclick="openTab('statsTab', ${id})">
            <p class="m-0 fw-bold text-dark">Base Stats</p>
        </li>
    </ul>
    `

    generateNavBorderBot();
}


function modalContentHTML(specificData) {
    let modalContent = document.getElementById("modalContent");

    if (chosenContent == "generalTab") {
        modalContent.innerHTML = generalContentHTML(specificData);
    } else if (chosenContent == "statsTab") {
        modalContent.innerHTML = statsHTML(specificData);
    }
}


function generalContentHTML(specificData) {
    let abilities = specificData.abilities.map(t => upperCaseFirstLetter(t.ability.name));
    let types = specificData.types.map(t => upperCaseFirstLetter(t.type.name));
    let height = specificData.height / 10;  // Höhe in Metern
    let weight = specificData.weight / 10;  // Gewicht in Kilogramm


    let content = `
        <div class="p-2 rounded-bottom text-dark bc-text">
            <p> <span class="fw-bold">Abilities:</span> ${abilities.join(", ")}</p>
            <p> <span class="fw-bold">Type(s)</span>: ${types}</p>
            <p> <span class="fw-bold">Height:</span> ${height} m</p>
            <p> <span class="fw-bold">Weight:</span> ${weight} kg</p>
        </div>
    `;

    return content;
}


function statsHTML(specificData) {
    stats = specificData.stats;
    let statValueSum = 0;

    let HTML = '';

    for (let i = 0; i < stats.length; i++) {
        const singleStat = stats[i];
        let name = singleStat.stat.name;
        let statValue = singleStat["base_stat"];
        let sValueInPercent = calculatePercent(statValue, 255);

        statValueSum += statValue

        HTML += `
        <div>
            <p class="statsName">${upperCaseFirstLetter(name)}</p>
            <div class="progress">
                <div class="progress-bar" role="progressbar" style="width: ${sValueInPercent}" aria-valuenow="${statValue}" aria-valuemin="0" aria-valuemax="255">${statValue}</div>
            </div>
        </div>
        `
    }


    let sValueInPercent = calculatePercent(statValueSum, 720);
    HTML += `
        <div>
            <p class="statsName">Summary</p>
            <div class="progress">
                <div class="progress-bar" role="progressbar" style="width: ${sValueInPercent}" aria-valuenow="${statValueSum}" aria-valuemin="0" aria-valuemax="255">${statValueSum}</div>
            </div>
        </div>
        `

    return HTML;
}


function modalPreviousNextButtonHTML(id) {
    container = document.getElementById("modalPrevoiusNextButton");
    container.innerHTML = `
    <button class="rounded-circle btn bc-text" onclick="changeModalCard(${id}, -1)">&#8656</button>
    <button class="rounded-circle btn bc-text" onclick="changeModalCard(${id}, 1)">&#8658</button>
    `;

}


function loadingSpinnerHTML() {
    HTML = `
        <div class="spinner-container">
            <svg class="pokeball-spinner" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
                <circle cx="50" cy="50" r="45" fill="red" />
                <path d="M 5,50 A 45,45 0 0 0 95,50 Z" fill="white" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="black" stroke-width="5" />
                <circle cx="50" cy="50" r="15" fill="white" stroke="black" stroke-width="5" />
                <circle cx="50" cy="50" r="7" fill="black" />
            </svg>
        </div>`;
    return HTML;
}


