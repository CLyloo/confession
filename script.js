// Données par défaut ou issues de LocalStorage
let books = JSON.parse(localStorage.getItem('my_books_data')) || [
    { id: 1, author: "Luc Ferrari", title: "L'œuvre électronique", tags: "#Musique #Electro #Avangarde", year: 2009, rating: 5 },
    { id: 2, author: "Orchestre et chœur de la Radio-Télévision de Cracovie", title: "Œuvre intégrale pour chœur et orchestre symphonique", tags: "#Classique #Symphonie", year: 1990, rating: 5 },
    { id: 3, author: "Bernard Parmegiani", title: "L'œuvre musicale", tags: "#Electro #Acousmatique", year: 2008, rating: 5 },
    { id: 4, author: "Henri Pousseur", title: "Paysages planétaires", tags: "#Classique #Contemporain", year: 2004, rating: 4 },
    { id: 5, author: "Victor Hugo", title: "Les Misérables", tags: "#Classics #France #Fiction #19thCentury", year: 1862, rating: 5 },
    { id: 6, author: "Gustave Flaubert", title: "Madame Bovary", tags: "#Classics #France #Fiction", year: 1857, rating: 4 }
];

let currentView = 'books';
let currentSort = { field: 'author', asc: true };
let currentAuthorSort = { field: 'name', asc: true };

function saveData() {
    localStorage.setItem('my_books_data', JSON.stringify(books));
}

function switchView(view) {
    currentView = view;
    document.getElementById('nav-books').classList.toggle('active', view === 'books');
    document.getElementById('nav-authors').classList.toggle('active', view === 'authors');
    document.getElementById('view-books').style.display = view === 'books' ? 'block' : 'none';
    document.getElementById('view-authors').style.display = view === 'authors' ? 'block' : 'none';
    document.getElementById('page-title').innerText = view === 'books' ? 'Bibliothèque' : 'Auteurs';

    if (view === 'books') renderBooks();
    if (view === 'authors') renderAuthors();
}

// --- GESTION DES LIVRES ---
function renderBooks() {
    const tbody = document.getElementById('books-tbody');
    tbody.innerHTML = '';

    const search = document.getElementById('search-input').value.toLowerCase();
    const selectedTag = document.getElementById('tag-filter').value;
    const selectedRating = document.getElementById('rating-filter').value;

    updateTagDropdown();

    let filtered = books.filter(b => {
        const matchesSearch = b.author.toLowerCase().includes(search) || b.title.toLowerCase().includes(search) || b.tags.toLowerCase().includes(search);
        const matchesTag = !selectedTag || b.tags.includes(selectedTag);
        const matchesRating = !selectedRating || b.rating == selectedRating;
        return matchesSearch && matchesTag && matchesRating;
    });

    filtered.sort((a, b) => {
        let valA = a[currentSort.field];
        let valB = b[currentSort.field];
        if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }
        if (valA < valB) return currentSort.asc ? -1 : 1;
        if (valA > valB) return currentSort.asc ? 1 : -1;
        return 0;
    });

    filtered.forEach(book => {
        const tr = document.createElement('tr');
        tr.className = 'clickable-row';
        tr.onclick = () => openEditBookModal(book.id);

        let tagsHtml = book.tags.split(' ').map(tag => {
            if(!tag.startsWith('#')) return tag;
            return `<span class="tag-badge" onclick="event.stopPropagation(); filterByTag('${tag}')">${tag}</span>`;
        }).join(' ');

        tr.innerHTML = `
            <td class="col-author">${escapeHtml(book.author)}</td>
            <td class="col-title">${escapeHtml(book.title)}</td>
            <td class="col-tags">${tagsHtml}</td>
            <td class="col-year">${book.year}</td>
            <td class="col-rating">${'★'.repeat(book.rating)}${'☆'.repeat(5 - book.rating)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function setSort(field) {
    if (currentSort.field === field) {
        currentSort.asc = !currentSort.asc;
    } else {
        currentSort.field = field;
        currentSort.asc = true;
    }
    renderBooks();
}

function filterByTag(tag) {
    document.getElementById('tag-filter').value = tag;
    renderBooks();
}

function updateTagDropdown() {
    const select = document.getElementById('tag-filter');
    const currentVal = select.value;
    let tagsSet = new Set();
    books.forEach(b => {
        b.tags.split(' ').forEach(t => {
            if(t.startsWith('#')) tagsSet.add(t);
        });
    });

    select.innerHTML = '<option value="">Tous les descripteurs (#)</option>';
    Array.from(tagsSet).sort().forEach(tag => {
        const opt = document.createElement('option');
        opt.value = tag;
        opt.textContent = tag;
        select.appendChild(opt);
    });
    select.value = currentVal;
}

// --- GESTION DES AUTEURS ---
function renderAuthors() {
    const tbody = document.getElementById('authors-tbody');
    tbody.innerHTML = '';

    let authorMap = {};
    books.forEach(b => {
        if (!authorMap[b.author]) {
            authorMap[b.author] = { name: b.author, books: [], totalRating: 0 };
        }
        authorMap[b.author].books.push(b);
        authorMap[b.author].totalRating += b.rating;
    });

    let authorsList = Object.values(authorMap).map(a => {
        return {
            name: a.name,
            count: a.books.length,
            avgRating: (a.totalRating / a.books.length).toFixed(2),
            books: a.books
        };
    });

    authorsList.sort((a, b) => {
        let valA = a[currentAuthorSort.field];
        let valB = b[currentAuthorSort.field];
        if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }
        if (valA < valB) return currentAuthorSort.asc ? -1 : 1;
        if (valA > valB) return currentAuthorSort.asc ? 1 : -1;
        return 0;
    });

    authorsList.forEach(auth => {
        const tr = document.createElement('tr');
        tr.className = 'clickable-row';
        tr.onclick = () => openAuthorDetails(auth.name);
        tr.innerHTML = `
            <td class="col-author-name">${escapeHtml(auth.name)}</td>
            <td class="col-author-count">${auth.count} livre(s)</td>
            <td class="col-author-avg">${auth.avgRating} / 5</td>
        `;
        tbody.appendChild(tr);
    });
}

function setAuthorSort(field) {
    if (currentAuthorSort.field === field) {
        currentAuthorSort.asc = !currentAuthorSort.asc;
    } else {
        currentAuthorSort.field = field;
        currentAuthorSort.asc = true;
    }
    renderAuthors();
}

function openAuthorDetails(authorName) {
    document.getElementById('modal-author-title').innerText = `Auteur : ${authorName}`;
    const container = document.getElementById('author-books-list');
    container.innerHTML = '';

    const authorBooks = books.filter(b => b.author === authorName);
    authorBooks.forEach(b => {
        const div = document.createElement('div');
        div.style.padding = "8px 0";
        div.style.borderBottom = "1px solid #ddd";
        div.style.display = "flex";
        div.style.justifyContent = "space-between";
        div.style.alignItems = "center";
        div.innerHTML = `
            <div>
                <strong>${escapeHtml(b.title)}</strong> (${b.year})<br>
                <span style="font-size:0.8rem; color:#666;">${b.tags}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <span>${'★'.repeat(b.rating)}${'☆'.repeat(5 - b.rating)}</span>
                <button onclick="closeModal('author-modal'); openEditBookModal(${b.id})">Modifier</button>
            </div>
        `;
        container.appendChild(div);
    });

    document.getElementById('author-modal').style.display = 'flex';
}

// --- MODALES ET FORMULAIRES ---
function openAddBookModal() {
    document.getElementById('modal-book-title').innerText = "Ajouter un livre";
    document.getElementById('book-edit-id').value = '';
    document.getElementById('input-author').value = '';
    document.getElementById('input-title').value = '';
    document.getElementById('input-tags').value = '#';
    document.getElementById('input-year').value = new Date().getFullYear();
    document.getElementById('input-rating').value = '5';
    document.getElementById('delete-book-btn').style.display = 'none';
    document.getElementById('book-modal').style.display = 'flex';
}

function openEditBookModal(id) {
    const book = books.find(b => b.id === id);
    if(!book) return;
    document.getElementById('modal-book-title').innerText = "Modifier le livre";
    document.getElementById('book-edit-id').value = book.id;
    document.getElementById('input-author').value = book.author;
    document.getElementById('input-title').value = book.title;
    document.getElementById('input-tags').value = book.tags;
    document.getElementById('input-year').value = book.year;
    document.getElementById('input-rating').value = book.rating;
    document.getElementById('delete-book-btn').style.display = 'block';
    document.getElementById('book-modal').style.display = 'flex';
}

function saveBook() {
    const id = document.getElementById('book-edit-id').value;
    const author = document.getElementById('input-author').value.trim();
    const title = document.getElementById('input-title').value.trim();
    const tags = document.getElementById('input-tags').value.trim();
    const year = parseInt(document.getElementById('input-year').value) || 2026;
    const rating = parseInt(document.getElementById('input-rating').value);

    if(!author || !title) {
        alert("L'auteur et le titre sont obligatoires.");
        return;
    }

    if (id) {
        const book = books.find(b => b.id == id);
        if(book) {
            book.author = author;
            book.title = title;
            book.tags = tags;
            book.year = year;
            book.rating = rating;
        }
    } else {
        const newId = books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;
        books.push({ id: newId, author, title, tags, year, rating });
    }

    saveData();
    closeModal('book-modal');
    if (currentView === 'books') renderBooks();
    if (currentView === 'authors') renderAuthors();
}

function deleteCurrentBook() {
    const id = document.getElementById('book-edit-id').value;
    if(id && confirm("Voulez-vous vraiment supprimer ce livre ?")) {
        books = books.filter(b => b.id != id);
        saveData();
        closeModal('book-modal');
        if (currentView === 'books') renderBooks();
        if (currentView === 'authors') renderAuthors();
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

renderBooks();
