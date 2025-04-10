 // Mobile menu toggle
 document.getElementById('mobile-menu').addEventListener('click', function() {
    alert("s");
    var navUl = document.querySelector('nav ul');
    navUl.classList.toggle('show');
});

// Add active class on navigation links
const currentLocation = location.pathname;
const menuItems = document.querySelectorAll('.nav-link');
menuItems.forEach(item => {
    if (item.getAttribute('href') === currentLocation) {
        item.classList.add('active');
    }

    item.addEventListener('click', function() {
        menuItems.forEach(link => link.classList.remove('active'));
        this.classList.add('active');
    });
});