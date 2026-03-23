document.addEventListener('DOMContentLoaded', () => {
    setupMobileNav();
    highlightCurrentNavLink();
    setupScrollAnimations();
    setupForms();
    setupDonationBox();
});

function setupMobileNav() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    if (!hamburger || !navLinks) {
        return;
    }

    hamburger.addEventListener('click', () => {
        const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
        hamburger.setAttribute('aria-expanded', String(!isExpanded));
        navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });
}

function highlightCurrentNavLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('#nav-links a[href]');

    links.forEach((link) => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath) {
            link.classList.add('current-page');
            link.setAttribute('aria-current', 'page');
        }
    });
}

function setupScrollAnimations() {
    const animateElements = document.querySelectorAll('.card, .grid-2-cols > div, .grid-3-cols > div, .page-header .container > *');

    if (!animateElements.length) {
        return;
    }

    if (!('IntersectionObserver' in window)) {
        animateElements.forEach((el) => el.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.14
    });

    animateElements.forEach((el, index) => {
        el.classList.add('fade-up');
        if (el.classList.contains('card')) {
            el.classList.add(`delay-${(index % 3) + 1}`);
        }
        observer.observe(el);
    });
}

function setupForms() {
    const forms = document.querySelectorAll('form[data-form-name]');

    forms.forEach((form) => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();

            if (!form.checkValidity()) {
                showFormFeedback(form, 'Please complete all required fields correctly.', 'error');
                form.reportValidity();
                return;
            }

            const formData = new FormData(form);
            const payload = Object.fromEntries(formData.entries());
            payload.submittedAt = new Date().toISOString();
            payload.form = form.dataset.formName;

            saveSubmission(payload);
            showFormFeedback(form, 'Thanks. Your message was received successfully.', 'success');
            form.reset();
        });
    });
}

function saveSubmission(payload) {
    try {
        const key = 'encouragementSubmissions';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push(payload);
        localStorage.setItem(key, JSON.stringify(existing));
    } catch (_error) {
        // Ignore localStorage failures in private mode or restricted environments.
    }
}

function showFormFeedback(form, message, type) {
    let feedback = form.querySelector('.form-feedback');

    if (!feedback) {
        feedback = document.createElement('p');
        feedback.className = 'form-feedback';
        form.appendChild(feedback);
    }

    feedback.textContent = message;
    feedback.className = `form-feedback ${type}`;
}

function setupDonationBox() {
    const donationContainer = document.querySelector('.donation-box');
    if (!donationContainer) {
        return;
    }

    const oneTimeBtn = document.getElementById('donation-one-time');
    const monthlyBtn = document.getElementById('donation-monthly');
    const tierButtons = donationContainer.querySelectorAll('.tier-btn');
    const customAmountInput = document.getElementById('donation-custom-amount');
    const completeDonationBtn = document.getElementById('complete-donation-btn');
    const summary = document.getElementById('donation-summary');

    let frequency = 'One-Time';
    let amount = Number(donationContainer.dataset.defaultAmount || 50);

    const setFrequency = (nextFrequency) => {
        frequency = nextFrequency;
        oneTimeBtn.classList.toggle('active', frequency === 'One-Time');
        monthlyBtn.classList.toggle('active', frequency === 'Monthly');
        updateSummary();
    };

    const setAmount = (nextAmount) => {
        amount = Math.max(1, Number(nextAmount) || amount);
        customAmountInput.value = amount;
        updateSummary();
    };

    const updateSummary = () => {
        summary.textContent = `You are donating $${amount} (${frequency.toLowerCase()}).`;
    };

    oneTimeBtn.addEventListener('click', () => setFrequency('One-Time'));
    monthlyBtn.addEventListener('click', () => setFrequency('Monthly'));

    tierButtons.forEach((button) => {
        button.addEventListener('click', () => {
            tierButtons.forEach((btn) => btn.classList.remove('active'));
            button.classList.add('active');
            setAmount(button.dataset.amount);
        });
    });

    customAmountInput.addEventListener('input', () => {
        tierButtons.forEach((btn) => btn.classList.remove('active'));
        setAmount(customAmountInput.value);
    });

    completeDonationBtn.addEventListener('click', (event) => {
        event.preventDefault();
        const subject = encodeURIComponent(`${frequency} Donation Pledge`);
        const body = encodeURIComponent(`Hello Encouragement by Empowerment,%0D%0A%0D%0AI would like to make a ${frequency.toLowerCase()} donation of $${amount}.%0D%0A%0D%0AName:%0D%0APhone:%0D%0A%0D%0AThank you.`);
        window.location.href = `mailto:info@encouragement.org?subject=${subject}&body=${body}`;
    });

    setFrequency('One-Time');
    setAmount(amount);
}