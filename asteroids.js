const canvas = document.querySelector('canvas')
const cxt = canvas.getContext('2d')

canvas.height = window.innerHeight
canvas.width = window.innerWidth 

//player class
class Player {
    constructor({position, velocity}) {
        this.position = position
        this.velocity = velocity
        this.radius = 50
    }

    //funkcija za crtanje igraca - crveni kvadrat
    draw() {
        cxt.fillStyle = 'red'
        cxt.strokeStyle = 'white'
        cxt.lineWidth = 2

        cxt.shadowColor = 'red'
        cxt.shadowBlur = 10

        //ispuna kvadrata
        cxt.fillRect(this.position.x-this.radius/2, this.position.y-this.radius/2, this.radius, this.radius)
        //crtanje obruba kvadrata
        cxt.strokeRect(this.position.x - this.radius / 2, this.position.y - this.radius / 2, this.radius, this.radius);

    }

    //update pozicije igraca
    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

//asteroid class
class Asteroid {
    constructor({position, velocity, radius}) {
        this.position = position
        this.velocity = velocity
        this.radius = radius
    }

    //funkcija za crtanje asteroida - sivi kvadrat
    draw () {
        cxt.fillStyle = 'grey'
        cxt.strokeStyle = 'white'
        cxt.lineWidth = 2

        cxt.shadowColor = 'grey'
        cxt.shadowBlur = 10
        //ispuna kvadrata
        cxt.fillRect(this.position.x-this.radius/2, this.position.y-this.radius/2, this.radius, this.radius)
        //crtanje obruba kvadrata
        cxt.strokeRect(this.position.x - this.radius / 2, this.position.y - this.radius / 2, this.radius, this.radius);

    }

    //update pozicija asteroida
    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

//inicijalizacija igraca
const player = new Player({
    position:{x: canvas.width/2, y:canvas.height/2}, 
    velocity:{x: 0, y: 0}
})

player.update()

//inicijalizacija keys varijabli
const keys = {
    arrowUp: {
        pressed: false
    },
    arrowDown: {
        pressed: false
    },
    arrowLeft: {
        pressed: false
    },
    arrowRight: {
        pressed: false
    }
}

const SPEED_PLAYER = 3
const SPEED_ASTEROID = 5
const asteroids = []

//postaviti timer svakih koliko ce se stvarati novi asteorid
const intervalId = window.setInterval(() => {
    const index = Math.floor(Math.random() * 4)
    let x, y
    let vel_x, vel_y
    this.radius = 200 * Math.random() + 20 //nasumicno odobrana velicina asteroida 20-200
    vel_x = (Math.random() - 0.5) * SPEED_ASTEROID * 2; //nasumicno odabran velocity od -SPEED do SPEED
    vel_y = (Math.random() - 0.5) * SPEED_ASTEROID * 2;

    //gdje ce se asteroid stvoriti:
    switch(index) {
        case 0: //desno
            x = canvas.width + radius/2
            y = Math.random() * canvas.height
            break
        case 1: //lijevo
            x = 0 - radius/2
            y = Math.random() * canvas.height
            break
        case 2: //gore
            x = Math.random() * canvas.width
            y = 0 - radius/2
            break
        case 3: //dolje
            x = Math.random() * canvas.width
            y = canvas.height + radius/2
            break
    }
    //dodaj novi asteroid u listu
    asteroids.push(new Asteroid({
        position: {
            x: x,
            y: y
        }, 
        velocity: {
            x: vel_x,
            y: vel_y
        }, 
        radius : this.radius
    }))
}, 200) // 200 milliseconds

//funkcija za detekciju kolizije asteroida i igraca (2 kvadrata)
function collision(asteroid, player) {

    if(asteroid.position.x +  asteroid.radius/2 + player.radius/2 >= player.position.x &&
        asteroid.position.x <= player.position.x + player.radius/2 + asteroid.radius/2 &&
        asteroid.position.y + asteroid.radius/2 + player.radius/2 >= player.position.y &&
        asteroid.position.y <= player.position.y + player.radius/2 + asteroid.radius/2) {
        console.log('COLLIDED')
        return true
    }

    return false
}

//ukoliko nema najboljeg vremena, inicirati u localStorage-u na 0
const startTime = Date.now()
let bestTime = localStorage.getItem('bestTime') ? parseFloat(localStorage.getItem('bestTime')) : 0;

//funkcija za update i prikaz elemenata igre u beskonacnoj petlji
function animate() {
    const animationId = window.requestAnimationFrame(animate)

    //priprema canvasa za iduci frame
    cxt.fillStyle = 'black'
    cxt.fillRect(0, 0, canvas.width, canvas.height)

    const currentTime = Date.now()
    const elapsedTime = (currentTime - startTime) / 1000 //sekunde

    cxt.fillStyle = 'white'
    cxt.font = '20px Arial'
    //prikaz trenutnog vremena
    cxt.fillText(`Time: ${elapsedTime.toFixed(2)}s`, canvas.width - 200, 30)

    //prikaz najboljeg vremena
    cxt.fillText(`Best Time: ${bestTime.toFixed(2)}s`, canvas.width - 200, 60)


    player.update()

    //upravljanje asteroidima
    for(let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i]
        asteroid.update()

        //kada se sudare asteroid i igrac:
        if (collision(asteroid, player)) {
            console.log('GAME OVER')
            //prestani stvarati novi frame
            window.cancelAnimationFrame(animationId)
            //prestani stvarati nove asteroide
            clearInterval(intervalId)

            //postavi novo najboje vrijeme 
            if(elapsedTime > bestTime) {
                bestTime = elapsedTime
                localStorage.setItem('bestTime', bestTime)
            }
        }

        //garbage collection of asteroids
        if(
            asteroid.position.x + asteroid.radius < 0 ||
            asteroid.position.x - asteroid.radius > canvas.width ||
            asteroid.position.y - asteroid.radius > canvas.height ||
            asteroid.position.y + asteroid.radius < 0
        ) {
            asteroids.splice(i, 1)
        }
    }

    player.velocity.x = 0
    if(keys.arrowRight.pressed) player.velocity.x = 1 * SPEED_PLAYER

    if(keys.arrowLeft.pressed) player.velocity.x = -1 * SPEED_PLAYER

    player.velocity.y = 0
    if(keys.arrowUp.pressed) player.velocity.y = -1 * SPEED_PLAYER

    if(keys.arrowDown.pressed) player.velocity.y = 1 * SPEED_PLAYER
} 

animate()

//funkcija sto raditi kad se pritisne odredena tipka
window.addEventListener('keydown', (event) => {
    //sprijeci defaultno ponasanje arrow keys-a
    switch(event.code) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowRight':
        case 'ArrowLeft':
            event.preventDefault(); 
            break;
    }

    switch(event.code) {
        case 'ArrowUp':
            keys.arrowUp.pressed = true
            break
        case 'ArrowDown':
            keys.arrowDown.pressed = true
            break
        case 'ArrowRight':
            keys.arrowRight.pressed = true
            break
        case 'ArrowLeft':
            keys.arrowLeft.pressed = true
            break
    }
})

//funkcija sto napraviti kad se prestane pritiskat odredena tipka
window.addEventListener('keyup', (event) => {
    switch(event.code) {
        case 'ArrowUp':
            keys.arrowUp.pressed = false
            break
        case 'ArrowDown':
            keys.arrowDown.pressed = false
            break
        case 'ArrowRight':
            keys.arrowRight.pressed = false
            break
        case 'ArrowLeft':
            keys.arrowLeft.pressed = false
            break
    }

})