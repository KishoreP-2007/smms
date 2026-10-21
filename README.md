# Student Mark Management System - Node.js

A simple full-stack practice project using Node.js, Express, HTML, CSS, JavaScript and JSON.

## Features

- View student records
- Search by name or roll number
- Calculate total, average and grade
- Add a student
- Delete a student
- REST API endpoints
- JSON file used as the data store

## Run locally

```bash
npm install
npm start
```

Open:

http://localhost:3000

## API

GET /api/students
GET /api/students/:rollNo
POST /api/students
DELETE /api/students/:rollNo

This project uses students.json instead of MySQL, making it suitable for basic Node.js and deployment practice.
