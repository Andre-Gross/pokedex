let pokeID = 1
;
let amountOfCards = 20;
let firstVisibleCard = 0
const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
const FORM_URL = "-form"


async function init() {
    let overviewData = await loadOverviewData(pokeID);
    let container = document.getElementById("container")
    
    container.innerHTML = overviewCardHTML(overviewData, pokeID);
    addTypesHTML(overviewData, pokeID);
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


function overviewCardHTML(overviewData, id){
    let name = upperCaseFirstLetter(overviewData.name);

    let pokeCard = `
        <div>
            <h3>${name}</h3>
            <div id=types${id}><div> 
        </div>
    `

    return pokeCard;
}


function addTypesHTML(overviewData, id) {
    let typeContainer = document.getElementById(`types${id}`)
    let type0 = upperCaseFirstLetter(overviewData.types[0].type.name);
    console.log(type0);

    typeContainer.innerHTML = `<div>${type0}</div>`

    if(overviewData.types.length > 1){
        let type1 = upperCaseFirstLetter(overviewData.types[1].type.name);
        typeContainer.innerHTML += `<div>${type1}</div>`;
    }
}

