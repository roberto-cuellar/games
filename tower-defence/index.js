// Canvas selection and configuration 
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
const scoreEl = document.querySelector('#score')
const gameOverContainer = document.querySelector('#game-over-container');

// Audios
const audioShootPlayer = new Audio("retro_shoot.mp3");
const audioimpactInvader = new Audio("impact.mp3");
const audioImpactPlayer = new Audio("explosion.mp3");
const audioBomb = new Audio("bomb.mp3");
const audioDoom = new Audio("doom.mp3");
audioShootPlayer.volume = 0.1;
audioimpactInvader.volume = 0.1;
audioImpactPlayer.volume = 0.1;
audioBomb.volume = 0.1;
audioDoom.volume = 0.1;
audioDoom.play();

canvas.width =  window.innerWidth;
canvas.height = window.innerHeight;

class Player{
    constructor(){
        this.position = {
            x: canvas.width/2,
            y: canvas.height/2,
        };
        this.radius = 10;
        this.color = 'red';
    }

    draw(){
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius,0, Math.PI * 2);
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
    }
}

// Initial positions for projectiles
const initialPositionProjectiles = {
    x: canvas.width/2,
    y: canvas.height/2,
}

class Projectile{
    constructor({velocity}){
        this.position = {
            x: initialPositionProjectiles.x,
            y: initialPositionProjectiles.y,
        };
        this.velocity = velocity;
        this.velocityFactor = 15;
        this.radius = 7;
    }

    draw(){
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius,0, Math.PI * 2);
        c.fillStyle = 'yellow';
        c.fill();
        c.closePath();
    }

    update(){
        this.draw();
        this.position.x += this.velocity.x*this.velocityFactor*timeScale;
        this.position.y += this.velocity.y*this.velocityFactor*timeScale;
    }
}

class Enemy{
    constructor(){
        this.randomZeroOrOne = Math.floor(Math.random() * 4);

        switch (this.randomZeroOrOne) {
            case 0: // LeftSide
                this.position = {
                    x: 0,
                    y: Math.floor(Math.random() * canvas.height),
                };
                break;
            case 1: // TopSide
                this.position = {
                    x: Math.floor(Math.random() * canvas.width),
                    y: 0,
                };
            case 2: // RightSide
                this.position = {
                    x: canvas.width,
                    y: Math.floor(Math.random() * canvas.height),
                };
                break;
            case 3: // DownSide
                this.position = {
                    x: Math.floor(Math.random() * canvas.width),
                    y: canvas.height,
                };
                break;
        
            default:
                break;
        }

        this.distanceToPlayer = distanceBeetwen(player,this);

        const unitDirections = calcUnitDirection(initialPositionProjectiles.x,initialPositionProjectiles.y,this.position.x,this.position.y);
        this.velocity = {
            x: unitDirections.x_unit,
            y: unitDirections.y_unit
        }
        this.radius = Math.floor(Math.random() * 20) + 10;
        this.velocityFactor = 15/this.radius;
    }

    draw(){
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius,0, Math.PI * 2);
        c.fillStyle = 'white';
        c.fill();
        c.closePath();
    }

    update(){
        this.draw();
        this.position.x += this.velocity.x*this.velocityFactor*timeScale;
        this.position.y += this.velocity.y*this.velocityFactor*timeScale;
        this.distanceToPlayer = distanceBeetwen(player,this);
    }

    shoot(){
        this.radius -=2;
        if(this.radius<=2){
            this.radius = 0;
        }
        this.draw();
    }


}

class Particle {
    constructor({ position, velocity, radius, color, fades }) {
      this.position = position;
      this.velocity = velocity;
      this.radius = radius;
      this.color = color;
      this.opacity = 1;
      this.fade = fades
    }
  
    draw() {
      c.save();
      c.globalAlpha = this.opacity
      c.beginPath();
      c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
      c.fillStyle = this.color;
      c.fill();
      c.closePath();
      c.restore();
    }
  
    update() {
      this.draw();
      this.position.x += this.velocity.x*timeScale;
      this.position.y += this.velocity.y*timeScale;
      if(!  this.fade){
        this.opacity -= 0.01;
      }
    }
}


function createParticles(object,color){
    for(let i= 0; i<15; i++){
      particles.push(new Particle({
        position: {
          x: object.position.x ,
          y: object.position.y
        },
        velocity:{
          x: (Math.random()-0.5)*2,
          y: (Math.random()-0.5)*2   
        },
        radius: Math.random()*object.radius/3,
        color:  color
      }))
    }
}

// Initial game configurations 
let projectiles = [];
let enemies = [];
let frames = 0;
const player = new Player();
let game = {
    over: false,
    active: true
  }
let particles = [];
let score = 0;
let timeScale = 1;
  
// Amo options container
const amoOptionsEl = document.getElementById("amo-options");
let amoSelection = 'tiroTiro';
let rafagueActive = false;
let bombActive = false;
let metraActive = false;
let mousePosition = { x: 0, y: 0 };



// Animation loop 
function animate() {

    if(!game.active) return
    requestAnimationFrame(animate);
    c.fillStyle = "black";
    c.fillStyle = 'rgba(0, 0, 0, .1)';
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();

    // draw particles
    particles.forEach((particle,particleIndex)=>{
        if(particle.opacity <= 0){
            setTimeout(() => {
              particles.slice(particleIndex,1)
            }, 0);
          }else{
            particle.update();
          }
    })

    // Draw projectiles
    projectiles.forEach((projectile, projectileIndex) => {

        // Bounds constrains   left, top, right, bottom and gardbage collector
        if (projectile.position.x + projectile.radius <= 0 || // Left
            projectile.position.y + projectile.radius <= 0 || // top
            projectile.position.x + projectile.radius >= canvas.width || // right
            projectile.position.y + projectile.radius >= canvas.height // bottom
            ) {
            setTimeout(() => {
                projectiles.splice(projectileIndex, 1);
              }, 0);
            }else{
            projectile.update();
            // Collision detection with enemies
            enemies.forEach((enemyItem2, enemyIndex2) => {
                const colission = calcColition(enemyItem2.position.x,enemyItem2.position.y,enemyItem2.radius,projectile.position.x,projectile.position.y,projectile.radius);
                if(colission){
                    setTimeout(() => {
                        enemyItem2.shoot();   
                        projectiles.splice(projectileIndex, 1);
                        createParticles(enemyItem2,'white');
                        score += 100;
                        scoreEl.innerHTML = score;    
                        if (audioimpactInvader.paused) {
                            audioimpactInvader.play();
                          } else {
                            audioimpactInvader.currentTime = 0;
                          }            
                    }, 0);
                }
            })
        }

        



    });

    // Draw enemies
    enemies.forEach((enemyItem, enemyIndex) => {
        // Verify the radius to delete the collision
        if(enemyItem.radius<=0){
            setTimeout(() => {
                enemies.splice(enemyIndex, 1);
            }, 0);
        }else{
            // Colission detection
            const colission = calcColition(player.position.x,player.position.y,player.radius,enemyItem.position.x,enemyItem.position.y,enemyItem.radius);
            if(colission){
                game.active = false;
                gameOverContainer.style.visibility = 'visible';
                if (audioImpactPlayer.paused) {
                    audioImpactPlayer.play();
                  } else {
                    audioImpactPlayer.currentTime = 0;
                  } 
            }else{
                enemyItem.update()
            }
        }

    });
    
    if(amoSelection === 'laser'){
        c.save();
        // Configura el estilo de la línea y el efecto de resplandor
        c.strokeStyle = 'white';  // Color de la línea
        c.lineWidth = 2;          // Grosor de la línea
        c.shadowColor = 'blue';   // Color del resplandor
        c.shadowBlur = 10;        // Cantidad de resplandor

        // Dibuja la línea desde el centro del canvas hasta la posición del ratón
        c.beginPath();
        c.moveTo(canvas.width / 2, canvas.height / 2);
        c.lineTo(mousePosition.x, mousePosition.y);
        c.stroke();
        c.restore();
    }


    if(frames % 100 === 0){
        enemies.push(
            new Enemy()
        )
        frames = 0;
    }
    frames++;
}
animate();



// Watch for key down to activate shot by shot, rafaga, metra
window.addEventListener('keydown', function(e) {
    let radioInput;

    switch (e.key) {
        case 'r':
            radioInput = document.querySelector('#rafaga');
            amoSelection = 'rafaga';
            break;
        case 'm':
            radioInput = document.querySelector('#metra');
            amoSelection = 'metra';
            break;
        case 't':
            radioInput = document.querySelector('#tiroTiro');
            amoSelection = 'tiroTiro';
            break;
        case 'b':
            bombAction();
            break;

        case 'l':
            radioInput = document.querySelector('#laser');
            amoSelection = 'laser';
            break;

        default:
            return; // Salir si no es una de las teclas que nos interesan
    }

    // Marcar el radio input como checked
    if (radioInput) radioInput.checked = true;
});


// Watch for mouse position
window.addEventListener('mousemove', function(e) {
    mousePosition.x = e.clientX;
    mousePosition.y = e.clientY;
    if(amoSelection === 'laser'){
        console.log('Laser active');
    }
});



// Event delegation pattern for clicks
window.addEventListener('click', (event)=>{    
    
    // Amo selection options
    const target = event.target;
    if (target.tagName === "INPUT" && target.parentNode === amoOptionsEl) {
        amoSelection = target.value;
        return
    }

    // Ignore shoots in buttons
    if (target.tagName === "BUTTON") {
        return
    }    
    
    // Validating the active state of the game
    if(!game.active) return


    // Calculation of the projectile directions
    const unitDirections = calcUnitDirection(event.clientX,event.clientY,initialPositionProjectiles.x,initialPositionProjectiles.y);

    // Actions based on amo selection ----
    // Rafague and shot by shot its allowed in click event

    if(amoSelection === 'tiroTiro'){
        playerShot(unitDirections,event);
    }


    // Only allows to shot when the rafague is not active
    if(amoSelection === 'rafaga'){ 
        if(rafagueActive) return
        rafagueActive = true;           
        async function rafageShot() {
            for (let i = 1; i <= 3; i++) {
                playerShot(unitDirections,event)
                await delay(100);
            }
            rafagueActive = false;
        }
        rafageShot()
    }
})


// Sort in terms of distanceToPlayer, and delete the first half of the enemies array
function bombAction() {
    // if(bombActive) return
    timeScale = 0.1;
    radius = 0;
    opacity = 1;
    drawExplosion();
    if (audioBomb.paused) {
        audioBomb.play();
      } else {
        audioBomb.currentTime = 0;
      }
    setTimeout(() => {
        restartTimeScale();
        
    startShake();
        const numElementos = enemies.length;
        const numElementosEliminar = Math.floor(numElementos / 2);
        const enemiesSort  = enemies.sort((a,b)=> a.distanceToPlayer-b.distanceToPlayer)
        for (let i = 0; i < numElementosEliminar ; i++) {
            createParticles(enemiesSort[i],'white')
        }    
        enemiesSort.splice(0, numElementosEliminar);
    }, 1000);
    bombActive = true;
}

async function restartTimeScale(){
    for (let i = 1; i <= 200; i++) {
        timeScale =  Math.sin((i/200)*Math.PI/2)
        await delay(10);
    }
}

let gradient = c.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 0,
    canvas.width / 2, canvas.height / 2, canvas.width / 2
);
gradient.addColorStop(0, 'rgba(255,255,0,1)');  // Color amarillo en el centro
gradient.addColorStop(1, 'rgba(255,0,0,0)');  // Color rojo en los bordes, pero totalmente transparente

let radius = 0;
let opacity = 1;

function drawExplosion() {
    // Dibuja la onda expansiva (en este caso, un círculo que se expande)
    c.beginPath();
    c.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
    c.fillStyle = gradient;
    c.fill();

    // Aumenta el radio para que el círculo se expanda
    radius += 3;

    // Reduce la opacidad con el tiempo
    opacity -= 0.01;
    gradient = c.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    gradient.addColorStop(0, `rgba(255,255,0,${opacity})`);
    gradient.addColorStop(1, 'rgba(255,0,0,0)');

    // Si la explosión no ha terminado, sigue dibujándola
    if (opacity > 0) {
        requestAnimationFrame(drawExplosion);
    }
}


let shakeDuration = 500;  // Duración del temblor en milisegundos
let shakeIntensity = 50;  // Intensidad del temblor (en píxeles)

function startShake() {
    let startTime = Date.now();

    let shakeInterval = setInterval(() => {
        let elapsed = Date.now() - startTime;

        if (elapsed > shakeDuration) {
            clearInterval(shakeInterval);
            c.setTransform(1, 0, 0, 1, 0, 0);  // Restaura la transformación del canvas a la normalidad
        } else {
            let dx = Math.random() * shakeIntensity - shakeIntensity / 2;
            let dy = Math.random() * shakeIntensity - shakeIntensity / 2;
            c.setTransform(1, 0, 0, 1, dx, dy);
        }
    }, 100);  // Actualiza la posición del canvas cada 100ms
}




async function shotMetra(event){
    const unitDirections = calcUnitDirection(mousePosition.x,mousePosition.y,initialPositionProjectiles.x,initialPositionProjectiles.y);
    playerShot(unitDirections,event)
    await delay(100); // Puedes ajustar el tiempo de delay
    if (metraActive) {
        shotMetra(event);
    }
}

// Mouse down para la metra
document.addEventListener('mousedown', function (event) {
    event.preventDefault()
    if(amoSelection === 'metra'){
        metraActive = true;
        shotMetra(event);
    }
});

document.addEventListener('mouseup', function () {
    metraActive = false;
    if(amoSelection === 'metra'){
    }
});

// Delay function 
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function used to shot a single shot
function playerShot(unitDirections,event){
    if (audioShootPlayer.paused) {
        audioShootPlayer.play();
      } else {
        audioShootPlayer.currentTime = 0;
      }
    projectiles.push(
        new Projectile({
            velocity:{
                x: unitDirections.x_unit,
                y: unitDirections.y_unit
            },
            position:{
                x: event.clientX,
                y: event.clientY,
            }
        })
    )
}




/**
 * 
 * @param {Final x coordinate} x 
 * @param {Final y coordinate} y 
 * @param {Initial x coordinate} x_i 
 * @param {Initial y coordinate} y_i 
 * @returns 
 */
function calcUnitDirection(x,y,x_i,y_i) {   
    const subX = (x-x_i)
    const subY = (y-y_i)
    const powX = Math.pow(subX, 2);
    const powY = Math.pow(subY, 2);
    const add = powX + powY;
    const magnitude = Math.pow(add, 0.5);
    const x_unit = subX/magnitude;
    const y_unit = subY/magnitude;
    return {x_unit, y_unit}
}

/**
 * 
 * @param {x coordinate for first object} x1 
 * @param {y coordinate for first object} y1 
 * @param {radius of the first object} r1 
 * @param {x coordinate for second object} x2 
 * @param {y coordinate for second object} y2 
 * @param {radius of the second object} r2 
 * @returns 
 */
function calcColition(x1,y1,r1,x2,y2,r2) {
    const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    return distance <= r1 + r2
}

function distanceBeetwen(object1, object2) {
    const distance = Math.sqrt((object2.position.x - object1.position.x) ** 2 + (object2.position.y - object1.position.y) ** 2);
    return distance
}


function restart() {
    frames = 0;
    game.over = false;
    game.active = true;
    score = 0;
    scoreEl.innerHTML = score
    enemies = []
    projectiles = []
    particles = []  
    gameOverContainer.style.visibility = 'hidden';
    rafagueActive = false;
    metraActive = false;
    bombActive = false;
    const radioInput = document.querySelector('#tiroTiro');
    radioInput.checked = true;
    amoSelection = 'tiroTiro'
    animate()
  }
  