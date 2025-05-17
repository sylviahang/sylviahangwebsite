/**
 * Dynamic Search Implementation for Sylvia Hang's Website
 * This script crawls the website content and builds a real-time search index
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements for search functionality
    const searchInput = document.querySelector('.search-container input');
    const searchResults = document.getElementById('searchResults');
    
    // Search index to store all searchable content
    let searchIndex = [];
    // Current search results and selection tracking
    let currentResults = [];
    let selectedIndex = -1;
    
    // Site structure - add all pages to be indexed
    const sitePages = [
        { url: 'index.html', title: 'Home', badge: 'home' },
        { url: 'pages/about.html', title: 'About', badge: 'about' },
        { url: 'pages/portfolio.html', title: 'Portfolio', badge: 'portfolio' }
    ];
    
    /**
     * Initialize search functionality
     */
    async function initSearch() {
        console.log('Initializing search functionality...');
        
        // Determine if we're in local dev or production
        const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const baseUrl = isLocalDev ? window.location.origin : 'https://sylviahang.github.io/sylviahangwebsite';
        
        // Build static index with page info
        const staticIndex = buildStaticIndex();
        
        // Try to build dynamic index if we're on a page with content
        try {
            // First index current page content
            const currentPageIndexItems = indexCurrentPage();
            searchIndex = [...staticIndex, ...currentPageIndexItems];
            
            // Then try to fetch and index other pages
            const dynamicIndex = await fetchAndIndexOtherPages(sitePages, baseUrl);
            searchIndex = [...searchIndex, ...dynamicIndex];
        } catch (error) {
            console.error('Error building dynamic search index:', error);
            // Fall back to static index if dynamic indexing fails
            searchIndex = staticIndex;
        }
        
        console.log(`Search index built with ${searchIndex.length} entries`);
    }
    
    /**
     * Build a basic static index with known site structure
     */
    function buildStaticIndex() {
        const index = [];
        
        // Add main pages
        index.push({
            url: 'index.html',
            title: 'Sylvia Hang - Filmmaker and Visual Storyteller',
            content: "I'm Sylvia Hang, a filmmaker and visual storyteller based in NYC, capturing moments and telling stories through the lens.",
            badge: 'home'
        });
        
        index.push({
            url: 'pages/about.html',
            title: 'About Sylvia Hang',
            content: 'Learn about Sylvia Hang, a filmmaker and visual storyteller based in New York City. Professional background, skills, and contact information.',
            badge: 'about'
        });
        
        index.push({
            url: 'pages/portfolio.html',
            title: 'Portfolio - Sylvia Hang',
            content: 'Explore Sylvia Hang\'s film projects, including documentaries, short films, music videos and more.',
            badge: 'portfolio'
        });
        
        // Portfolio items with direct links
        const portfolioItems = [
            { id: 'hong-kong', title: 'Hong Kong Through My Eyes', content: 'Travel Documentary - An immersive exploration of the vibrant cities of Hong Kong and Shenzhen.' },
            { id: 'sisters-quarrel', title: 'The Sister\'s Quarrel', content: 'Short Film - A sibling rivalry that takes a dark turn.' },
            { id: 'tale-of-lovers', title: 'A Tale of Two Lovers', content: 'Short Film - A heartbreaking love story between two individuals.' },
            { id: 'murder-dancefloor', title: 'Murder on the Dancefloor', content: 'Music Video - A music video featuring an entertaining plot twist.' },
            { id: 'homework-hell', title: 'Homework Hell', content: 'Experimental Film - An experimental short film using stop-motion animation.' },
            { id: 'what-is-the-end', title: 'What is the End', content: 'Experimental Film - An experimental short film featuring jump-scare elements.' },
            { id: 'the-cursed', title: 'The Cursed', content: 'Thriller - A thriller and suspense film about possession.' },
            { id: 'i-see-you', title: 'I See You', content: 'Psychological Thriller - A short film centered on the feeling of being watched.' },
            { id: 'certain-type-sadness', title: 'You\'re My Certain Type of Sadness', content: 'Drama - A short film about remembering a loved one.' },
            { id: 'places', title: 'Places', content: 'Documentary - Observational documentary about Allegheny College.' }
        ];
        
        // Add each portfolio item with a direct link
        portfolioItems.forEach(item => {
            index.push({
                url: `pages/portfolio.html#${item.id}`,
                title: item.title,
                content: item.content,
                badge: 'film'
            });
        });
        
        // Add contact section
        index.push({
            url: 'pages/about.html#contact-section',
            title: 'Contact Sylvia Hang',
            content: 'Get in touch with Sylvia Hang. Email: sylviahang18@gmail.com, LinkedIn: Sylvia Hang',
            badge: 'contact'
        });
        
        return index;
    }
    
    /**
     * Index content from the current page
     */
    function indexCurrentPage() {
        const pageItems = [];
        
        // Get current page URL
        const currentUrl = window.location.pathname.split('/').pop();
        let currentPage = sitePages.find(page => currentUrl.includes(page.url)) || sitePages[0];
        
        // Get all headings
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach(heading => {
            // Find the nearest ID to use as anchor
            let targetElement = heading;
            let parentWithId = heading.closest('[id]');
            let id = '';
            
            if (parentWithId) {
                id = parentWithId.id;
            }
            
            const content = getAssociatedContent(heading);
            
            pageItems.push({
                url: currentPage.url + (id ? `#${id}` : ''),
                title: heading.textContent.trim(),
                content: content,
                badge: currentPage.badge,
                element: targetElement  // Store reference to the element for scrolling
            });
        });
        
        // Get portfolio items if on portfolio page
        if (currentUrl.includes('portfolio')) {
            const portfolioItems = document.querySelectorAll('.portfolio-item');
            portfolioItems.forEach(item => {
                const id = item.id;
                const title = item.querySelector('h3')?.textContent || 'Untitled Project';
                const subtitle = item.querySelector('h4')?.textContent || '';
                const description = item.querySelector('p')?.textContent || '';
                
                pageItems.push({
                    url: currentPage.url + (id ? `#${id}` : ''),
                    title: title,
                    content: `${subtitle} - ${description}`,
                    badge: 'film',
                    element: item  // Store reference to the element for scrolling
                });
            });
        }
        
        return pageItems;
    }
    
    /**
     * Get associated content for a heading element
     */
    function getAssociatedContent(headingElement) {
        let content = headingElement.textContent.trim();
        let nextElement = headingElement.nextElementSibling;
        
        // Gather text from paragraphs following the heading
        while (nextElement && ['P', 'UL', 'OL'].includes(nextElement.tagName)) {
            content += ' ' + nextElement.textContent.trim();
            nextElement = nextElement.nextElementSibling;
        }
        
        return content;
    }
    
    /**
     * Fetch and index content from other pages
     */
    async function fetchAndIndexOtherPages(pages, baseUrl) {
        const currentPageUrl = window.location.pathname.split('/').pop();
        const otherPages = pages.filter(page => !currentPageUrl.includes(page.url));
        const results = [];
        
        // Only try to fetch other pages if we're in the browser
        if (!window.fetch) return results;
        
        // For each page, fetch the content and extract searchable text
        for (const page of otherPages) {
            try {
                const response = await fetch(`${baseUrl}/${page.url}`);
                
                if (!response.ok) {
                    console.warn(`Could not fetch ${page.url}: ${response.status}`);
                    continue;
                }
                
                const html = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Extract all headings and their content
                const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
                
                headings.forEach(heading => {
                    let parentWithId = heading.closest('[id]');
                    let id = '';
                    
                    if (parentWithId) {
                        id = parentWithId.id;
                    }
                    
                    // Get surrounding text
                    let content = heading.textContent.trim();
                    let nextElement = heading.nextElementSibling;
                    
                    // Gather text from paragraphs following the heading
                    while (nextElement && ['P', 'UL', 'OL'].includes(nextElement.tagName)) {
                        content += ' ' + nextElement.textContent.trim();
                        nextElement = nextElement.nextElementSibling;
                    }
                    
                    results.push({
                        url: page.url + (id ? `#${id}` : ''),
                        title: heading.textContent.trim(),
                        content: content,
                        badge: page.badge
                    });
                });
                
                // If it's the portfolio page, also extract portfolio items
                if (page.url.includes('portfolio')) {
                    const portfolioItems = doc.querySelectorAll('.portfolio-item');
                    
                    portfolioItems.forEach(item => {
                        const id = item.id;
                        const title = item.querySelector('h3')?.textContent || 'Untitled Project';
                        const subtitle = item.querySelector('h4')?.textContent || '';
                        const description = item.querySelector('p')?.textContent || '';
                        
                        results.push({
                            url: page.url + (id ? `#${id}` : ''),
                            title: title,
                            content: `${subtitle} - ${description}`,
                            badge: 'film'
                        });
                    });
                }
                
            } catch (error) {
                console.warn(`Error indexing ${page.url}:`, error);
            }
        }
        
        return results;
    }
    
    /**
     * Perform search with the current input value
     */
    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        
        // Clear results if query is empty
        if (!query) {
            searchResults.classList.remove('active');
            searchResults.innerHTML = '';
            currentResults = [];
            selectedIndex = -1;
            return;
        }
        
        // Filter search index based on query
        currentResults = searchIndex.filter(item => {
            const titleMatch = item.title.toLowerCase().includes(query);
            const contentMatch = item.content.toLowerCase().includes(query);
            return titleMatch || contentMatch;
        });
        
        // Display search results
        displayResults(currentResults, query);
    }
    
    /**
     * Display search results in the DOM
     */
    function displayResults(results, query) {
        searchResults.innerHTML = '';
        selectedIndex = -1;
        
        // Show the results container if we have results
        if (results.length > 0) {
            searchResults.classList.add('active');
            
            // Create header with result count
            const header = document.createElement('div');
            header.className = 'search-results-header';
            header.textContent = `Found ${results.length} result${results.length !== 1 ? 's' : ''}`;
            searchResults.appendChild(header);
            
            // Add each result to the DOM
            results.forEach((result, index) => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                resultItem.setAttribute('data-index', index);
                
                // Add result badge/category
                const badgeElement = document.createElement('span');
                badgeElement.className = 'result-type-badge ' + result.badge;
                badgeElement.textContent = result.badge.charAt(0).toUpperCase() + result.badge.slice(1);
                resultItem.appendChild(badgeElement);
                
                // Add title with highlighted query matches
                const title = document.createElement('h4');
                title.innerHTML = highlightText(result.title, query);
                resultItem.appendChild(title);
                
                // Add preview with highlighted query matches
                const preview = document.createElement('p');
                preview.innerHTML = highlightText(createPreview(result.content, query), query);
                resultItem.appendChild(preview);
                
                // Make clickable to navigate to result
                resultItem.addEventListener('click', () => {
                    navigateToResult(result);
                });
                
                // Add to search results container
                searchResults.appendChild(resultItem);
            });
        } else {
            // No results found
            searchResults.classList.add('active');
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.textContent = `No results found for "${query}"`;
            searchResults.appendChild(noResults);
        }
    }
    
    /**
     * Create a preview of the content, focused on the query match
     */
    function createPreview(content, query) {
        const maxLength = 150;
        const lowerContent = content.toLowerCase();
        const lowerQuery = query.toLowerCase();
        
        // Find position of query in content
        const queryIndex = lowerContent.indexOf(lowerQuery);
        
        // If query is found, center the preview around it
        if (queryIndex !== -1) {
            // Calculate start position for preview, trying to center query
            let startPos = Math.max(0, queryIndex - Math.floor(maxLength / 2));
            
            // Adjust to avoid cutting words
            if (startPos > 0) {
                // Find the beginning of the current word
                const prevSpace = content.lastIndexOf(' ', startPos);
                if (prevSpace !== -1) {
                    startPos = prevSpace + 1;
                }
            }
            
            // Extract preview
            let preview = content.substring(startPos, startPos + maxLength);
            
            // Add ellipsis if needed
            if (startPos > 0) {
                preview = '...' + preview;
            }
            if (startPos + maxLength < content.length) {
                preview = preview + '...';
            }
            
            return preview;
        }
        
        // If query not found, just take the beginning
        if (content.length <= maxLength) {
            return content;
        } else {
            return content.substring(0, maxLength) + '...';
        }
    }
    
    /**
     * Highlight query matches in text
     */
    function highlightText(text, query) {
        if (!query || !text) return text;
        
        // Escape special regex characters
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Create a regex to find all instances of the query
        const regex = new RegExp(`(${escapedQuery})`, 'gi');
        
        // Replace with highlighted version
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }
    
    /**
     * Navigate to a search result
     */
    function navigateToResult(result) {
        if (!result) return;
        
        // Check if the result has an element reference (for current page navigation)
        if (result.element) {
            // Scroll element into view
            result.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Add highlight effect
            result.element.classList.add('search-highlight-item');
            setTimeout(() => {
                result.element.classList.remove('search-highlight-item');
            }, 2000);
            
            // Close search results
            searchResults.classList.remove('active');
            return;
        }
        
        // Otherwise navigate to URL
        let url = result.url;
        
        // Handle base URL properly
        const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const baseUrl = isLocalDev ? window.location.origin : 'https://sylviahang.github.io/sylviahangwebsite';
        
        // Ensure no double slashes
        if (url.startsWith('/')) {
            url = url.substring(1);
        }
        
        // Navigate to the result URL
        window.location.href = `${baseUrl}/${url}`;
    }
    
    /**
     * Handle keyboard navigation in search results
     */
    function handleKeyboardNavigation(event) {
        // Only process if search results are visible
        if (!searchResults.classList.contains('active') || currentResults.length === 0) {
            return;
        }
        
        const resultItems = searchResults.querySelectorAll('.search-result-item');
        
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                // Move selection down
                selectedIndex = Math.min(selectedIndex + 1, resultItems.length - 1);
                updateSelection(resultItems);
                break;
                
            case 'ArrowUp':
                event.preventDefault();
                // Move selection up
                selectedIndex = Math.max(selectedIndex - 1, 0);
                updateSelection(resultItems);
                break;
                
            case 'Enter':
                event.preventDefault();
                // If no result is selected, select the first one
                if (selectedIndex < 0 && currentResults.length > 0) {
                    navigateToResult(currentResults[0]);
                } 
                // Otherwise navigate to the selected result
                else if (selectedIndex >= 0 && selectedIndex < currentResults.length) {
                    navigateToResult(currentResults[selectedIndex]);
                }
                break;
                
            case 'Escape':
                // Close search results
                event.preventDefault();
                searchInput.value = '';
                searchResults.classList.remove('active');
                searchResults.innerHTML = '';
                currentResults = [];
                selectedIndex = -1;
                break;
        }
    }
    
    /**
     * Update the visual selection in search results
     */
    function updateSelection(resultItems) {
        // Remove active class from all items
        resultItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to selected item and scroll into view if needed
        if (selectedIndex >= 0 && selectedIndex < resultItems.length) {
            const selectedItem = resultItems[selectedIndex];
            selectedItem.classList.add('active');
            selectedItem.scrollIntoView({ block: 'nearest' });
        }
    }
    
    // Initialize search when page loads
    initSearch();
    
    // Set up event listeners
    searchInput.addEventListener('input', performSearch);
    searchInput.addEventListener('keydown', handleKeyboardNavigation);
    
    // Close search results when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.search-container')) {
            searchResults.classList.remove('active');
        }
    });
    
    // Make the search function globally available
    window.performSearch = performSearch;
});