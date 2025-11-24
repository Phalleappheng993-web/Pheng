        // === 1. Typing Animation Script ===
        const words = ["Full-Stack Developer", "UI/UX Enthusiast", "Code Architect", "Problem Solver"];
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        const typingElement = document.getElementById('typing-text');

        function typeEffect() {
            const currentWord = words[wordIndex];
            const displayText = isDeleting 
                ? currentWord.substring(0, charIndex - 1)
                : currentWord.substring(0, charIndex + 1);

            typingElement.textContent = displayText;

            if (!isDeleting && charIndex === currentWord.length) {
                // Done typing the word, start pause
                setTimeout(() => isDeleting = true, 1500); // Pause before deleting
            } else if (isDeleting && charIndex === 0) {
                // Done deleting, move to next word
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
            }

            // Adjust speed
            const typingSpeed = isDeleting ? 75 : 150; 
            charIndex = isDeleting ? charIndex - 1 : charIndex + 1;

            setTimeout(typeEffect, typingSpeed);
        }

        // Start the typing animation after initial load
        document.addEventListener('DOMContentLoaded', () => {
            typeEffect();
        });


        // === 2. Smooth Scroll & Intersection Observer for Fade-In ===

        // Handle smooth scrolling for internal links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });

        // Setup Intersection Observer for fade-in effects
        const observerOptions = {
            root: null, // relative to the viewport
            rootMargin: '0px',
            threshold: 0.2 // trigger when 20% of the element is visible
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // Stop observing once visible
                }
            });
        }, observerOptions);

        // Target all sections that need the fade-in effect
        document.querySelectorAll('.fade-in-on-scroll').forEach(section => {
            observer.observe(section);
        });

        // === 3. Contact Form Submission Handler ===
        const contactForm = document.getElementById('contact-form');
        const formMessage = document.getElementById('form-message');

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Simulate form submission success/failure
            const success = Math.random() > 0.1; // 90% chance of success

            if (success) {
                formMessage.textContent = "Thank you! Your message has been sent successfully. I will get back to you soon.";
                formMessage.className = "mt-4 p-4 rounded-xl text-center bg-green-500/20 text-green-300 block";
                contactForm.reset(); // Clear the form on success
            } else {
                formMessage.textContent = "Sorry, there was an error sending your message. Please try again later or contact me directly via email.";
                formMessage.className = "mt-4 p-4 rounded-xl text-center bg-red-500/20 text-red-300 block";
            }
            
            // Show the message box
            formMessage.classList.remove('hidden');

            // Hide the message after 5 seconds
            setTimeout(() => {
                formMessage.classList.add('hidden');
            }, 5000);
        });

