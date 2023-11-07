const bookStorage = [];
const RENDER_EVENT = 'render-books';
const SAVED_EVENT = 'saved-books';
const STORAGE_KEY = 'books';

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

function findBook(bookId) {
    for (const bookItem of bookStorage) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function findBookIndex(bookId) {
    for (const index in bookStorage) {
        if (bookStorage[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(bookStorage);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}


function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            bookStorage.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}


function makeBook(bookObject) {
    const { id, title, author, year, isComplete } = bookObject;

    const textJudul = document.createElement('h2');
    textJudul.innerText = title;

    const textPenulis = document.createElement('p');
    textPenulis.innerText = "Penulis : " + author;

    const textTahun = document.createElement('p');
    textTahun.innerText = "Tahun : " + year;

    const textContainer = document.createElement('div');
    textContainer.classList.add('inner');
    textContainer.append(textJudul, textPenulis, textTahun);

    const container = document.createElement('div');
    container.classList.add('item', 'shadow')
    container.append(textContainer);
    container.setAttribute('id', `book-${id}`);

    if (isComplete) {
        const undoButton = document.createElement('button');
        undoButton.classList.add('undo-button');
        undoButton.innerHTML = `<i class="fa fa-undo" aria-hidden="true"></i> Belum Dibaca`;
        undoButton.addEventListener('click', function () {
            undoTaskFromCompleted(id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button');
        trashButton.innerHTML = `<i class="fa fa-trash" aria-hidden="true"></i> Hapus`;
        trashButton.onclick = function () { mydelete(id) };

        container.append(undoButton, trashButton);
    } else {
        const checkButton = document.createElement('button');
        checkButton.classList.add('check-button');
        checkButton.innerHTML = `<i class="fas fa-check-circle" aria-hidden="true"></i> Selesai Dibaca`;
        checkButton.addEventListener('click', function () {
            addTaskToCompleted(id);
        });
        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button');
        trashButton.innerHTML = `<i class="fa fa-trash" aria-hidden="true"></i> Hapus`;
        trashButton.onclick = function () { mydelete(id) };

        container.append(checkButton, trashButton);
    }

    return container;
}

function addBook() {
    const textJudul = document.getElementById('judul').value;
    const textPenulis = document.getElementById('penulis').value;
    const textTahun = document.getElementById('tahun').value;
    const iscomplete = document.getElementById('iscomplete').checked;

    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, textJudul, textPenulis, textTahun, iscomplete);
    bookStorage.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function addTaskToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeTaskFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    bookStorage.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoTaskFromCompleted(bookId) {

    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

document.addEventListener('DOMContentLoaded', function () {

    const submitForm = document.getElementById('form');
    const inputs = document.querySelectorAll('#judul, #penulis, #tahun');

    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();

        inputs.forEach(input => {
            input.value = '';
        });

        document.getElementById("iscomplete").checked = false;

        Swal.fire({
            title: 'Berhasil Menambahkan Buku',
            background: '#fff',
            color: "#000",
            timer: 1750,
            timerProgressBar: true,
        })

    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});

document.addEventListener(RENDER_EVENT, function () {
    const uncompletedBookList = document.getElementById('books');
    const listCompleted = document.getElementById('completedBooks');

    uncompletedBookList.innerHTML = '';
    listCompleted.innerHTML = '';

    for (const bookItem of bookStorage) {
        const bookElement = makeBook(bookItem);
        if (bookItem.isComplete) {
            listCompleted.append(bookElement);
        } else {
            uncompletedBookList.append(bookElement);
        }
    }
})

function search() {
    var input = document.getElementById("search");
    var filter = input.value.toUpperCase();
    var item = document.getElementsByClassName("item");
    var i;
    for (i = 0; i < item.length; i++) {
        var a = item[i].getElementsByTagName("h2")[0];
        if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
            item[i].style.display = "";
        } else{
            item[i].style.display = "none";
        }
    }
}

function mydelete(bookId) {
    var id = bookId;
    Swal.fire({
        title: 'Anda Yakin Untuk Menghapus Buku Ini?',
        color: "#000",
        icon: 'warning',
        background: '#fff',
        showCancelButton: true,
        confirmButtonColor: '#FF5A82',
        cancelButtonColor: '#198754',
        confirmButtonText: 'Ya, Hapus Sekarang!'
    }).then((result) => {
        if (result.isConfirmed) {
            removeTaskFromCompleted(id)
            Swal.fire({
                background: '#fff',
                color: "#000",
                title: 'Buku Berhasil Dihapus',
            })
        } else {
            return 0;
        }
    })
}