const buttons = document.querySelectorAll('.btn-choice');
const result = document.getElementById('result');
const playerScoreText = document.getElementById('playerScore');
const metaScoreText = document.getElementById('metaScore');
const timerBar = document.getElementById('timerBar');
const finalwinnerText = document.getElementById('finalwinnerText');
const roundText = document.getElementById('roundText');
const welcomeText = document.getElementById('welcomeText');
const changePlayerBtn = document.getElementById('changePlayer');
const winnerPopup = document.getElementById ('winnerPopup');
const restartBtn = document.getElementById("restart");
const leaderboardList = document.getElementById("leaderboardList");
const resetLearderboardBtn = document.getElementById("resetLearderboard");


// load scores from local storage

let playerScore = parseInt(localStorage.getItem("playerScore")) || 0;
let metaScore = parseInt(localStorage.getItem("metaScore")) || 0;
let playerName = localStorage.getItem('playerName') || promptForName();
let round = parseInt(localStorage.getItem("round")) || 1;

// sound effect

const winSound = new Audio("./winner-game-sound-404167.mp3");
const loseSound = new Audio("./lose-sfx-365579.mp3");
const drawSound = new Audio("./draw-sword1-44724.mp3");
const rockSound = new Audio("./rock-destroy-6409.mp3");
const paperSound = new Audio("./paper-rip-twice-252619.mp3");
const scissorsSound = new Audio("./scissors-95762.mp3");

// confetti setup

const confettiCanvas = document.getElementById("confettiCanvas");

const ctx = confettiCanvas.getContext("2d");
confettiCanvas.width = window.innerWidth;
confettiCanvas.height = window.innerHeight;

function launchConfetti() {

    confettiCanvas.style.animation = "none";
    void confettiCanvas.offsetWidth;


    let confettiPieces = 
    Array.from({length:150}).map(()=> ({
        x:Math.random() * confettiCanvas.width,
        y:Math.random() * confettiCanvas.height - confettiCanvas.height,
      size: Math.random()* 8 + 2,
      color: `hsl (${Math.random() * 360}, 100%, 60%)`,
      speed: Math.random() * 3 + 2,
    }));    function draw() {
        ctx.clearRect(0,0, confettiCanvas.width, confettiCanvas.height);
        confettiPieces.forEach((p) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0,2 * Math.PI);
            ctx.fillStyle = p.color;
            ctx.fill();
            p.y += p.speed;

            if(p.y > confettiCanvas.height) p.y = 0 - p.size
        });

        requestAnimationFrame(draw);
    }

    draw();
    setTimeout(
        ()=> (confettiCanvas.style.animation = "fadeOut 2s forwards"),
        3000
    );


    updateDisplay();
    updateLeaderboard();
}



buttons.forEach(button => {
    button.addEventListener('click',() => {
        if(round > 5) return;
        const playerChoice = button.dataset.choice;
        const metaChoice = getMetaChoice();
        playerChoiceSound(playerChoice);
        playerRound(playerChoice,metaChoice);
    });

});

// resetBtn.addEventListener("click",resetTournament);
// changePlayerBtn

changePlayerBtn.addEventListener('click',changePlayer);
// restartBtn.addEventListener("click", resetTournament);
resetLearderboardBtn.addEventListener("click",resetLearderboard);


function promptForName() {
    let name = prompt('🙋‍♂️ What is Your name,challenger?');
    if (!name) name = "Player";
    localStorage.setItem("playerName", name);
    return name;
}

 function updateDisplay() {
    welcomeText.textContent = `Welcome,${playerName}!`
    welcomeText.style.textTransform = "capitalize";
    playerScoreText.textContent = playerScore;
    metaScoreText.textContent = metaScore;
    roundText.textContent = `Round: ${round} of 5`;
    roundText.style.textTransform = "capitalize";
 }

function getMetaChoice () {
    const choices = ["rock", "paper", "scissors"];
    return choices[Math.floor(Math.random()*3)];
}

function playerChoiceSound(choice) {
    switch (choice) {
        case "rock":
            rockSound.currentTime = 0;
            rockSound.play();
            break;
        case "paper":
            paperSound.currentTime = 0;
            paperSound.play();
            break;
        case "scissors":
            scissorsSound.currentTime = 0;
            scissorsSound.play();
            break;
    }
}

function playerRound(player,meta) {
    animateTimer();
    let message = "";
    

    if( player === meta) {
        message = `🤝 it's a draw! You both chose ${player}`
        playerScore++;
        metaScore++;
        drawSound.play();
    } else if (
        (player === 'rock' && meta === 'scissors') ||
        (player === 'paper' && meta === 'rock') ||
        (player === 'scissors' && meta === 'paper' )
    ){
        message = `🎉 You win ${player} beats ${meta}`;
        playerScore++;
        winSound.play();
    } else {
        message = `💀you loose! ${meta} beats ${player}`;
        metaScore++;
        loseSound.play();
    }
    result.classList.remove("fade-in");
    void result.offsetWidth; 
    result.classList.add("fade-in");

    result.textContent = message;
    playerScoreText.textContent = playerScore;
    // playerScore.style.color = #dff0fbff;
    metaScoreText.textContent = metaScore;

    
    
    if (round >= 5) {
        showWinner();
    } else roundText.textContent = `Round: ${round} of 5`
    
    round++
    saveScores();
    updateLeaderboard();
}

function showWinner () {
    let winnerText = "";
    // winnerText.style.textTransform = "capitalize"

    if (playerScore > metaScore) {
        winnerText = `🥇Congrats ${playerName}! You won the Tournament!`;
        launchConfetti();
        saveToLearderboard(playerName, playerScore);
    } else if (metaScore > playerScore) {
        winnerText = `🤖 meta wins this time,${playerName}!`;
        launchConfetti();
        saveToLearderboard("meta", metaScore);
    } else {
        winnerText = `🤝its a Draw tournament, ${playerName}`;
        launchConfetti();
        saveToLearderboard(playerName, playerScore);
        saveToLearderboard("meta", metaScore);
    }

    finalwinnerText.textContent = winnerText;

// make popup visible before animation


    winnerPopup.style.display = "flex";
    winnerPopup.style.opacity = "1";

// restart animation properly

    winnerPopup.classList.remove("slide-in", "bounce-in");
    void winnerPopup.offsetWidth;
    winnerPopup.classList.add("slide-in");


    setTimeout(()=>{
        winnerPopup.classList.remove("slide-in");
        void winnerPopup.offsetWidth;
        winnerPopup.classList.add("bounce-in");
    },500);
    updateLeaderboard()
}

function animateTimer(){
    timerBar.style.width = "100%";
    timerBar.classList.remove("bg-danger");
    let width = 100;
    const interval = setInterval(()=>{
        if(width<=0) {
            clearInterval(interval);
            timerBar.classList.add("bg-danger");
        } else {
            width -= 5;
            timerBar.style.width = width + "%";
        }
    },100);
}

function saveScores(){
    localStorage.setItem("playerScore", playerScore);
    localStorage.setItem("metaScore", metaScore);
    localStorage.setItem("playerName", playerName);
    localStorage.setItem("round", round);
}

// restart


// function resetTournament () {
//     localStorage.removeItem("playerScore");
//     localStorage.removeItem("metaScore");
//     localStorage.removeItem("round");

//     playerScore = 0;
//     metaScore = 0;
//     round = 1;
//}
restartBtn.addEventListener("click", ()=> {
    localStorage.removeItem("playerScore",playerScore);
    localStorage.removeItem("round",round);
    localStorage.removeItem("metaScore",metaScore);


    playerScore = 0;
    metaScore = 0; 
    round = 1;
    winnerPopup.style.display ='none'
    updateDisplay();

    document.getElementById("playerScore").textContent = playerScore;
    document.getElementById("metaScore").textContent = metaScore;
    document.getElementById("result").textContent = "Game restarted!";
    roundText.textContent = `Round ${round} of 5`

})

function changePlayer() {
    localStorage.clear();
    playerName = promptForName();
    playerScore = 0;
    metaScore = 0 ;
    round = 1 ;
    winnerPopup.style.display = 'none';
    updateDisplay();
    result.textContent = `New challenger: ${playerName}! Let's start all over🔥`
}

function saveToLearderboard(name, score) {
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboard.push({name,score});
    localStorage.setItem("leaderboard",JSON.stringify(leaderboard));
    updateLeaderboard();
}

function updateLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboardList.innerHTML = "";


    leaderboard
    .sort((a,b) => b.score - a.score)
    .slice(0, 5)
    .forEach((entry, index) =>{
        const li = document.createElement ("li");
        li.className = "list-group-item bg-transparent text-white border-0";
        li.textContent =`${index + 1}. ${entry.name} - ${entry.score} pts`;
        leaderboardList.appendChild(li);
    });
}

function resetLearderboard() {
    if (confirm("Are you sure you want to reset the leaderboard? This cannot be undone.")) {
        localStorage.removeItem("leaderboard");
        updateLeaderboard();
    }
}

// function resetTournament() {
//     localStorage.removeItem("playerScore");
//     localStorage.removeItem("metaScore");
//     localStorage.removeItem("round");
//     playerScore = 0;
//     metaScore = 0;
//     round = 1;

//     winnerPopup.style.display
// }