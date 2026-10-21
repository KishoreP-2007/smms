let students = [];

const table = document.getElementById("studentTable");
const status = document.getElementById("status");
const studentCount = document.getElementById("studentCount");

function displayStudents(data) {
    table.innerHTML = "";

    if (data.length === 0) {
        table.innerHTML = `<tr><td colspan="10">No students found.</td></tr>`;
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
            <td><strong>${student.total}</strong></td>
            <td>${student.average}</td>
            <td class="grade">${student.grade}</td>
            <td>
                <button class="delete-btn" onclick="deleteStudent('${student.rollNo}')">
                    Delete
                </button>
            </td>
        `;

        table.appendChild(row);
    });

    status.textContent = `Showing ${data.length} record(s)`;
}

async function loadStudents() {
    try {
        const response = await fetch("/api/students");

        if (!response.ok) {
            throw new Error("Failed to load students");
        }

        students = await response.json();
        studentCount.textContent = students.length;
        displayStudents(students);
    } catch (error) {
        status.textContent = "Server error";
        table.innerHTML = `<tr><td colspan="10">Unable to load student data.</td></tr>`;
    }
}

function searchStudents() {
    const value = document.getElementById("searchInput").value.trim().toLowerCase();

    if (!value) {
        displayStudents(students);
        return;
    }

    const filtered = students.filter(student =>
        student.name.toLowerCase().includes(value) ||
        student.rollNo.toLowerCase().includes(value)
    );

    displayStudents(filtered);
}

async function deleteStudent(rollNo) {
    if (!confirm(`Delete student ${rollNo}?`)) return;

    try {
        const response = await fetch(`/api/students/${rollNo}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error);
        }

        await loadStudents();
    } catch (error) {
        alert(error.message);
    }
}

document.getElementById("searchBtn").addEventListener("click", searchStudents);

document.getElementById("showAllBtn").addEventListener("click", () => {
    document.getElementById("searchInput").value = "";
    displayStudents(students);
});

document.getElementById("searchInput").addEventListener("input", searchStudents);

document.getElementById("studentForm").addEventListener("submit", async event => {
    event.preventDefault();

    const data = {
        rollNo: document.getElementById("rollNo").value.trim(),
        name: document.getElementById("name").value.trim(),
        java: Number(document.getElementById("java").value),
        python: Number(document.getElementById("python").value),
        dbms: Number(document.getElementById("dbms").value),
        web: Number(document.getElementById("web").value)
    };

    const message = document.getElementById("formMessage");

    try {
        const response = await fetch("/api/students", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error);
        }

        message.textContent = "Student added successfully.";
        event.target.reset();
        await loadStudents();
    } catch (error) {
        message.textContent = error.message;
    }
});

loadStudents();
