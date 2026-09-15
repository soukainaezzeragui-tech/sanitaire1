async function loadSearchProducts() {
    const CONFIG = {
        CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR0qnUzNmU46GUWrjrFJNJUoV3jtOcfD0b7uK1Y_k-7ad0m1-0C_AGSdEL6Jgh1aonTLTYl3Z50SGq6/pub?output=csv",
        HIDDEN_STATUS: "9",
        MIN_COLUMNS: 12,
        PRODUCTS_PER_PAGE: 50,
        COLUMNS: {
            ID: 0,
            NAME: 1,
            CATEGORY: 2,
            SUBCATEGORY: 3,
            BRAND: 4,          // Ø¹Ù…ÙˆØ¯ Ø§Ù„Ù…Ø§Ø±ÙƒØ©
            DESCRIPTION: 5,
            IMAGE: 6,
            STATUS: 7,
            DESCRIPTION2: 8,
            DESCRIPTION3: 9,
            IMAGE2: 10,
            IMAGE3: 11
        }
    };

    const params = new URLSearchParams(window.location.search);
    const searchQuery = params.get("q") ? params.get("q").trim() : "";
    const pageParam = params.get("page") ? parseInt(params.get("page")) : 1;
    const currentPage = Math.max(1, pageParam);
    
    const container = document.getElementById("productsContainer");
    if (!container) return;

    // Ø­Ø§Ù„Ø© Ø§Ù„Ø¨Ø­Ø« Ø§Ù„ÙØ§Ø±Øº
    if (searchQuery === "") {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #666;">
                <i class="fas fa-search" style="font-size: 48px; opacity: 0.5; margin-bottom: 15px;"></i>
                <p style="font-size: 18px;">Veuillez entrer le nom du produit ou de la marque dans la barre de recherche ci-dessus.</p>
            </div>`;
        return;
    }

    // Ø¥Ø¸Ù‡Ø§Ø± Ù…Ø¤Ø´Ø± Ø§Ù„ØªØ­Ù…ÙŠÙ„
    const spinnerDiv = document.createElement('div');
    spinnerDiv.style.cssText = 'grid-column: 1/-1; text-align: center; padding: 60px;';
    spinnerDiv.innerHTML = `
        <div class="spinner" style="width: 50px; height: 50px; border: 3px solid #f3f3f3; border-top: 3px solid #25D366; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
        <p style="color: #666;">Recherche des produits... </p>
    `;
    
    container.innerHTML = "";
    container.appendChild(spinnerDiv);
    
    if (!document.getElementById('spinner-keyframes')) {
        const style = document.createElement('style');
        style.id = 'spinner-keyframes';
        style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
        document.head.appendChild(style);
    }

    try {
        const response = await fetch(CONFIG.CSV_URL);
        if (!response.ok) throw new Error('Impossible de charger les donnÃ©es.');
        
        const csvText = await response.text();
        const rows = csvText.split(/\r?\n/).filter(row => row.trim());

        // Ø¯Ø§Ù„Ø© ØªÙ†Ø¸ÙŠÙ Ø§Ù„Ù†Øµ
        const clean = (val) => val ? val.replace(/^"|"$/g, "").trim() : "";
        
        // Ø¯Ø§Ù„Ø© ØªØ·Ø¨ÙŠØ¹ Ø§Ù„Ù†Øµ Ù„Ù„Ø¨Ø­Ø« (Ø¥Ø²Ø§Ù„Ø© Ø§Ù„ØªØ´ÙƒÙŠÙ„ ÙˆØªØ­ÙˆÙŠÙ„Ù‡ Ù„ØµÙŠØºØ© Ù…ÙˆØ­Ø¯Ø©)
        const normalizeText = (text) => {
            if (!text) return '';
            return text
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "") // Ø¥Ø²Ø§Ù„Ø© Ø¹Ù„Ø§Ù…Ø§Øª Ø§Ù„ØªØ´ÙƒÙŠÙ„
                .replace(/[^\w\s]/g, ' '); // Ø¥Ø²Ø§Ù„Ø© Ø§Ù„Ø±Ù…ÙˆØ² Ø§Ù„Ø®Ø§ØµØ©
        };

        const searchWords = normalizeText(searchQuery).split(/\s+/).filter(word => word.length > 1);
        
        // Ù…ØµÙÙˆÙØ© Ù„ØªØ®Ø²ÙŠÙ† Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù†ØªØ§Ø¦Ø¬
        const allResults = [];

        for (let i = 1; i < rows.length; i++) {
            const cols = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            if (cols.length < CONFIG.MIN_COLUMNS) continue;

            const pStatus = clean(cols[CONFIG.COLUMNS.STATUS]);
            
            if (pStatus === CONFIG.HIDDEN_STATUS) continue;

            const pName = clean(cols[CONFIG.COLUMNS.NAME]);
            if (pName === "") continue;
            
            const pCat = clean(cols[CONFIG.COLUMNS.CATEGORY]);
            const pSubCat = clean(cols[CONFIG.COLUMNS.SUBCATEGORY]);
            const pBrand = clean(cols[CONFIG.COLUMNS.BRAND]); // âœ… Ø§Ù„Ù…Ø§Ø±ÙƒØ©
            const pDescription = clean(cols[CONFIG.COLUMNS.DESCRIPTION]);
            const pImg = clean(cols[CONFIG.COLUMNS.IMAGE]);

            // âœ… ØªØ·Ø¨ÙŠØ¹ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù†ØµÙˆØµ Ù„Ù„Ø¨Ø­Ø«
            const normalizedName = normalizeText(pName);
            const normalizedCat = normalizeText(pCat);
            const normalizedSubCat = normalizeText(pSubCat);
            const normalizedBrand = normalizeText(pBrand);
            const normalizedDesc = normalizeText(pDescription);

            // âœ… Ø§Ù„Ø¨Ø­Ø« ÙÙŠ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø­Ù‚ÙˆÙ„ Ø¨Ù…Ø§ ÙÙŠ Ø°Ù„Ùƒ Ø§Ù„Ù…Ø§Ø±ÙƒØ©
            let isMatch = false;
            
            for (const word of searchWords) {
                // Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ÙˆØ¬ÙˆØ¯ ÙƒÙ„Ù…Ø© Ø§Ù„Ø¨Ø­Ø« ÙÙŠ Ø£ÙŠ Ù…Ù† Ø§Ù„Ø­Ù‚ÙˆÙ„
                if (normalizedName.includes(word) ||
                    normalizedCat.includes(word) ||
                    normalizedSubCat.includes(word) ||
                    normalizedBrand.includes(word) ||  // âœ… Ø§Ù„Ø£Ù‡Ù…: Ø§Ù„Ø¨Ø­Ø« ÙÙŠ Ø§Ù„Ù…Ø§Ø±ÙƒØ©
                    normalizedDesc.includes(word)) {
                    isMatch = true;
                    break;
                }
                
                // âœ… Ø¨Ø­Ø« Ø¥Ø¶Ø§ÙÙŠ: Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ØªØ·Ø§Ø¨Ù‚ Ø§Ù„Ù…Ø§Ø±ÙƒØ© Ø¨Ø§Ù„ÙƒØ§Ù…Ù„
                if (normalizedBrand === word) {
                    isMatch = true;
                    break;
                }
            }

            if (isMatch) {
                allResults.push({ 
                    pName, 
                    pSubCat, 
                    pImg, 
                    pDescription, 
                    pBrand, 
                    pCat 
                });
            }
        }

        // Ø¥Ø²Ø§Ù„Ø© Ø§Ù„Ù€ spinner
        if (spinnerDiv.parentNode === container) {
            container.removeChild(spinnerDiv);
        }

        if (allResults.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                    <i class="fas fa-box-open" style="font-size: 48px; opacity: 0.5; margin-bottom: 15px; color: #999;"></i>
                    <p style="font-size: 18px; color: #666; margin-bottom: 10px;">Aucun rÃ©sultat pour "${searchQuery}"</p>
                    <p style="color: #999; font-size: 14px;">Essayez dâ€™autres mots-clÃ©s, comme le nom du produit ou la marque.</p>
                </div>`;
            return;
        }

        // Ø­Ø³Ø§Ø¨ Ø§Ù„ØµÙØ­Ø§Øª
        const totalProducts = allResults.length;
        const totalPages = Math.ceil(totalProducts / CONFIG.PRODUCTS_PER_PAGE);
        const startIndex = (currentPage - 1) * CONFIG.PRODUCTS_PER_PAGE;
        const endIndex = Math.min(startIndex + CONFIG.PRODUCTS_PER_PAGE, totalProducts);
        
        if (currentPage > totalPages && totalPages > 0) {
            const url = new URL(window.location);
            url.searchParams.set('page', totalPages);
            window.location.href = url.toString();
            return;
        }

        const pageResults = allResults.slice(startIndex, endIndex);

        // Ø¹Ø±Ø¶ Ø§Ù„Ù†ØªØ§Ø¦Ø¬
        const resultsContainer = document.createElement('div');
        resultsContainer.style.display = 'contents';

        // Ø¥Ø¶Ø§ÙØ© Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ù†ØªØ§Ø¦Ø¬
        const infoDiv = document.createElement('div');
        infoDiv.style.cssText = 'grid-column: 1/-1; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;';
        infoDiv.innerHTML = `
            <div style="color: #666; font-size: 14px;">
                <i class="fas fa-box" style="margin-left: 5px;"></i>
               Total des rÃ©sultats: ${totalProducts} produit
                ${totalPages > 1 ? `(Page ${currentPage} sur ${totalPages})` : ''}
            </div>
            <div style="color: #666; font-size: 14px;">
                Affichage de ${startIndex + 1} - ${endIndex} sur ${totalProducts}
            </div>
        `;
        container.appendChild(infoDiv);

        // Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª
        pageResults.forEach(product => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = createProductCard(product);
            resultsContainer.appendChild(tempDiv.firstElementChild);
        });
        
        container.appendChild(resultsContainer);

        // Ø¥Ø¶Ø§ÙØ© Ø£Ø²Ø±Ø§Ø± Ø§Ù„ØªÙ†Ù‚Ù„
        if (totalPages > 1) {
            const paginationDiv = document.createElement('div');
            paginationDiv.className = 'pagination';
            
            const createPageLink = (pageNum, text = pageNum, isCurrent = false) => {
                const url = new URL(window.location);
                url.searchParams.set('page', pageNum);
                
                if (isCurrent) {
                    return `<span class="current">${text}</span>`;
                } else {
                    return `<a href="${url.toString()}">${text}</a>`;
                }
            };

            if (currentPage > 1) {
                paginationDiv.innerHTML += createPageLink(currentPage - 1, 'â†');
            }

            const maxVisiblePages = 5;
            let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
            
            if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }

            if (startPage > 1) {
                paginationDiv.innerHTML += createPageLink(1);
                if (startPage > 2) {
                    paginationDiv.innerHTML += '<span class="dots">...</span>';
                }
            }

            for (let i = startPage; i <= endPage; i++) {
                paginationDiv.innerHTML += createPageLink(i, i, i === currentPage);
            }

            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    paginationDiv.innerHTML += '<span class="dots">...</span>';
                }
                paginationDiv.innerHTML += createPageLink(totalPages);
            }

            if (currentPage < totalPages) {
                paginationDiv.innerHTML += createPageLink(currentPage + 1, 'â†’');
            }

            container.appendChild(paginationDiv);
        }

    } catch (error) {
        console.error("Ø®Ø·Ø£ ÙÙŠ ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª:", error);
        
        if (spinnerDiv.parentNode === container) {
            container.removeChild(spinnerDiv);
        }
        
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Ø¹Ø°Ø±Ø§Ù‹ØŒ Ø­Ø¯Ø« Ø®Ø·Ø£ ÙÙŠ ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª</p>
                <button onclick="loadSearchProducts()" class="retry-button">
                    <i class="fas fa-redo"></i>
                    Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø©
                </button>
            </div>`;
    }
}

function createProductCard(product) {
    const imageUrl = product.pImg || '/images/placeholder.jpg';
    const shortDescription = product.pDescription 
        ? (product.pDescription.length > 60 
            ? product.pDescription.substring(0, 60) + '...' 
            : product.pDescription)
        : '';
    
    return `
        <div class="product-card">
            <div class="product-img-container"> 
                <img src="${imageUrl}" 
                     alt="${product.pName}" 
                     loading="lazy"
                     onerror="this.src='/images/placeholder.jpg'; this.onerror=null;"> 
            </div> 
            <div class="product-info">
                <p class="p-category">${product.pSubCat || product.pCat || 'Ù…Ù†ØªØ¬'}</p> 
                <h3 class="p-title">${product.pName}</h3>
                ${product.pBrand ? `<p class="p-brand">${product.pBrand}</p>` : ''}
                ${shortDescription ? `<p class="p-description">${shortDescription}</p>` : ''}
                <div class="product-action">
                    <a href="/product.html?name=${encodeURIComponent(product.pName)}" 
                       class="btn-explore" 
                       title="Voir les dÃ©tails">
                        DÃ©couvrir
                    </a>
                    <button onclick="commandeProduit('${product.pName.replace(/'/g, "\\'")}')" 
                            class="btn-whatsapp-small"
                            title="Commander via WhatsApp">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                </div>
            </div> 
        </div>`;
}


function commandeProduit(productName) {
    const phoneNumber = "+212667361575"; 
    const message = `Ø³Ù„Ø§Ù…ØŒ Ø£Ø±ÙŠØ¯ Ø·Ù„Ø¨ Ø§Ù„Ù…Ù†ØªØ¬: ${productName}`;
    const url = `https://wa.me/${phoneNumber.replace(/\D/g,'')}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
}

document.addEventListener("DOMContentLoaded", loadSearchProducts);
