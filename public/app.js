let students = [];

const table = document.getElementById("studentTable");
const status = document.getElementById("status");
const studentCount = document.getElementById("studentCount");

const modal = document.getElementById("profileModal");
const closeProfile = document.getElementById("closeProfile");
const profileDelete = document.getElementById("profileDelete");

let selectedStudent = null;


// Grade ranking
function gradeRank(g) {
  return {
    "A+": 6,
    "A": 5,
    "B": 4,
    "C": 3,
    "D": 2,
    "F": 1
  }[g] || 0;
}


// Update dashboard
function updateDashboard(data) {

  studentCount.textContent = data.length;

  if (!data.length) {
    averageScore.textContent = "0";
    topGrade.textContent = "-";
    passCount.textContent = "0";
    return;
  }

  const avg =
    data.reduce((s, x) => s + Number(x.average || 0), 0) /
    data.length;

  const top = data.reduce(
    (a, x) =>
      gradeRank(x.grade) > gradeRank(a.grade) ? x : a,
    data[0]
  );

  averageScore.textContent = avg.toFixed(1);
  topGrade.textContent = top.grade;

  passCount.textContent =
    data.filter(x => Number(x.average || 0) >= 40).length;
}


// Display students
function displayStudents(data) {

  table.innerHTML = "";

  updateDashboard(data);

  if (!data.length) {

    table.innerHTML =
      '<tr><td colspan="10">No students found.</td></tr>';

    status.textContent = "No matching records";

    return;
  }

  data.forEach(student => {

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${student.rollNo}</td>

      <td>${student.name}</td>

      <td>${student.java}</td>

      <td>${student.python}</td>

      <td>${student.dbms}</td>

      <td>${student.web}</td>

      <td>
        <strong>${student.total}</strong>
      </td>

      <td>${student.average}</td>

      <td>
        <span class="grade">
          ${student.grade}
        </span>
      </td>

      <td>
        <button
          class="view-btn"
          onclick="viewProfile('${student.rollNo}')">
          View
        </button>

        <button
          class="delete-btn"
          onclick="deleteStudent('${student.rollNo}')">
          Delete
        </button>
      </td>
    `;

    table.appendChild(row);
  });

  status.textContent =
    `Showing ${data.length} record(s)`;
}


// Load students from backend
async function loadStudents() {

  try {

    const response =
      await fetch("/api/students");

    if (!response.ok) {
      throw new Error();
    }

    students = await response.json();

    displayStudents(students);

  } catch (e) {

    status.textContent = "Server error";

    table.innerHTML =
      '<tr><td colspan="10">Unable to load student data.</td></tr>';
  }
}


// Search students
function searchStudents() {

  const value =
    document
      .getElementById("searchInput")
      .value
      .trim()
      .toLowerCase();

  if (!value) {
    displayStudents(students);
    return;
  }

  displayStudents(
    students.filter(
      s =>
        s.name.toLowerCase().includes(value) ||
        s.rollNo.toLowerCase().includes(value)
    )
  );
}


// View student profile
function viewProfile(rollNo) {

  const s =
    students.find(x => x.rollNo === rollNo);

  if (!s) return;

  selectedStudent = s;

  profileName.textContent = s.name;

  profileRoll.textContent =
    `Roll No: ${s.rollNo}`;

  profileAvatar.textContent =
    s.name.charAt(0).toUpperCase();

  profileAverage.textContent =
    s.average;

  profileTotal.textContent =
    s.total;

  profileGrade.textContent =
    s.grade;


  const subjects = [
    ["Java", s.java],
    ["Python", s.python],
    ["DBMS", s.dbms],
    ["Web", s.web]
  ];


  profileSubjects.innerHTML =
    subjects
      .map(
        ([n, v]) => `
          <div class="subject">

            <span class="subject-name">
              ${n}
            </span>

            <div class="progress">
              <span
                style="width:${Math.max(
                  0,
                  Math.min(100, Number(v))
                )}%">
              </span>
            </div>

            <span class="subject-score">
              ${v}
            </span>

          </div>
        `
      )
      .join("");


  modal.classList.remove("hidden");
}


// Close profile modal
function closeProfileModal() {

  modal.classList.add("hidden");

  selectedStudent = null;
}


// Delete student
async function deleteStudent(rollNo) {

  if (!confirm(`Delete student ${rollNo}?`)) {
    return;
  }

  try {

    const r =
      await fetch(
        `/api/students/${rollNo}`,
        {
          method: "DELETE"
        }
      );

    const result = await r.json();

    if (!r.ok) {
      throw new Error(result.error);
    }

    closeProfileModal();

    await loadStudents();

  } catch (e) {

    alert(e.message);
  }
}


// Search button
document
  .getElementById("searchBtn")
  .addEventListener(
    "click",
    searchStudents
  );


// Show all button
document
  .getElementById("showAllBtn")
  .addEventListener(
    "click",
    () => {

      document
        .getElementById("searchInput")
        .value = "";

      displayStudents(students);
    }
  );


// Live search
document
  .getElementById("searchInput")
  .addEventListener(
    "input",
    searchStudents
  );


// Close profile button
closeProfile.addEventListener(
  "click",
  closeProfileModal
);


// Close modal when clicking outside
modal.addEventListener(
  "click",
  e => {

    if (e.target === modal) {
      closeProfileModal();
    }

  }
);


// Delete from profile
profileDelete.addEventListener(
  "click",
  () => {

    if (selectedStudent) {
      deleteStudent(
        selectedStudent.rollNo
      );
    }

  }
);


// Add student form
document
  .getElementById("studentForm")
  .addEventListener(
    "submit",
    async e => {

      e.preventDefault();


      const data = {

        rollNo: rollNo.value.trim(),

        name: name.value.trim(),

        java: Number(java.value),

        python: Number(python.value),

        dbms: Number(dbms.value),

        web: Number(web.value)

      };


      const message =
        document.getElementById(
          "formMessage"
        );


      try {

        const r =
          await fetch(
            "/api/students",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify(data)
            }
          );


        const result =
          await r.json();


        if (!r.ok) {
          throw new Error(
            result.error
          );
        }


        message.textContent =
          "Student added successfully.";


        e.target.reset();


        await loadStudents();


      } catch (err) {

        message.textContent =
          err.message;
      }

    }
  );


// Load students when page opens
loadStudents();