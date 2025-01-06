function changeTimeView(view){
    const allSections = document.querySelectorAll('#daily, #weekly, #monthly');
    allSections.forEach(section => section.classList.remove('active'));

    const activeTimeView = document.getElementById(view);
    if(activeTimeView)
        activeTimeView.classList.add('active');
}

function changeView(view){
    changeTimeView(view);
}

function toggleMenu() {
    const menu = document.getElementById('timeMenu');
    menu.classList.toggle('active');
}
