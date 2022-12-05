document.addEventListener('DOMContentLoaded', () => {
    createNewMonsterForm();
    createMonstersPerPageDropdown();
    populateExistingMonsters(document.getElementById('number').value);
    pageNavListener();
    createNewMonster();
})

let pageNumber = 1; // this is the current page we are on

// this function will create a new monster at the end of the list
function createNewMonster () {
    const monsterForm = document.getElementById('monster-form');
    monsterForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (monsterForm[0].value === '') {
            alert("Please enter a name!");
        }
        else if (monsterForm[1].value === '') {
            alert("Please enter an age!");
        }
        else if (monsterForm[2].value === '') {
            alert("Please enter a description!");
        }
        else {
            appendNewMonsterHTML(monsterForm[0].value, monsterForm[1].value, monsterForm[2].value); // add to HTML
            appendNewMonsterDatabase(monsterForm[0].value, monsterForm[1].value, monsterForm[2].value); // add to database
        }
    })
}

// this function takes new monster info and adds it to the database
function appendNewMonsterDatabase (nameInput, ageInput, descriptionInput) {
    fetch('http://localhost:3000/monsters', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"          
        },
        body: JSON.stringify({
            name: nameInput,
            age: ageInput,
            description: descriptionInput
        })
    })
}

// this function takes new monster info and adds it to the DOM
function appendNewMonsterHTML (name, age, description) {
    console.log(`
    Name: ${name}
    Age: ${age}
    Bio: ${description}
    `)
    const newMonster = document.createElement('div');
    newMonster.innerHTML = `
        <h2>${name}</h2>
        <h4>Age: ${age}</h4>
        <p>
            "Bio: ${description}"
        </p>
    `
    document.getElementById('monster-container').appendChild(newMonster);
}

// this function gets called when we are displaying a certain amount of monsters and sets the btn.disabled correctly
function pageNavBtnControl (numPerPage) {
    if (pageNumber != 1) {
        document.getElementById('back').disabled = false;
    }
    fetch(`http://localhost:3000/monsters/?_limit=${numPerPage}&_page=${parseInt(pageNumber)+1}`)
    .then((response) => response.json())
    .then((json) => {
        if (json.length > 0) {
            document.getElementById('forward').disabled = false;
        }
    });
}

// event listeners for the page navigation buttons
function pageNavListener () {
    document.getElementById('forward').addEventListener('click', () => {
        pageNumber++;
        clearPage();
        populateExistingMonsters(document.getElementById('number').value);
    });
    document.getElementById('back').addEventListener('click', () => {
        pageNumber--;
        clearPage();
        populateExistingMonsters(document.getElementById('number').value);
    });
}

// this function clears the page
function clearPage () {
    const oldPage = document.getElementById('monster-container')
    while (oldPage.firstChild) {
        oldPage.removeChild(oldPage.firstChild);
    }
}

// this function creates the HTML form used for creating a new monster
function createNewMonsterForm () {
    document.getElementById('create-monster').innerHTML = `
        <form id='monster-form'>
            <input id='name' placeholder='name...'>
            <input id='age' placeholder='age...'>
            <input id='description' placeholder='description...'>
            <button>Create</button>
        </form>
    `
}

// this function makes the monsters per page dropdown
function createMonstersPerPageDropdown () {
    let perPageDropdown = document.createElement('div');
    perPageDropdown.innerHTML = `
        <form id='mosters-per-page'>
            <label for="number">Monsters per page:</label>
            <select id="number" name="number">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="500">500</option>
                <option value="all">all</option>
            </select>
        </form>
    `
    document.body.insertBefore(perPageDropdown, document.getElementById('monster-container'));
    document.getElementById('number').addEventListener('change', () => {
        clearPage();
        populateExistingMonsters(document.getElementById('number').value);
    });
}

// this function will fetch the monsters from the server
// arg is the number of monsters to display per page
function populateExistingMonsters (numPerPage) {
    let fetchUrl = 'http://localhost:3000/monsters';
    document.getElementById('back').disabled = true;
    document.getElementById('forward').disabled = true;
    if (numPerPage != 'all') {
        fetchUrl = `http://localhost:3000/monsters/?_limit=${numPerPage}&_page=${pageNumber}`;
        pageNavBtnControl(numPerPage); // check if we need to enable the navigation buttons
    }
    fetch(fetchUrl)
    .then((response) => response.json())
    .then((json) => {
        for (let monster of json) {
            displayMonster(monster); // call the display monster function on each element
        }
        document.getElementById('page-number').textContent = `page: ${pageNumber}`; // display the page number
    });
}

// takes a monster array element, writes it into an HTML element and appends it to the monster-container
function displayMonster (monster) {
    let newMonster = document.createElement('div');
    newMonster.innerHTML = `
        <h2>${monster.name}</h2>
        <h4>Age: ${Math.floor(monster.age)}</h4>
        <p>
            Bio: ${monster.description}
        </p>
    `
    document.getElementById('monster-container').appendChild(newMonster);
}