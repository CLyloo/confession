// Données initiales par défaut avec tags sous forme de mots-clés
const defaultBooks = [
    { id: 1, title: "Dune", author: "Frank Herbert", year: 1965, tier: "Tier S", tags: ["Sci-Fi", "Classics", "Space"], comment: "Absolument monumental." },
    { id: 2, title: "Les Faux-monnayeurs", author: "André Gide", year: 1925, tier: "Tier S", tags: ["France", "Fiction", "Classics"], comment: "Complexe et fascinant." },
    { id: 3, title: "1984", author: "George Orwell", year: 1949, tier: "Tier A", tags: ["Dystopia", "Classics", "Politics"], comment: "Glauque mais brillant." },
    { id: 4, title: "La Peste", author: "Albert Camus", year: 1947, tier: "Tier A", tags: ["France", "Philosophy", "Classics"], comment: "Philosophique." },
    { id: 5, title: "La Ferme des Animaux", author: "George Orwell", year: 1945, tier: "Tier B", tags: ["Satire", "Politics"], comment: "Rapide et efficace." }
];

let books = JSON.parse(localStorage.getItem('noctra_books_v3')) || defaultBooks;

function saveBooks() {
    localStorage.setItem('noctra_books_v3', JSON.stringify(books));
}

function getTierScore(tierName) {
    if (tierName === 'Tier S') return 10;
    if (tierName === 'Tier A') return 8;
    if (tierName === 'Tier B') return 6;
    return 4;
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

// Fonction utilitaire pour générer les tags HTML (façon image 2)
function renderTagsHtml(tagsArray) {
    if (!tagsArray || tagsArray.length === 0) return '<span style="color:var(--text-muted);">-</span>';
    return `<div class="tags-container">` + tagsArray.map(t => `<span class="tag-badge">${t.trim()}</span>`).join('') + `</div>`;
}

// Rendu de la vue par Tiers avec tri interne fonctionnel
function renderTiers() {
    const container = document.getElementById('tiers-container');
    container.innerHTML = '';
    
    const tierNames = ["Tier S", "Tier A", "Tier B", "Tier C"];
    
    tierNames.forEach(tName => {
        let tierBooks = books.filter(b => b.tier === tName);
        
        // Récupérer le tri sélectionné pour ce tier spécifique
        let sortSelect = document.getElementById(`sort-${tName}`);
        let sortCriteria = sortSelect ? sortSelect.value : 'author';
        
        tierBooks.sort((a, b) => {
            if(sortCriteria === 'author') return a.author.localeCompare(b.author);
            if(sortCriteria === 'title') return a.title.localeCompare(b.title);
            if(sortCriteria === 'year') return a.year - b.year;
            return 0;
        });

        let rowsHtml = '';
        if(tierBooks.length === 0) {
            rowsHtml = `<tr><td colspan="4" style="color: var(--text-muted); text-align:center; padding: 15px;">Aucune œuvre dans ce tier.</td></tr>`;
        } else {
            tierBooks.forEach(book => {
                rowsHtml += `
                    <tr onclick="showBookDetail(${book.id})">
                        <td style="width: 25%; color: #fff;">${book.author}</td>
                        <td style="width: 40%;">${book.title}</td>
                        <td style="width: 15%; color: var(--text-muted);">${book.year}</td>
                        <td style="width: 20%;">${renderTagsHtml(book.tags)}</td>
                    </tr>
                `;
            });
        }

        container.innerHTML += `
            <div class="tier-section-block">
                <div class="tier-title-bar">
                    <span>${tName}</span>
                    <div class="sort-controls">
                        <label>Trier : </label>
                        <select id="sort-${tName}" onchange="renderTiers()">
                            <option value="author" ${sortCriteria === 'author' ? 'selected' : ''}>Auteur</option>
                            <option value="title" ${sortCriteria === 'title' ? 'selected' : ''}>Titre</option>
                            <option value="year" ${sortCriteria === 'year' ? 'selected' : ''}>Année</option>
                        </select>
                    </div>
                </div>
                <div class="table-container">
                    <table class="minimal-table">
                        <thead>
                            <tr>
                                <th>Artist</th>
                                <th>Release</th>
                                <th>Year</th>
                                <th>Tags</th>
                            </tr>
                        </thead>
                        <tbody>${rowsHtml}</tbody>
                    </table>
                </div>
            </div>
        `;
    });
}

// Rendu de la grande page globale
function renderAllBooks() {
    const tbody = document.getElementById('all-books-tbody');
    tbody.innerHTML = '';
    
    let sortCriteria = document.getElementById('global-sort-select').value;
    let sortedBooks = [...books];

    sortedBooks.sort((a, b) => {
        if(sortCriteria === 'author') return a.author.localeCompare(b.author);
        if(sortCriteria === 'title') return a.title.localeCompare(b.title);
        if(sortCriteria === 'year') return a.year - b.year;
        if(sortCriteria === 'tier') return a.tier.localeCompare(b.tier);
        return 0;
    });

    if(sortedBooks.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">Aucun livre répertorié.</td></tr>`;
        return;
    }

    sortedBooks.forEach(book => {
        tbody.innerHTML += `
            <tr onclick="showBookDetail(${book.id})">
                <td style="width: 25%; color: #fff;">${book.author}</td>
                <td style="width: 40%;">${book.title} <span style="font-size:0.75rem; color:var(--accent);">[${book.tier}]</span></td>
                <td style="width: 15%; color: var(--text-muted);">${book.year}</td>
                <td style="width: 20%;">${renderTagsHtml(book.tags)}</td>
            </tr>
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
                    <h3 style="font-size: 0.9rem; color:#fff;">${author.name}</h3>
                    <p style="font-size: 0.75rem; color: var(--text-muted);">${author.books.length} œuvre(s)</p>
                </div>
                <div class="author-score">${author.average.toFixed(1)} / 10</div>
            </div>
        `;
    });
}

// Page de détail et modification d'une œuvre
function showBookDetail(bookId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById('view-book-detail').classList.add('active');

    let book = books.find(b => b.id === bookId);
    let container = document.getElementById('book-detail-content');
    let tagsString = book.tags ? book.tags.join(', ') : '';

    container.innerHTML = `
        <h2>Modifier l'œuvre</h2>
        <form onsubmit="handleBookUpdate(event, ${book.id})">
            <div class="form-group">
                <label>Titre de l'œuvre</label>
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
                <label>Tags (séparés par des virgules)</label>
                <input type="text" id="edit-tags" value="${tagsString}" placeholder="ex: Classics, Fiction">
            </div>
            <div class="form-group">
                <label>Commentaire personnel</label>
                <textarea id="edit-comment" rows="3">${book.comment || ''}</textarea>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button type="submit" class="submit-btn" style="flex: 2;">Mettre à jour</button>
                <button type="button" class="action-btn" onclick="deleteBook(${book.id})" style="flex: 1; border-color: #600; color: #ff6666;">Supprimer</button>
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
        let rawTags = document.getElementById('edit-tags').value;
        book.tags = rawTags ? rawTags.split(',').map(t => t.trim()).filter(t => t.length > 0) : [];
        book.comment = document.getElementById('edit-comment').value;
        saveBooks();
        switchView('tiers');
    }
}

function deleteBook(bookId) {
    if(confirm('Voulez-vous vraiment supprimer cette œuvre ?')) {
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
    let rowsHtml = author.books.map(b => `
        <tr onclick="showBookDetail(${b.id})">
            <td style="width: 45%; color: #fff;">${b.title} (${b.year})</td>
            <td style="width: 15%; color: var(--accent);">${b.tier}</td>
            <td style="width: 40%;">${renderTagsHtml(b.tags)}</td>
        </tr>
    `).join('');

    container.innerHTML = `
        <h2 style="font-size: 1.4rem; color: #fff; margin-bottom: 5px;">${author.name}</h2>
        <p style="color: var(--text-muted); margin-bottom: 25px; font-size: 0.85rem;">Score moyen global : <strong style="color:var(--accent);">${author.average.toFixed(1)} / 10</strong></p>
        <div class="table-container">
            <table class="minimal-table">
                <thead>
                    <tr>
                        <th>Release</th>
                        <th>Tier</th>
                        <th>Tags</th>
                    </tr>
                </thead>
                <tbody>${rowsHtml}</tbody>
            </table>
        </div>
    `;
}

// Soumission du formulaire d'ajout
function handleFormSubmit(event) {
    event.preventDefault();
    
    let rawTags = document.getElementById('book-tags').value;
    let tagsArray = rawTags ? rawTags.split(',').map(t => t.trim()).filter(t => t.length > 0) : [];

    const newBook = {
        id: Date.now(),
        title: document.getElementById('book-title').value,
        author: document.getElementById('book-author').value.trim(),
        year: parseInt(document.getElementById('book-year').value),
        tier: document.getElementById('book-tier').value,
        tags: tagsArray,
        comment: document.getElementById('book-comment').value
    };

    books.push(newBook);
    saveBooks();

    document.getElementById('add-book-form').reset();
    switchView('tiers');
}

// Initialisation
renderTiers();
