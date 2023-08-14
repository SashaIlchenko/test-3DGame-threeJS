const overlay = document.querySelector('.overlay');
const btnClose = document.querySelector('.close-btn');
btnClose.addEventListener('click', onBtnClose);
function onBtnClose() {
    overlay.classList.add('is-hidden');

}