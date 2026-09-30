// Données initiales par défaut (avec score équivalent au tier : S=10, A=8, B=6, C=4)
const defaultBooks = [
    { id: 1, title: "Dune", author: "Frank Herbert", year: 1965, tier: "Tier S", desc: "Chef-d'œuvre de la science-fiction sur Arrakis.", comment: "Absolument monumental." },
    { id: 2, title: "Les Faux-monnayeurs", author: "André Gide", year: 1925, tier: "Tier S", desc: "Roman sur l'écriture et la jeunesse.", comment: "Complexe et fascinant." },
    { id: 3, title: "1984", author: "George Orwell", year: 1949, tier: "Tier A", desc: "Dystopie totalitaire intemporelle.", comment: "Glauque mais brillant." },
    { id: 4, title: "La Peste", author: "Albert Camus", year: 1947, tier: "Tier A", desc: "Chronique d'une épidémie à Oran.", comment: "Philosophique." },
    { id: 5, title: "La Ferme des Animaux", author: "George Orwell", year: 1945, tier: "Tier B", desc: "Allégorie politique animalière.", comment: "Rapide et efficace." }
];

let books = JSON.parse(localStorage.getItem('noctra_books_v2')) || defaultBooks;

function saveBooks() {
    localStorage.setItem('noctra_books_v2', JSON.stringify(books));
}

// Convertit le tier en score caché pour calculer la moyenne des auteurs
function getTierScore(tierName) {
    if (tierName === 'Tier S') return 10;
    if (tierName === 'Tier A') return 8;
    if (tierName === 'Tier B') return 6;
    return 4; // Tier C
}

function switchView(viewName) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    
    if(viewName === 'tiers') {
        document.getElementById('view-tiers').classList.add('active');
        document.querySelector('nav button:nth-child(1)').classList.add('active');
        renderTiers();
    } else if(viewName === 'all-books') {
        document.getElementById('view-all-books').classList.add('active');
        document.querySelector('nav button:nth-child(2)').classList.add('active');
        renderAllBooks();
    } else if(viewName === 'authors') {
        document.getElementById('view-authors').classList.add('active');
        document.querySelector('nav button:nth-child(3)').classList.add('active');
        renderAuthorsRanking();
    } else if(viewName === 'admin') {
        document.getElementById('view-admin').classList.add('active');
        document.querySelector('nav button:nth-child(4)').classList.add('active');
    }
}

// Rendu de la vue par Tiers avec options de tri par tier
function renderTiers() {
    const container = document.getElementById('tiers-container');
    container.innerHTML = '';
    
    const tierNames = ["Tier S", "Tier A", "Tier B", "Tier C"];
    
    tierNames.forEach(tName => {
        let tierBooks = books.filter(b => b.tier === tName);
        
        // Récupérer la valeur du tri sélectionné (ou défaut par titre)
        let sortCriteria = document.getElementById(`sort-${tName}`) ? document.getElementById(`sort-${tName}`).value : 'title';
        
        tierBooks.sort((a, b) => {
            if(sortCriteria === 'title') return a.title.localeCompare(b.title);
            if(sortCriteria === 'author') return a.author.localeCompare(b.author);
            if(sortCriteria === 'year') return a.year - b.year;
            if(sortCriteria === 'desc') return (a.desc || '').localeCompare(b.desc || '');
            return 0;
        });

        let html = `
            <div class="tier-block">
                <div class="tier-header">
                    <h2>${tName}</h2>
                    <div class="sort-controls">
                        <label>Trier : </label>
                        <select id="sort-${tName}" onchange="renderTiers()">
                            <option value="title" ${sortCriteria === 'title' ? 'selected' : ''}>Titre</option>
                            <option value="author" ${sortCriteria === 'author' ? 'selected' : ''}>Auteur</option>
                            <option value="year" ${sortCriteria === 'year' ? 'selected' : ''}>Année</option>
                            <option value="desc" ${sortCriteria === 'desc' ? 'selected' : ''}>Descriptif</option>
                        </select>
                    </div>
                </div>
                <div class="book-list-vertical">
        `;
        
        if(tierBooks.length === 0) {
            html += `<p style="color: var(--text-muted); font-size: 0.85rem;">Aucun livre dans ce tier.</p>`;
        } else {
            tierBooks.forEach(book => {
                html += `
                    <div class="book-row">
                        <div class="book-row-info" onclick="showBookDetail(${book.id})">
                            <div class="book-title">${book.title} <span style="font-weight:normal; font-size:0.8rem; color:var(--text-muted);">(${book.year})</span></div>
                            <div class="book-meta">Par ${book.author}</div>
                            ${book.desc ? `<div class="book-desc-preview">${book.desc}</div>` : ''}
                        </div>
                        <button class="action-btn" onclick="showBookDetail(${book.id})">Modifier / Détails</button>
                    </div>
                `;
            });
        }
        html += `</div></div>`;
        container.innerHTML += html;
    });
}

// Rendu de la grande page listant tous les livres
function renderAllBooks() {
    const container = document.getElementById('all-books-container');
    container.innerHTML = '';
    
    let sortCriteria = document.getElementById('global-sort-select').value;
    let sortedBooks = [...books];

    sortedBooks.sort((a, b) => {
        if(sortCriteria === 'title') return a.title.localeCompare(b.title);
        if(sortCriteria === 'author') return a.author.localeCompare(b.author);
        if(sortCriteria === 'year') return a.year - b.year;
        if(sortCriteria === 'tier') return a.tier.localeCompare(b.tier);
        return 0;
    });

    sortedBooks.forEach(book => {
        container.innerHTML += `
            <div class="book-row">
                <div class="book-row-info" onclick="showBookDetail(${book.id})">
                    <div class="book-title">${book.title} <span style="font-size:0.8rem; color:var(--accent);">[${book.tier}]</span></div>
                    <div class="book-meta">Par ${book.author} (${book.year})</div>
                    ${book.desc ? `<div class="book-desc-preview">${book.desc}</div>` : ''}
                </div>
                <button class="action-btn" onclick="showBookDetail(${book.id})">Gérer</button>
            </div>
        `;
    });
}

// Calcul des stats auteurs
function getAuthorsStats() {
    let authorsMap = {};
    books.forEach(book => {
        if(!authorsMap[book.author]) {
            authorsMap[book.author] = { name: book.author, books: [], totalScore: 0 };
        }
        authorsMap[book.author].books.push(book);
        authorsMap[book.author].totalScore += getTierScore(book.tier);
    });

    let authorsList = Object.values(authorsMap).map(author => {
        author.average = author.totalScore / author.books.length;
        return author;
    });

    let sortCriteria = document.getElementById('author-sort-select') ? document.getElementById('author-sort-select').value : 'score';
    if(sortCriteria === 'alpha') {
        authorsList.sort((a, b) => a.name.localeCompare(b.name));
    } else {
        authorsList.sort((a, b) => b.average - a.average);
    }

    return authorsList;
}

function renderAuthorsRanking() {
    const container = document.getElementById('ranking-container');
    container.innerHTML = '';
    let authors = getAuthorsStats();

    authors.forEach((author, index) => {
        container.innerHTML += `
            <div class="ranking-item" onclick="showAuthorDetail('${author.name}')">
                <div class="rank-number">0${index + 1}</div>
                <div class="author-info">
                    <h3 style="font-size: 1rem;">${author.name}</h3>
                    <p style="font-size: 0.8rem; color: var(--text-muted);">${author.books.length} livre(s) répertorié(s)</p>
                </div>
                <div class="author-score">${author.average.toFixed(1)} / 10</div>
            </div>
        `;
    });
}

// Page de détail/modification d'un livre (cliquer sur un livre)
function showBookDetail(bookId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById('view-book-detail').classList.add('active');

    let book = books.find(b => b.id === bookId);
    let container = document.getElementById('book-detail-content');

    container.innerHTML = `
        <h2 style="font-size: 1.4rem; margin-bottom: 20px; color: var(--accent);">Modifier l'œuvre</h2>
        <form onsubmit="handleBookUpdate(event, ${book.id})">
            <div class="form-group">
                <label>Titre du livre</label>
                <input type="text" id="edit-title" value="${book.title}" required>
            </div>
            <div class="form-group">
                <label>Auteur</label>
                <input type="text" id="edit-author" value="${book.author}" required>
            </div>
            <div class="form-group">
                <label>Année de parution</label>
                <input type="number" id="edit-year" value="${book.year}" required>
            </div>
            <div class="form-group">
                <label>Tier</label>
                <select id="edit-tier">
                    <option value="Tier S" ${book.tier === 'Tier S' ? 'selected' : ''}>Tier S</option>
                    <option value="Tier A" ${book.tier === 'Tier A' ? 'selected' : ''}>Tier A</option>
                    <option value="Tier B" ${book.tier === 'Tier B' ? 'selected' : ''}>Tier B</option>
                    <option value="Tier C" ${book.tier === 'Tier C' ? 'selected' : ''}>Tier C</option>
                </select>
            </div>
            <div class="form-group">
                <label>Descriptif</label>
                <textarea id="edit-desc" rows="3">${book.desc || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Commentaire personnel</label>
                <textarea id="edit-comment" rows="3">${book.comment || ''}</textarea>
            </div>
            <div style="display: flex; gap: 10px;">
                <button type="submit" class="submit-btn" style="flex: 2;">Mettre à jour</button>
                <button type="button" class="action-btn" onclick="deleteBook(${book.id})" style="flex: 1; border-color: #a00; color: #ff5555;">Supprimer</button>
            </div>
        </form>
    `;
}

function handleBookUpdate(event, bookId) {
    event.preventDefault();
    let book = books.find(b => b.id === bookId);
    if(book) {
        book.title = document.getElementById('edit-title').value;
        book.author = document.getElementById('edit-author').value.trim();
        book.year = parseInt(document.getElementById('edit-year').value);
        book.tier = document.getElementById('edit-tier').value;
        book.desc = document.getElementById('edit-desc').value;
        book.comment = document.getElementById('edit-comment').value;
        saveBooks();
        switchView('tiers');
    }
}

function deleteBook(bookId) {
    if(confirm('Voulez-vous vraiment supprimer ce livre ?')) {
        books = books.filter(b => b.id !== bookId);
        saveBooks();
        switchView('tiers');
    }
}

// Page de détail d'un auteur
function showAuthorDetail(authorName) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById('view-author-detail').classList.add('active');

    let authors = getAuthorsStats();
    let author = authors.find(a => a.name === authorName);

    let container = document.getElementById('author-detail-content');
    let booksHtml = author.books.map(b => `
        <li style="margin-bottom: 10px; list-style: none; background: #141414; padding: 15px; border: 1px solid var(--border-color); cursor: pointer;" onclick="showBookDetail(${b.id})">
            <div style="display: flex; justify-content: space-between;">
                <strong>${b.title} (${b.year})</strong>
                <span style="color: var(--accent); font-family: 'Cinzel';">${b.tier}</span>
            </div>
            ${b.desc ? `<p style="font-size:0.85rem; color:var(--text-muted); margin-top:5px;">${b.desc}</p>` : ''}
            ${b.comment ? `<p style="font-size:0.85rem; color:#aaa; margin-top:5px; font-style:italic;">Commentaire : "${b.comment}"</p>` : ''}
        </li>
    `).join('');

    container.innerHTML = `
        <h2 style="font-size: 1.8rem; margin-bottom: 5px; color: var(--accent);">${author.name}</h2>
        <p style="color: var(--text-muted); margin-bottom: 20px;">Score moyen global : <strong>${author.average.toFixed(1)} / 10</strong></p>
        <h3 style="font-size: 1rem; margin-bottom: 15px; border-bottom: 1px solid var(--border-color); padding-bottom: 5px;">Œuvres répertoriées :</h3>
        <ul>${booksHtml}</ul>
    `;
}

// Soumission du formulaire d'ajout
function handleFormSubmit(event) {
    event.preventDefault();
    
    const newBook = {
        id: Date.now(),
        title: document.getElementById('book-title').value,
        author: document.getElementById('book-author').value.trim(),
        year: parseInt(document.getElementById('book-year').value),
        tier: document.getElementById('book-tier').value,
        desc: document.getElementById('book-desc').value,
        comment: document.getElementById('book-comment').value
    };

    books.push(newBook);
    saveBooks();

    document.getElementById('add-book-form').reset();
    switchView('tiers');
}

// Initialisation
renderTiers();
