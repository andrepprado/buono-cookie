const heroImages = [
    './img/background/webp/hero1.webp',
    './img/background/webp/hero2.webp',
    './img/background/webp/hero3.webp'
];

let currentIndex = 0;
const heroBg = document.querySelector('.hero-background');

function changeHeroBackground() {
    heroBg.style.opacity = 0;

    setTimeout(() => {
        heroBg.style.backgroundImage = `url(${heroImages[currentIndex]})`;
        heroBg.style.opacity = 1;
        currentIndex = (currentIndex + 1) % heroImages.length;
    }, 600);
}

// Inicia o background
heroBg.style.backgroundImage = `url(${heroImages[0]})`;
setInterval(changeHeroBackground, 5000);


