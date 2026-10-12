// ===== Settings =====
const SUBJECTS = ["math", "science", "english", "programming", "web"];
const PASS_MARK = 40; // minimum marks needed in each subject to pass

// In-memory store of student results
const students = [];

// ===== DOM references =====
const form = document.getElementById("resultForm");
const formMessage = document.getElementById("formMessage");
const resultBody = document.getElementById("resultBody");
const resultCount = document.getElementById("resultCount");
const clearBtn = document.getElementById("clearBtn");

// ===== Helpers =====
function setError(inputId, message) {
  const input = document.getElementById(inputId);
  const errorEl = document.getElementById(inputId + "Error");
  input.classList.toggle("invalid", Boolean(message));
  errorEl.textContent = message || "";
}

function clearErrors() {
  document.querySelectorAll(".error").forEach((el) => (el.textContent = ""));
  document.querySelectorAll("input.invalid").forEach((el) =>
    el.classList.remove("invalid")
  );
}

// Returns a grade letter from a percentage
function getGrade(percentage) {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "F";
}

// ===== Validation =====
function validate() {
  clearErrors();
  let valid = true;

  const name = document.getElementById("name").value.trim();
  const roll = document.getElementById("roll").value.trim();

  if (name === "") {
    setError("name", "Enter the student's name.");
    valid = false;
  } else if (!/^[A-Za-z .'-]+$/.test(name)) {
    setError("name", "Use letters only in the name.");
    valid = false;
  }

  if (roll === "") {
    setError("roll", "Enter a roll number.");
    valid = false;
  } else if (students.some((s) => s.roll.toLowerCase() === roll.toLowerCase())) {
    setError("roll", "This roll number is already in the class record.");
    valid = false;
  }

  SUBJECTS.forEach((subject) => {
    const raw = document.getElementById(subject).value.trim();
    const value = Number(raw);

    if (raw === "") {
      setError(subject, "Enter marks.");
      valid = false;
    } else if (!Number.isInteger(value) || value < 0 || value > 100) {
      setError(subject, "Marks must be a whole number from 0 to 100.");
      valid = false;
    }
  });

  return valid;
}

// ===== Calculations =====
function calculateResult(name, roll, marks) {
  const total = marks.reduce((sum, m) => sum + m, 0);
  const maxTotal = marks.length * 100;
  const percentage = (total / maxTotal) * 100;
  const passed = marks.every((m) => m >= PASS_MARK);

  return {
    name,
    roll,
    marks,
    total,
    percentage: percentage.toFixed(2),
    grade: passed ? getGrade(percentage) : "F",
    status: passed ? "Pass" : "Fail",
  };
}

// ===== Rendering =====
function renderTable(highlightRoll = null) {
  if (students.length === 0) {
    resultBody.innerHTML =
      '<tr class="empty-row"><td colspan="7">No results yet. Add a student to begin.</td></tr>';
  } else {
    resultBody.innerHTML = "";

    students.forEach((s, index) => {
      const row = document.createElement("tr");
      if (s.roll === highlightRoll) row.classList.add("new-row");

      row.innerHTML = `
        <td>${escapeHtml(s.name)}</td>
        <td>${escapeHtml(s.roll)}</td>
        <td class="num">${s.total}</td>
        <td class="num">${s.percentage}%</td>
        <td>${s.grade}</td>
        <td><span class="status ${s.status.toLowerCase()}">${s.status}</span></td>
        <td><button type="button" class="remove-btn" data-index="${index}">Remove</button></td>
      `;
      resultBody.appendChild(row);
    });
  }

  resultCount.textContent =
    students.length === 1 ? "1 student" : `${students.length} students`;
}

// Prevents user text from being read as HTML
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ===== Events =====
form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!validate()) {
    formMessage.textContent = "Please fix the highlighted fields.";
    formMessage.classList.add("error-text");
    return;
  }

  const name = document.getElementById("name").value.trim();
  const roll = document.getElementById("roll").value.trim();
  const marks = SUBJECTS.map((subject) =>
    Number(document.getElementById(subject).value)
  );

  const result = calculateResult(name, roll, marks);
  students.push(result);

  renderTable(roll);

  formMessage.classList.remove("error-text");
  formMessage.textContent = `${name} added. Result: ${result.status}, grade ${result.grade}.`;

  // Clear the form so another student can be entered
  form.reset();
  clearErrors();
  document.getElementById("name").focus();
});

clearBtn.addEventListener("click", () => {
  form.reset();
  clearErrors();
  formMessage.textContent = "";
  formMessage.classList.remove("error-text");
  document.getElementById("name").focus();
});

// Remove a student from the table
resultBody.addEventListener("click", (event) => {
  const button = event.target.closest(".remove-btn");
  if (!button) return;

  const index = Number(button.dataset.index);
  const removed = students.splice(index, 1)[0];
  renderTable();
  formMessage.classList.remove("error-text");
  formMessage.textContent = `${removed.name} removed from the record.`;
});

// Initial state
renderTable();
