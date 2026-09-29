// !----------------- Variables ---------------------------
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const apiKey = "690f61e0600ccb137ffe3040";
const baseUrl = "https://todos.routemisr.com/api/v1/";
let allTodos = [];
const loader = document.getElementById("loadingOverlay");
const todosContainer = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});
// !----------------- Events ------------------------------
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addTodo();
});

window.addEventListener("load", async () => {
  await getAllTodos();
});

todosContainer.addEventListener("click", (e) => {
  const li = e.target.closest("li.task-item");
  if (!li) return;
  let index = li.dataset.index;
  const deleteBtn = e.target.closest('[data-role="delete"]');
  const completeBtn = e.target.closest('[data-role="completeIt"]');
  if (deleteBtn) {
    deleteTodo(allTodos[index]._id);
  } else if (completeBtn) {
    markTodoAsCompleted(allTodos[index]._id, allTodos[index].completed);
  }
});
// !----------------- Functions ---------------------------
async function addTodo() {
  const newTask = {
    title: taskInput.value,
    apiKey: apiKey,
  };
  const respones = await fetch(`${baseUrl}todos`, {
    method: "POST",
    body: JSON.stringify(newTask),
    headers: {
      "content-type": "application/json",
    },
  });
  if (respones.ok) {
    const data = await respones.json();

    if (data.message === "success") {
      // Retrive Data from backend
      Toast.fire({
        icon: "success",
        title: "Todo Added successfully",
      });
      getAllTodos();
      taskForm.reset();
    }
  }
}

async function getAllTodos() {
  try {
    showLoader();
    const respones = await fetch(`${baseUrl}todos/${apiKey}`);
    if (respones.ok) {
      const data = await respones.json();
      allTodos = data.todos;
      console.log(allTodos);
      displayTodos();
    }
  } catch (error) {
    console.log(error);
  } finally {
    hideLoader();
  }
}

function displayTodos() {
  showEmptyState();
  countProgress();
  let box = "";
  for (let i = 0; i < allTodos.length; i++) {
    box += `
      <li class="task-item ${
        allTodos[i].completed ? "completed" : ""
      }" data-index="${i}"  >
            <span class="task-text">${allTodos[i].title}</span>
            <div class="task-actions">
              <button class="action-btn complete-btn" data-role="completeIt">
                <i class="fa-solid fa-check small"></i>
              </button>
              <button class="action-btn delete-btn" data-role="delete">
                <i class="fa-solid fa-xmark small"></i>
              </button>
            </div>
      </li>
    `;
  }
  todosContainer.innerHTML = box;
}

async function deleteTodo(todoId) {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      const respones = await fetch(`${baseUrl}todos`, {
        method: "DELETE",
        body: JSON.stringify({
          todoId: todoId,
        }),
        headers: {
          "content-type": "application/json",
        },
      });
      if (respones.ok) {
        const data = await respones.json();
        if (data.message === "success") {
          Swal.fire({
            title: "Deleted!",
            text: "Your Todo has been deleted successfully.",
            icon: "success",
          });
          getAllTodos();
        }
      }
    }
  });
}
async function markTodoAsCompleted(todoId, isCompleted) {
  if (isCompleted === false) {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Complete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const respones = await fetch(`${baseUrl}todos`, {
          method: "PUT",
          body: JSON.stringify({
            todoId: todoId,
          }),
          headers: {
            "content-type": "application/json",
          },
        });
        if (respones.ok) {
          const data = await respones.json();
          if (data.message === "success") {
            Swal.fire({
              title: "Completed!",
              text: "Your todo has been marked as completed.",
              icon: "success",
            });
            getAllTodos();
          }
        }
      }
    });
  } else {
    return;
  }
}

function showLoader() {
  loader.classList.add("active");
}
function hideLoader() {
  loader.classList.remove("active");
}

function showEmptyState() {
  if (allTodos.length === 0) {
    emptyState.classList.remove("d-none");
  } else {
    emptyState.classList.add("d-none");
  }
}

function countProgress() {
  let completedTodos = [];
  const completedCount = document.getElementById("completedCount");
  const totalCount = document.getElementById("totalCount");
  const progressPercent = document.getElementById("progressPercent");
  const progressFill = document.getElementById("progressFill");
  for (let i = 0; i < allTodos.length; i++) {
    if (allTodos[i].completed) {
      completedTodos.push(allTodos[i]);
    }
  }
  completedCount.textContent = completedTodos.length;
  totalCount.textContent = allTodos.length;
  if (allTodos.length > 0) {
    progressFill.style.width = `${
      (completedTodos.length / allTodos.length) * 100
    }%`;
    progressPercent.textContent = `${Math.floor(
      (completedTodos.length / allTodos.length) * 100
    )}%`;
  } else {
    progressFill.style.width = "0%";
    progressPercent.textContent = `0%`;
  }
}
