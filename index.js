let form = $(".form");
let nameInp = $(".name-inp");
let surnameInp = $(".surname-inp");
let numberInp = $(".number-inp");
let weekINp = $(".week-inp");
let monthInp = $(".month-inp");
let btn = $(".btn");
let studentList = $(".student-list");
let modalEdit = $(".modal-edit");

form.submit(function (e) {
  e.preventDefault();
  if (!Array.from($(".inp")).every((inp) => inp.value.trim() != "")) return;
  let newStudent = {
    name: nameInp.val(),
    surname: surnameInp.val(),
    number: numberInp.val(),
    weekKPI: weekINp.val(),
    monthKPI: monthInp.val(),
  };
  addnewStudent(newStudent);
  $(".form input").val("");
});

function addnewStudent(student) {
  fetch("http://localhost:8000/student", {
    method: "POST",
    headers: { "Content-Type": "application/json;charset=utf-8" },
    body: JSON.stringify(student),
  }).then(() =>
    fetchProducts(`${API}?_page=${currentPage}&_limit=3`).then((total) => {
      renderPagination(total);
    })
  );
}

$("body").on("click", ".btn-delete", function (e) {
  let id = e.target.parentNode.id;
  fetch(`http://localhost:8000/student/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json;charset=utf-8" },
  })
    .then(() =>
      fetchProducts(`${API}?_page=${currentPage}&_limit=3`).then((total) => {
        renderPagination(total);
      })
    )
    .catch(() =>
      fetchProducts(`${API}?_page=${currentPage}&_limit=3`).then((total) => {
        renderPagination(total);
      })
    );
});

//Изменение данных студента

$("body").on("click", ".btn-edit", function (e) {
  modalEdit.css("display", "flex");
  modalEdit.html(
    `<div class="student-modal">
            <input class="inp-modal name-inp-edit" type="text" value = "${e.target.parentNode.firstChild.nextSibling.innerText.slice(
              5
            )}">
            <input class="inp-modal surname-inp-edit" type="text" value = "${e.target.parentNode.children[1].innerText.slice(
              9
            )}">
            <input class="inp-modal number-inp-edit" type="number" value = "${e.target.parentNode.children[2].innerText.slice(
              7
            )}">
            <input class="inp-modal week-inp-edit" type="number" value = "${e.target.parentNode.children[3].innerText.slice(
              14
            )}">
            <input class="inp-modal month-inp-edit" type="number" value = "${e.target.parentNode.children[4].innerText.slice(
              14
            )}">
            <button class="btn-save">Save</button>
            <button class="btn-escape">Escape</button>
        <div>`
  );
  //Сохранение изменений
  $("body").one("click", ".btn-save", function () {
    let editedstudent = {
      name: $(".student-modal .name-inp-edit").val(),
      surname: $(".student-modal .surname-inp-edit").val(),
      number: $(".student-modal .number-inp-edit").val(),
      weekKPI: $(".student-modal .week-inp-edit").val(),
      monthKPI: $(".student-modal .month-inp-edit").val(),
    };
    modalEdit.css("display", "none");
    fetch(`http://localhost:8000/student/${e.target.parentNode.id}`, {
      method: "PATCH",
      headers: { "Content-type": "application/json;charset=utf-8" },
      body: JSON.stringify(editedstudent),
    }).then(() =>
      fetchProducts(`${API}?_page=${currentPage}&_limit=3`).then((total) => {
        renderPagination(total);
      })
    );
  });
  //Отмена изменений
  $("body").on("click", ".btn-escape", function () {
    modalEdit.css("display", "none");
  });
});

//Поиск

$(".search-form input").on("input", function () {
  searchRender();
});
$(".search-form input").on("blur", function () {
  fetchProducts(`${API}?_page=${currentPage}&_limit=3`).then((total) => {
    renderPagination(total);
  });
});

async function searchRender() {
  fetch(`http://localhost:8000/student?q=${$(".search-form input").val()}`)
    .then((response) => response.json())
    .then((data) => {
      studentList.empty();
      data.forEach((person) => {
        studentList.append(
          `
                    <div id="${person.id}" class="student">
                        <h5>Имя: ${person.name}</h5>
                        <h5>Фамилия: ${person.surname}</h5>
                        <h5>Номер: ${person.number}</h5>
                        <h5>Неделный KPI: ${person.weekKPI}</h5>
                        <h5>Месячный KPI: ${person.monthKPI}</h5>
                        <button class="btn-delete">Delete</button>
                        <button class="btn-edit">Change</button>
                    <div>
                    `
        );
      });
    });
}

//Пагинация
const API = "http://localhost:8000/student";
let currentPage = 1;
const paginateContainer = $(".pagination");

const fetchProducts = async (url) => {
  try {
    let response = await fetch(url);
    let data = await response.json();
    const total = response.headers.get("X-Total-Count");
    renderProducts(data);
    return total;
  } catch (e) {
    console.log(e);
  }
};
const renderProducts = (data) => {
  studentList.html("");
  data.forEach((person) => {
    studentList.append(
      `
            <div id="${person.id}" class="student">
                <h5>Имя: ${person.name}</h5>
                <h5>Фамилия: ${person.surname}</h5>
                <h5>Номер: ${person.number}</h5>
                <h5>Неделный KPI: ${person.weekKPI}</h5>
                <h5>Месячный KPI: ${person.monthKPI}</h5>
                <button class="btn-delete">Delete</button>
                <button class="btn-edit">Change</button>
            <div>
            `
    );
  });
};

const renderPagination = (total) => {
  const pages = Math.ceil(total / 3);
  paginateContainer.empty();
  for (let i = 1; i <= pages; i++) {
    paginateContainer.append(`
        <a href="#" class="page-item ${
          i === currentPage ? "active" : ""
        }" data-page="${i}">${i}</a>
        `);
  }
};

$("body").on("click", ".page-item", function (e) {
  currentPage = e.target.dataset.page;
  $(this).siblings().removeClass("active");
  $(this).addClass("active");
  fetchProducts(`${API}?_page=${currentPage}&_limit=3`);
});

$(document).ready(() => {
  fetchProducts(`${API}?_page=${currentPage}&_limit=3`).then((total) => {
    renderPagination(total);
  });
});
