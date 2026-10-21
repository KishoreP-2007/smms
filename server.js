const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "students.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function readStudents() {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function calculateResult(student) {
    const marks = [student.java, student.python, student.dbms, student.web];
    const total = marks.reduce((sum, mark) => sum + mark, 0);
    const average = total / marks.length;

    let grade;
    if (average >= 90) grade = "A+";
    else if (average >= 80) grade = "A";
    else if (average >= 70) grade = "B";
    else if (average >= 60) grade = "C";
    else if (average >= 50) grade = "D";
    else grade = "F";

    return {
        ...student,
        total,
        average: Number(average.toFixed(2)),
        grade
    };
}

app.get("/api/students", (req, res) => {
    try {
        const students = readStudents().map(calculateResult);
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: "Unable to read student data." });
    }
});

app.get("/api/students/:rollNo", (req, res) => {
    try {
        const students = readStudents();
        const student = students.find(
            s => s.rollNo.toLowerCase() === req.params.rollNo.toLowerCase()
        );

        if (!student) {
            return res.status(404).json({ error: "Student not found." });
        }

        res.json(calculateResult(student));
    } catch (error) {
        res.status(500).json({ error: "Unable to read student data." });
    }
});

app.post("/api/students", (req, res) => {
    try {
        const { rollNo, name, java, python, dbms, web } = req.body;

        if (!rollNo || !name || [java, python, dbms, web].some(mark => mark === undefined)) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const students = readStudents();

        if (students.some(s => s.rollNo.toLowerCase() === rollNo.toLowerCase())) {
            return res.status(409).json({ error: "Roll number already exists." });
        }

        const newStudent = {
            rollNo,
            name,
            java: Number(java),
            python: Number(python),
            dbms: Number(dbms),
            web: Number(web)
        };

        students.push(newStudent);
        fs.writeFileSync(DATA_FILE, JSON.stringify(students, null, 2));

        res.status(201).json(calculateResult(newStudent));
    } catch (error) {
        res.status(500).json({ error: "Unable to add student." });
    }
});

app.delete("/api/students/:rollNo", (req, res) => {
    try {
        const students = readStudents();
        const updated = students.filter(
            s => s.rollNo.toLowerCase() !== req.params.rollNo.toLowerCase()
        );

        if (students.length === updated.length) {
            return res.status(404).json({ error: "Student not found." });
        }

        fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2));
        res.json({ message: "Student deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "Unable to delete student." });
    }
});

app.listen(PORT, () => {
    console.log(`Student Mark Management System running on port ${PORT}`);
});
