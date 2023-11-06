const todos = [];
const RENDER_EVENT = 'render-todo';
const SAVED_EVENT = 'saved-todo';
const STORAGE_KEY = 'TODO_APPS';

function generateId() {
    return +new Date();
}

function generateTodoObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

function findTodo(todoId) {
    for (const todoItem of todos) {
        if (todoItem.id === todoId) {
            return todoItem;
        }
    }
    return null;
}

function findTodoIndex(todoId) {
    for (const index in todos) {
        if (todos[index].id === todoId) {
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
        const parsed = JSON.stringify(todos);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}


function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const todo of data) {
            todos.push(todo);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}


function makeTodo(todoObject) {
    const { id, title, author, year, isComplete } = todoObject;

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
    container.setAttribute('id', `todo-${id}`);

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

function addTodo() {
    const textJudul = document.getElementById('judul').value;
    const textPenulis = document.getElementById('penulis').value;
    const textTahun = document.getElementById('tahun').value;
    const iscomplete = document.getElementById('iscomplete').checked;

    const generatedID = generateId();
    const todoObject = generateTodoObject(generatedID, textJudul, textPenulis, textTahun, iscomplete);
    todos.push(todoObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function addTaskToCompleted(todoId) {
    const todoTarget = findTodo(todoId);

    if (todoTarget == null) return;

    todoTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeTaskFromCompleted(todoId) {
    const todoTarget = findTodoIndex(todoId);

    if (todoTarget === -1) return;

    todos.splice(todoTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoTaskFromCompleted(todoId) {

    const todoTarget = findTodo(todoId);
    if (todoTarget == null) return;

    todoTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

document.addEventListener('DOMContentLoaded', function () {

    const submitForm = document.getElementById('form');
    const inputs = document.querySelectorAll('#judul, #penulis, #tahun');

    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addTodo();

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
    const uncompletedTODOList = document.getElementById('todos');
    const listCompleted = document.getElementById('completed-todos');

    uncompletedTODOList.innerHTML = '';
    listCompleted.innerHTML = '';

    for (const todoItem of todos) {
        const todoElement = makeTodo(todoItem);
        if (todoItem.isComplete) {
            listCompleted.append(todoElement);
        } else {
            uncompletedTODOList.append(todoElement);
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

function mydelete(todoId) {
    var id = todoId;
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