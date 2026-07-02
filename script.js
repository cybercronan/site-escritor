document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking a link
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.padding = '10px 0';
            navbar.style.boxShadow = '0 4px 20px rgba(60, 47, 47, 0.08)';
        } else {
            navbar.style.padding = '15px 0';
            navbar.style.boxShadow = 'none';
        }
    });

    // 3D Book Interactive Effect (Mouse movement tracking)
    // Only enable on non-touch devices to avoid janky mobile interactions
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    if (!isTouchDevice) {
        const bookWrappers = document.querySelectorAll('.book-3d-wrapper');
        
        bookWrappers.forEach(wrapper => {
            const book = wrapper.querySelector('.book-3d');
            
            wrapper.addEventListener('mousemove', (e) => {
                const rect = wrapper.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = ((y - centerY) / centerY) * -15; 
                const rotateY = ((x - centerX) / centerX) * 15 - 10;

                book.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateZ(20px)`;
                book.style.transition = 'transform 0.1s ease-out';
            });

            wrapper.addEventListener('mouseleave', () => {
                book.style.transform = 'rotateY(-20deg) rotateX(10deg)';
                book.style.transition = 'transform 0.5s ease';
            });
        });
    }
});
