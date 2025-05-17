/**
 * EmailJS integration for Sylvia Hang's website contact form
 * This handles sending emails through EmailJS service
 */

// Wait for DOM to load before setting up email functionality
document.addEventListener('DOMContentLoaded', function () {
    // Initialize EmailJS
    (function () {
        emailjs.init("I7KQWYcmSLR7eofkQ");
        console.log("EmailJS initialized");
    })();

    // Get the contact form
    const contactForm = document.getElementById('contact-form');

    // Add submit event handler to the form
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            sendEmail(e);
        });
        console.log("Contact form event handler attached");
    } else {
        console.log("Contact form not found on this page");
    }
});

/**
 * Send an email using EmailJS
 */
function sendEmail(event) {
    // Get the submit button
    const submitButton = document.getElementById('submit-btn');
    if (!submitButton) {
        console.error("Submit button not found");
        return;
    }

    // Show sending state
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    // Get form data
    const form = event.target;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    // EmailJS configuration
    const serviceID = 'service_dma5fk8';
    const templateID = 'template_hckixmi';

    // Prepare parameters - keeping it simple
    const templateParams = {
        name: name,
        email: email,
        subject: subject,
        message: message
    };

    console.log("Sending email with params:", templateParams);
    console.log(`Using serviceID: ${serviceID}, templateID: ${templateID}`);

    // Send the email using EmailJS
    emailjs.send(serviceID, templateID, templateParams)
        .then(function (response) {
            console.log("Email sent successfully!", response);
            submitButton.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
            form.reset();

            setTimeout(function () {
                submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
                submitButton.disabled = false;
            }, 3000);
        }, function (error) {
            console.error("EmailJS error:", error);

            // Detailed error message for debugging
            submitButton.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error Sending';

            console.error("Full error details:", JSON.stringify(error));

            setTimeout(function () {
                submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
                submitButton.disabled = false;
            }, 5000);
        });
}

// Make sendEmail function globally available
window.sendEmail = sendEmail; 