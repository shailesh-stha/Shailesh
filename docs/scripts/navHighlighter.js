document.addEventListener("DOMContentLoaded", function () {
  const activePage = window.location.pathname;
  const navLinks = document.querySelectorAll("nav a");

  navLinks.forEach((link) => {
    const linkPath = new URL(link.href).pathname;
    // Handle both '/' and '/index.html' for the home page
    if (activePage === '/' && linkPath === '/index.html') {
        link.classList.add("active");
    } else if (linkPath === activePage) {
      link.classList.add("active");
    }
  });
});