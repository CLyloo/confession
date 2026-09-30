// Données initiales par défaut (si le stockage est vide)
const defaultBooks = [
    { id: 1, title: "Dune", author: "Frank Herbert", tier: "Tier S", score: 10 },
    { id: 2, title: "Les Faux-monnayeurs", author: "André Gide", tier: "Tier S", score: 9.5 },
    { id: 3, title: "1984", author: "George Orwell", tier: "Tier A", score: 8.5 },
    { id: 4, title: "La Peste", author: "Albert Camus", tier: "Tier A", score: 8 },
    { id: 5, title: "La Ferme des Animaux", author: "George Orwell", tier: "Tier B", score: 6.5 }
];

// Chargement depuis le localStorage ou initialisation
let books = JSON.parse(localStorage.getItem('noctra_books')) || defaultBooks;

function saveBooks() {
    localStorage.setItem('noctra_books', JSON.stringify(books));
}

function switchView(viewName) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    
    if(viewName === 'tiers') {
        document.getElementById('view-tiers').classList.add('active');
        document.querySelector('nav button:nth-child(1)').classList.add('active');
        renderTiers();
    } else if(viewName === 'authors') {
        document.getElementById('view-authors').classList.add('active');
        document.querySelector('nav button:nth-child(2)').classList.add('active');
        renderAuthorsRanking();
    } else if(viewName === 'admin') {
        document.getElementById('view-admin').classList.add('active');
        document.querySelector('nav button:nth-child(3)').classList.add('active');
    }
}

function renderTiers() {
    const container = document.getElementById('tiers-container');
    container.innerHTML = '';
    
    // Regrouper par Tiers existants
    const tierNames = ["Tier S", "Tier A", "Tier B", "Tier C"];
    
    tierNames.forEach(tName => {
        const tierBooks = books.filter(b => b.tier === tName);
        
        let html = `
            <div class="tier-block">
                <div class="tier-header">
                    <h2>${tName}</h2>
                </div>
                <div class="book-grid">
        `;
        
        if(tierBooks.length === 0) {
            html += `<p style="color: var(--text-muted); font-size: 0.85rem;">Aucun livre dans ce tier.</p>`;
        } else {
            tierBooks.forEach(book => {
                html += `
                    <div class="book-card">
                        <div>
                            <div class="book-title">${book.title}</div>
                            <div class="book-author" onclick="showAuthorDetail('${book.author}')">${book.author}</div>
                        </div>
                        <div class="book-footer">
                            <span class="book-score">${book.score}/10</span>
                            <select class="tier-changer" onchange="changeBookTier(${book.id}, this.value)">
                                <option value="Tier S" ${book.tier === 'Tier S' ? 'selected' : ''}>Tier S</option>
                                <option value="Tier A" ${book.tier === 'Tier A' ? 'selected' : ''}>Tier A</option>
                                <option value="Tier B" ${book.tier === 'Tier B' ? 'selected' : ''}>Tier B</option>
                                <option value="Tier C" ${book.tier === 'Tier C' ? 'selected' : ''}>Tier C</option>
                            </select>
                        </div>
                    </div>
                `;
            });
        }
        html += `</div></div>`;
        container.innerHTML += html;
    });
}

function changeBookTier(bookId, newTier) {
    const book = books.find(b => b.id === bookId);
    if(book) {
        book.tier = newTier;
        saveBooks();
        renderTiers();
    }
}

function getAuthorsStats() {
    let authorsMap = {};
    books.forEach(book => {
        if(!authorsMap[book.author]) {
            authorsMap[book.author] = { name: book.author, books: [], totalScore: 0 };
        }
        authorsMap[book.author].books.push(book);
        authorsMap[book.author].totalScore += book.score;
    });

    let authorsList = Object.values(authorsMap).map(author => {
        author.average = author.totalScore / author.books.length;
        return author;
    });

    authorsList.sort((a, b) => b.average - a.average);
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

function showAuthorDetail(authorName) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById('view-author-detail').classList.add('active');

    let authors = getAuthorsStats();
    let author = authors.find(a => a.name === authorName);

    let container = document.getElementById('author-detail-content');
    let booksHtml = author.books.map(b => `
        <li style="margin-bottom: 10px; list-style: none; background: #141414; padding: 15px; border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <div>
                <strong>${b.title}</strong>
                <span style="display: block; font-size: 0.8rem; color: var(--text-muted);">Tier : ${b.tier}</span>
            </div>
            <span style="color: var(--accent); font-family: 'Cinzel';">${b.score}/10</span>
        </li>
    `).join('');

    container.innerHTML = `
        <h2 style="font-size: 1.8rem; margin-bottom: 5px; color: var(--accent);">${author.name}</h2>
        <p style="color: var(--text-muted); margin-bottom: 20px;">Score moyen global : <strong>${author.average.toFixed(1)} / 10</strong></p>
        <h3 style="font-size: 1rem; margin-bottom: 15px; border-bottom: 1px solid var(--border-color); padding-bottom: 5px;">Œuvres répertoriées :</h3>
        <ul>${booksHtml}</ul>
    `;
}

function handleFormSubmit(event) {
    event.preventDefault();
    
    const title = document.getElementById('book-title').value;
    const author = document.getElementById('book-author').value.trim();
    const tier = document.getElementById('book-tier').value;
    const score = parseFloat(document.getElementById('book-score').value);

    const newBook = {
        id: Date.now(), // ID unique basé sur le temps
        title,
        author,
        tier,
        score
    };

    books.push(newBook);
    saveBooks();

    // Réinitialiser le formulaire et basculer vers les tiers
    document.getElementById('add-book-form').reset();
    switchView('tiers');
}

// Initialisation au chargement de la page
renderTiers();
