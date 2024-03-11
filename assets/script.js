/*
 * VARIABLES
 */

// Varibles de tiempo
var time= new Date();
var deltaTime= 0;

// Variables de fondo
var fondo;
var fondoY = 77;
var fondoX = 50;
var duracionFondo = 18000;
var fondoDia = true;
var gameVelFondo = 0.2;

// Variables de suelo
var suelo;
var sueloY = 75;
var sueloX = 50;
var gameVelSuelo = 1 ;

// Variables de Messi
var messi;
var messiPosX = 140;
var messiPosY = 77;
var saltando = false;

// Variables de juego
var contenedor;
var textoScore;
var score = 0;
var mejorPuntuacion = 0;
var gameOver = false;
var impulso = 900;
var gravedad = 2500;
var velY = 0;

// Variables de obstáculos
var tiempoHastaObstaculo = 2; 
var tiempoMinHastaObstaculo = 0.8;
var tiempoMaxHastaObstaculo = 2  ;
var obstaculoPosY = 50;
var obstaculos = [];

// Variables de meta
var meta;

// Musica maestro


setTimeout(cambiarFondo, duracionFondo);
var musicaFondo = new Audio('./assets/audio/muchachos.mp3');
musicaFondo.loop = true;
var bobo = new Audio('./assets/audio/bobo.mp3');
bobo.loop = false;


function startGame(nivel) {
    gameVelFondo = 0.2;
    gameVelSuelo = 1;
    score = 0;
    musicaFondo.play();

    document.getElementById("menu").style.display = "none";
    
    switch (nivel) {
        case 0: // MODO Libre
            velEscenario = 1375 / 4;
            meta = Number.MAX_VALUE;
            break;
        case 1: // Nivel 1
            velEscenario = 1375 / 4; 
            meta = 20;
            break;
        case 2: // Nivel 2
            velEscenario = 1375 / 3; 
            meta = 30;
            break;
        case 3: // Nivel 3
            velEscenario = 1375 /2; 
            meta = 30;
            break;
        case 4: // Nivel 4
            velEscenario = 1375; 
            meta = 20;
            break;
        case 5: // Nivel 5
            velEscenario = 1375 * 1.5; 
            meta = 10;
            break;
    }

    if(!gameOver){ // Primera vez que jugamos
        Init();
    }
    else{
        gameOver = false;
        reiniciarJuego();
    }
}

function reiniciarJuego() {
    messi.classList.remove("messi-pecho-frio");
    messi.classList.add("messi-corriendo");

    textoScore.innerText = score;
    messiPosY = 77;
    messi.style.bottom = messiPosY + "px";

    for (var i = 0; i < obstaculos.length; i++) {
        obstaculos[i].parentNode.removeChild(obstaculos[i]);
    }

    obstaculos = [];

    tiempoHastaObstaculo = 2.25;
    fondoX = 50;
    sueloX = 50;

    Loop();
}

function Init() {
    fondo = document.querySelector(".fondo");
    contenedor = document.querySelector(".contenedor");
    textoScore = document.querySelector(".score");
    suelo = document.querySelector(".suelo");
    messi = document.querySelector(".messi");
    messi.classList.add("messi-corriendo");
    document.addEventListener("keydown", HandleKeyDown); // Eveto de salto
    Loop();
}

function cambiarFondo() {
    if(!fondoDia){
        fondo.classList.remove("fondo-night");
        fondo.classList.add("fondo-day");
        fondoDia = true;
    }
    else{
        fondo.classList.remove("fondo-day");
        fondo.classList.add("fondo-night");
        fondoDia = false;
    }
    setTimeout(cambiarFondo, duracionFondo); // Repetimos proceso
}

function HandleKeyDown(ev){
    if(ev.keyCode == 32){
        ev.preventDefault(); // Evitar scroll
        saltar();
    }
}

function Loop(){
    deltaTime = (new Date() - time)/1000;
    time = new Date();
    update();
    requestAnimationFrame(Loop); // Repetimos proceso
}

function update(){
    moverFondo();
    moverSuelo();
    moverMessi();
    decidirObstaculo();
    MoverObstaculos();
    DetectarColision();

    if(score == meta){
        detenerFondo();
        messi.classList.remove("messi-corriendo");
        guardarPuntuacion(score);
        mostrarMejorPuntuacion();
        gameOver = true;
    }

    velY -= gravedad * deltaTime;
}

function moverFondo(){
    fondoX += velEscenario * deltaTime * gameVelFondo * 2;
    fondo.style.left = -(fondoX % contenedor.clientWidth) + "px";
}

function moverSuelo(){
    sueloX += velEscenario * deltaTime * gameVelSuelo * 2;
    suelo.style.left = -(sueloX % contenedor.clientWidth) + "px";
}

function saltar(){
    if(messiPosY == sueloY){
        saltando = true;
        velY = impulso; 
        messi.classList.remove("messi-corriendo");
        messi.classList.add("messi-saltando");
    }
}

function moverMessi(){
    messiPosY += (velY * deltaTime);
    if(messiPosY < sueloY){
        messiPosY = sueloY;
        velY = 0;
        if(saltando){
            messi.classList.remove("messi-saltando");
            messi.classList.add("messi-corriendo");
        }
        saltando = false;
    }
    messi.style.bottom = messiPosY+"px";
}

function decidirObstaculo(){
    tiempoHastaObstaculo -= deltaTime;
    if(tiempoHastaObstaculo <= 0){
        CrearObstaculo();
        tiempoHastaObstaculo = tiempoMinHastaObstaculo + Math.random() * (tiempoMaxHastaObstaculo - tiempoMinHastaObstaculo) / gameVelSuelo;
    }
}

function CrearObstaculo() {
    var obstaculo = document.createElement("div");
    contenedor.appendChild(obstaculo);
    obstaculo.classList.add("obstaculo");
    if(Math.random() > 0.5) obstaculo.classList.add("obstaculo2");
    obstaculo.posX = contenedor.clientWidth;
    obstaculo.style.left = contenedor.clientWidth + "px";
    obstaculos.push(obstaculo);
}

function MoverObstaculos() {
    for (var i = obstaculos.length - 1; i >= 0; i--) {
        if(obstaculos[i].posX < -obstaculos[i].clientWidth) {
            obstaculos[i].parentNode.removeChild(obstaculos[i]);
            obstaculos.splice(i, 1);
            GanarPuntos();
        }else{
            obstaculos[i].posX -= velEscenario * deltaTime * gameVelSuelo * 2;
            obstaculos[i].style.left = obstaculos[i].posX+"px";
        }
    }
}

function GanarPuntos() {
    score++;
    textoScore.innerText = score;
    if(score == 5){
        gameVelSuelo = 1.25;
    }else if(score == 10) {
        gameVelSuelo = 1.75;
    } else if(score == 20) {
        gameVelSuelo = 2.5;
    }else if(score >= 30) {
        gameVelSuelo = 3.5;
    }
    suelo.style.animationDuration = (3/gameVelSuelo)+"s";
}

function GameOver() {
    messi.classList.remove("messi-corriendo");
    messi.classList.add("messi-pecho-frio");
    guardarPuntuacion(score);
    mostrarMejorPuntuacion();
    detenerFondo();
    musicaFondo.pause();
    if(!gameOver)
        bobo.play();
    gameOver = true;    
}


function guardarPuntuacion(score) {
    if (score > mejorPuntuacion) {
        mejorPuntuacion = score;
    }
}

function mostrarMejorPuntuacion() {
    var mejorPuntuacionHTML = `<p>Mejor puntuación: ${mejorPuntuacion}</p>`;
    document.getElementById("mejorPuntuacion").innerHTML = mejorPuntuacionHTML;
}

function detenerFondo() {
    gameVelFondo = 0;
    gameVelSuelo = 0;
    document.getElementById("menu").style.display = "block";
}

function DetectarColision() {
    for (var i = 0; i < obstaculos.length; i++) {
        if(obstaculos[i].posX > messiPosX + messi.clientWidth) {
            break; 
        }
        else{
            if(IsCollision(messi, obstaculos[i], 10, 30, 15, 20)) {
                GameOver();
            }
        }
    }
}

function IsCollision(a, b, paddingTop, paddingRight, paddingBottom, paddingLeft) {
    var aRect = a.getBoundingClientRect();
    var bRect = b.getBoundingClientRect();

    var aBottom = aRect.top + aRect.height - paddingBottom;
    var bTop = bRect.top;
    var aTop = aRect.top + paddingTop;
    var bBottom = bRect.top + bRect.height;
    var aRight = aRect.left + aRect.width - paddingRight;
    var bLeft = bRect.left;
    var aLeft = aRect.left + paddingLeft;
    var bRight = bRect.left + bRect.width;

    return !((aBottom < bTop) || (aTop > bBottom) || (aRight < bLeft) || (aLeft > bRight));
}