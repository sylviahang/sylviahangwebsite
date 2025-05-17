document.addEventListener('DOMContentLoaded', () => {
    // Get the greeting element
    const greetingElement = document.getElementById('greeting-text');
    if (!greetingElement) return;

    // Create a consistent structure for the greeting with separate text and emoji spans
    greetingElement.innerHTML = '<span id="greeting-text-content"></span><span id="greeting-emoji"> 👋,</span>';
    const textElement = document.getElementById('greeting-text-content');

    // Text content without emoji
    const greetingTexts = [
        "Hello",
        "你好"
    ];
    
    let currentIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isTypingPaused = false;

    // Timing variables
    const typingSpeed = 100;
    const deletingSpeed = 100; 
    const pauseBeforeDelete = 750; // Only pause 750ms between words
    const pauseBeforeNextPhrase = 3000; // Hold fully spelled word for 3 seconds

    // Function to animate the typing effect
    const type = () => {
        // Get the current greeting text (without emoji)
        const currentGreeting = greetingTexts[currentIndex];
        
        // Set the text based on current status
        if (isDeleting) {
            // When deleting, slice from the beginning to current character index
            textElement.textContent = currentGreeting.substring(0, charIndex);
            charIndex--;
            
            // If we've deleted everything
            if (charIndex < 0) {
                isDeleting = false;
                isTypingPaused = true;
                charIndex = 0;
                
                // Move to next greeting
                currentIndex = (currentIndex + 1) % greetingTexts.length;
            }
        } else {
            // When typing, slice from the beginning to current character index
            textElement.textContent = currentGreeting.substring(0, charIndex + 1);
            charIndex++;
            
            // If we've typed the whole greeting
            if (charIndex >= currentGreeting.length) {
                isTypingPaused = true;
                isDeleting = true;
            }
        }

        // Determine the next timeout
        let timeoutDuration;

        if (isTypingPaused) {
            // If we're paused, determine which pause we're in
            timeoutDuration = isDeleting ? pauseBeforeNextPhrase : pauseBeforeDelete;
            isTypingPaused = false;
        } else if (isDeleting) {
            // If deleting, use the delete speed
            timeoutDuration = deletingSpeed;
        } else {
            // If typing, use the typing speed
            timeoutDuration = typingSpeed;
        }

        // Continue the animation
        setTimeout(type, timeoutDuration);
    };
    
    // Start the animation after a small delay
    setTimeout(type, 300);
});