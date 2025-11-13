const texts = [
    "Felicidade que acabou de sair do forno",
    "Cookies artesanais, sabor de aconchego",
    "Feitos com amor e manteiga de verdade"
];

let index = 0;
let charIndex = 0;
const speed = 60;         // velocidade de digitação
const eraseSpeed = 40;    // velocidade de apagar
const delayBetween = 800; // pausa entre frases

const textElement = document.querySelector('.text-animation');
const cookieImg = document.querySelector('.cookie-icon');


let rotation = 0;
let rotationInterval = null;
let currentDirection = 0;

// 🔹 Função para girar o cookie
function rotateCookie(direction) {
    // só reinicia se mudar o sentido
    if (direction !== currentDirection) {
        clearInterval(rotationInterval);
        currentDirection = direction;

        rotationInterval = setInterval(() => {
            rotation += direction * 8; // velocidade de rotação
            cookieImg.style.transform = `rotate(${rotation}deg)`;
        }, 50);
    }
}

// 🔹 Para o giro suavemente
function stopCookie() {
    clearInterval(rotationInterval);
    rotationInterval = null;
    currentDirection = 0;
}

// 🔹 Efeito de digitação
function typeWriter() {
    const currentText = texts[index];

    if (charIndex < currentText.length) {
        rotateCookie(1); // 👉 gira pra direita
        textElement.textContent += currentText.charAt(charIndex);
        charIndex++;
        setTimeout(typeWriter, speed);
    } else {
        stopCookie();
        setTimeout(eraseText, delayBetween);
    }
}

// 🔹 Efeito de apagar
function eraseText() {
    const currentText = texts[index];

    if (charIndex > 0) {
        rotateCookie(-1); // 👈 gira pra esquerda
        textElement.innerText = currentText.substring(0, charIndex - 1);
        charIndex--;
        setTimeout(eraseText, eraseSpeed);
    } else {
        stopCookie();
        index = (index + 1) % texts.length;
        setTimeout(typeWriter, speed);
    }
}

document.addEventListener("DOMContentLoaded", typeWriter);
