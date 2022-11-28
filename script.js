import { GUESSES } from "./WordLists/guesses.js";
import { WORDS } from "./WordLists/dictionary.js";
import { HARDWORDS } from "./WordLists/hardWords.js";

const NUMBER_OF_GUESSES = 6;
let hardMode = document.getElementById('hardModeButton').checked;
let allWords = document.getElementById('dictionaryButton').checked;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let rightGuessString = "";
let rightGuessWiki = "";
let rand = 0;
let justWords;

function getWord() {

    if (hardMode) {
        rand = Math.floor(Math.random() * HARDWORDS.length);
        rightGuessString = HARDWORDS[rand][0];
        rightGuessWiki = HARDWORDS[rand][1];
        justWords = toOneD(HARDWORDS);
    } else {
        rand = Math.floor(Math.random() * GUESSES.length);
        rightGuessString = GUESSES[rand][0];
        rightGuessWiki = GUESSES[rand][1];
        justWords = toOneD(GUESSES);
    }

}

function reset() {
    guessesRemaining = NUMBER_OF_GUESSES;
    currentGuess = [];
    nextLetter = 0;
    $("#game-board").html(null);
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        elem.style.backgroundColor = "";
    }
    initBoard();
}

//Removes the wiki links from the array
function toOneD(twoD) {
    let oneD = new Array(twoD.length);

    for (let i = 0; i < twoD.length; i++) {
        oneD[i] = twoD[i][0];
    }

    return oneD;
}

function initBoard() {
    $('#playAgainButton').hide();

    let board = document.getElementById("game-board");

    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        let row = document.createElement("div");
        row.className = "letter-row";

        for (let j = 0; j < 5; j++) {
            let box = document.createElement("div");
            box.className = "letter-box";
            row.appendChild(box);
        }

        board.appendChild(row);
    }
	getWord();
}

initBoard();

document.addEventListener("keyup", (e) => {

    if (guessesRemaining === 0) {
        return;
    }

    inputLetter(String(e.key));

})

function inputLetter(pressedKey){
    console.log(pressedKey); 

    if ((pressedKey === "Backspace" || pressedKey === "Del") && nextLetter !== 0) {
        deleteLetter();
        return;
    }

    if (pressedKey === "Enter") {
        checkGuess();
        return;
    }

    pressedKey = pressedKey.toLowerCase();
    
    if (pressedKey.length === 1 && pressedKey.charCodeAt() >= 97 && pressedKey.charCodeAt() <= 122) {
        insertLetter(pressedKey);
    }

}

function insertLetter(pressedKey) {
    if (nextLetter === 5) {
        return;
    }

    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
    let box = row.children[nextLetter];
    animateCSS(box, "pulse");
    box.textContent = pressedKey;
    box.classList.add("filled-box");
    currentGuess.push(pressedKey);
    nextLetter += 1;
}

function deleteLetter() {
    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
    let box = row.children[nextLetter - 1];
    box.textContent = "";
    box.classList.remove("filled-box");
    currentGuess.pop();
    nextLetter -= 1;
}

function checkGuess() {
    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
    let guessString = '';
    let rightGuess = Array.from(rightGuessString);

    for (const val of currentGuess) {
        guessString += val;
    }

    if (guessString.length != 5) {
        toastr.error("Not enough letters!");
        return;
    }

    if (allWords) { //Dictionary is on
        if (!justWords.includes(guessString) && !WORDS.includes(guessString)) {
            toastr.error("Word not in list!");
            return;
        }
    } else {
        if (!justWords.includes(guessString)) { //nothing is on
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
        setTimeout(() => {
            //flip box
            animateCSS(box, 'flipInX');
            //shade box
            box.style.backgroundColor = letterColor;
            shadeKeyBoard(letter, letterColor);
        }, delay)
    }

    if (guessString === rightGuessString) {
	    
	$("#wiki-link a").attr("href", rightGuessWiki);
   	$("#wiki-link a").text("Your word was: " + rightGuessString);

        $('#settingsModal').modal('hide');
        setTimeout(function() {
            $('#endScreenModal').modal('show');
            $('#playAgainButton').show();
        }, 1500);
        guessesRemaining = 0;
        return;
    } else {
	$("#wiki-link a").attr("href", rightGuessWiki);
   	$("#wiki-link a").text("Your word was: " + rightGuessString);
        guessesRemaining -= 1;
        currentGuess = [];
        nextLetter = 0;

        if (guessesRemaining === 0) {
            $('#settingsModal').modal('hide');
            setTimeout(function() {
                $('#lossScreenModal').modal('show');
                $('#playAgainButton').show();
            }, 1500);
        }
    }
}

function shadeKeyBoard(letter, color) {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.textContent === letter) {
            let oldColor = elem.style.backgroundColor;
            if (oldColor === 'green') {
                return;
            }

            if (oldColor === '#d9b502' && color !== 'green') {
                return;
            }

            elem.style.backgroundColor = color;
            break;
        }
    }
}

$('#hardModeButton').click(function() {
    if (this.checked) {
        hardMode = true;
    } else {
        hardMode = false;
    }

});

$('#dictionaryButton').click(function() {
    if (this.checked) {
        allWords = true;
    } else {
        allWords = false;
    }
});

$('#newWordButton').click(function() {
    $('#endScreenModal').modal('hide');
    reset();
});

$('#tryAgainButton').click(function() {
    $('#lossScreenModal').modal('hide');
    reset();
});

$('#playAgainButton').click(function() {
    $('#playAgainButton').hide();
    reset();
});
         
$('.keyboard-button').click(function(){
    
    if (guessesRemaining === 0) {
        return;
    }
    
    inputLetter(String($(this).text()));
    
});

document.querySelectorAll("button").forEach( function(item) {
    item.addEventListener('focus', function() {
        this.blur();
    })
})

const animateCSS = (element, animation, prefix = 'animate__') =>
    // We create a Promise and return it
    new Promise((resolve, reject) => {
        const animationName = `${prefix}${animation}`;
        // const node = document.querySelector(element);
        const node = element;
        node.style.setProperty('--animate-duration', '0.3s');

        node.classList.add(`${prefix}animated`, animationName);

        // When the animation ends, we clean the classes and resolve the Promise
        function handleAnimationEnd(event) {
            event.stopPropagation();
            node.classList.remove(`${prefix}animated`, animationName);
            resolve('Animation ended');
        }

        node.addEventListener('animationend', handleAnimationEnd, {
            once: true
        });
    });
