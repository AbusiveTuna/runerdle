import { GUESSES } from "./WordLists/guesses.js";
import { WORDS } from "./WordLists/dictionary.js";
import { HARDWORDS } from "./WordLists/hardWords.js";

const NUMBER_OF_GUESSES = 6;
let hardMode = document.getElementById('hardModeButton').checked;
let allWords = document.getElementById('dictionaryButton').checked;
console.log(hardMode);
console.log(allWords);
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let rightGuessString = "";
let rightGuessWiki = "";
let rand = 0;
let justWords;

function getWord(){

    if(hardMode){
        rand = Math.floor(Math.random() * HARDWORDS.length);
        rightGuessString = HARDWORDS[rand][0];
        rightGuessWiki = HARDWORDS[rand][1];
        justWords = toOneD(HARDWORDS);
    }
    else{
        rand = Math.floor(Math.random() * GUESSES.length);
        rightGuessString = GUESSES[rand][0];
        rightGuessWiki = GUESSES[rand][1];
        justWords = toOneD(GUESSES);
    }
    console.log(rightGuessString);
}

//Removes the wiki links from the array
function toOneD(twoD){
    let oneD = new Array(twoD.length);

    for(let i = 0; i < twoD.length; i++){
        oneD[i] = twoD[i][0];
    }

    return oneD;
}

function initBoard() {
    getWord();
    
    let board = document.getElementById("game-board");

    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        let row = document.createElement("div")
        row.className = "letter-row"
        
        for (let j = 0; j < 5; j++) {
            let box = document.createElement("div")
            box.className = "letter-box"
            row.appendChild(box)
        }

        board.appendChild(row)
    }
}

initBoard();

document.addEventListener("keyup", (e) => {

    if (guessesRemaining === 0) {
        return;
    }

    let pressedKey = String(e.key)
    if (pressedKey === "Backspace" && nextLetter !== 0) {
        deleteLetter();
        return;
    }

    if (pressedKey === "Backspace" && nextLetter !== 0) {
        deleteLetter();
        return;
    }

    if (pressedKey === "Enter") {
        checkGuess();
        return;
    }
    
    if (event.keyCode >= 65 && event.keyCode <= 90){
        insertLetter(pressedKey);
    }

})

function insertLetter (pressedKey) {
    if (nextLetter === 5) {
        return;
    }
    pressedKey = pressedKey.toLowerCase();

    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
    let box = row.children[nextLetter];
    animateCSS(box, "pulse");
    box.textContent = pressedKey;
    box.classList.add("filled-box");
    currentGuess.push(pressedKey);
    nextLetter += 1;
}

function deleteLetter () {
    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
    let box = row.children[nextLetter - 1];
    box.textContent = "";
    box.classList.remove("filled-box");
    currentGuess.pop();
    nextLetter -= 1;
}

function checkGuess () {
    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]
    let guessString = '';
    let rightGuess = Array.from(rightGuessString);

    for (const val of currentGuess) {
        guessString += val;
    }

    if (guessString.length != 5) {
        toastr.error("Not enough letters!");
        return;
    }

    if(allWords){ //Dictionary is on
        if (!justWords.includes(guessString) && !WORDS.includes(guessString)) {
            toastr.error("Word not in list!");
            return;
        }
    } else{   
        if(!justWords.includes(guessString)){ //nothing is on
            console.log("No modes are on");
            toastr.error("Word not in list!");
            return;
        }
    }
    
    for (let i = 0; i < 5; i++) {
        let letterColor = '';
        let box = row.children[i];
        let letter = currentGuess[i];
        
        let letterPosition = rightGuess.indexOf(currentGuess[i]);
        // is letter in the correct guess
        if (letterPosition === -1) {
            letterColor = 'grey';
        } else {
            // now, letter is definitely in word
            // if letter index and right guess index are the same
            // letter is in the right position 
            if (currentGuess[i] === rightGuess[i]) {
                // shade green 
                letterColor = 'green';
            } else {
                // shade box yellow
                letterColor = '#d9b502';
            }

            rightGuess[letterPosition] = "#";
        }

        let delay = 250 * i;
        setTimeout(()=> {
            //flip box
            animateCSS(box, 'flipInX');
            //shade box
            box.style.backgroundColor = letterColor;
            shadeKeyBoard(letter, letterColor);
        }, delay)
    }

    if (guessString === rightGuessString) {
        toastr.success("You guessed right! Game over!")
        guessesRemaining = 0
        return
    } else {
        guessesRemaining -= 1;
        currentGuess = [];
        nextLetter = 0;

        if (guessesRemaining === 0) {
            toastr.error("You've run out of guesses! Game over!")
            toastr.info(`The right word was: "${rightGuessString}"`)
        }
    }
}

function shadeKeyBoard(letter, color) {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.textContent === letter) {
            let oldColor = elem.style.backgroundColor
            if (oldColor === 'green') {
                return
            } 

            if (oldColor === '#d9b502' && color !== 'green') {
                return
            }

            elem.style.backgroundColor = color
            break
        }
    }
}

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
    const target = e.target
    
    if (!target.classList.contains("keyboard-button")) {
        return
    }
    let key = target.textContent

    if (key === "Del") {
        key = "Backspace"
    } 

    document.dispatchEvent(new KeyboardEvent("keyup", {'key': key}))
})

$('#hardModeButton').click(function() {
    if(this.checked){
        hardMode = true;
    } else {
        hardMode = false;
    }

});

$('#dictionaryButton').click(function() {
    console.log(allWords);
    if(this.checked){
        allWords = true;
    } else {
        allWords = false;
    }
});

$('#settings').click(function() {

    $('#myNav').css('height', '100%');

});


// function openNav() {
//     document.getElementById("myNav")
// }
  
//   /* Close */
// function closeNav() {
//     document.getElementById("myNav").style.height = "0%";
// } 

const animateCSS = (element, animation, prefix = 'animate__') =>
  // We create a Promise and return it
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    // const node = document.querySelector(element);
    const node = element
    node.style.setProperty('--animate-duration', '0.3s');
    
    node.classList.add(`${prefix}animated`, animationName);

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve('Animation ended');
    }

    node.addEventListener('animationend', handleAnimationEnd, {once: true});
});
