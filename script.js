let students = JSON.parse(localStorage.getItem("students")) || [];

/* LOGIN */
function login() {
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;

  if (username === "admin" && password === "12345") {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("appContent").style.display = "block";

    localStorage.setItem("isLoggedIn", "true");

    displayStudents();
  } else {
    document.getElementById("loginError").innerText = "Wrong username or password";
  }
}

/* LOGOUT */
function logout() {
  localStorage.removeItem("isLoggedIn");

  document.getElementById("loginBox").style.display = "block";
  document.getElementById("appContent").style.display = "none";

  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
}

/* ADD STUDENT */
function addStudent() {
  let name = document.getElementById("studentName").value.trim();
  let studentClass = document.getElementById("studentClass").value.trim();
  let photoInput = document.getElementById("studentPhoto");

  if (name === "" || studentClass === "") {
    alert("Please fill all fields");
    return;
  }

  const newStudent = {
    name: name,
    class: studentClass,
    attendance: "Present",
    results: [],
    photo: ""
  };

  if (photoInput.files[0]) {
    if (photoInput.files[0].size > 1000000) {
      alert("Image too large. Please choose image below 1MB");
      return;
    }

    let reader = new FileReader();

    reader.onload = function(e) {
      newStudent.photo = e.target.result;
      students.push(newStudent);

      saveStudents();
      displayStudents();
      clearForm();
    };

    reader.readAsDataURL(photoInput.files[0]);
  } else {
    students.push(newStudent);

    saveStudents();
    displayStudents();
    clearForm();
  }
}

/* CLEAR FORM */
function clearForm() {
  document.getElementById("studentName").value = "";
  document.getElementById("studentClass").value = "";
  document.getElementById("studentPhoto").value = "";
}

/* DISPLAY STUDENTS */
function displayStudents() {
  let list = document.getElementById("studentList");

  list.innerHTML = "";

  students.forEach((student, index) => {
    let li = document.createElement("li");

    li.innerHTML = `
      <div class="student-card">
        <img 
          src="${
            student.photo ||
            "https://ui-avatars.com/api/?name=" +
            encodeURIComponent(student.name) +
            "&background=2563eb&color=fff&size=128"
          }"
          class="student-img"
        >

        <div class="student-info">
          <strong>${student.name}</strong>

          <p>Class: ${student.class}</p>

          <p>
            Attendance:
            <span class="attendance-status">
              ${student.attendance || "Present"}
            </span>
          </p>

          <p>Results:</p>

          <div class="result-list">
            ${
              student.results && student.results.length > 0
                ? student.results.map(result => `
                    <div class="subject-result">
                      ${result.subject}: ${result.score} - Grade ${result.grade}
                    </div>
                  `).join("")
                : "No result added"
            }
          </div>

          <button onclick="markPresent(${index})" class="present-btn">
            Present
          </button>

          <button onclick="markAbsent(${index})" class="absent-btn">
            Absent
          </button>

          <button onclick="addResult(${index})" class="result-btn">
            Add Result
          </button>

          <button onclick="editStudent(${index})" class="edit-btn">
            Edit
          </button>

          <button onclick="deleteStudent(${index})" class="delete-btn">
            Delete
          </button>
        </div>
      </div>
    `;

    list.appendChild(li);
  });

  updateDashboard();
}

/* DASHBOARD */
function updateDashboard() {
  let present = students.filter(student => student.attendance === "Present").length;
  let absent = students.filter(student => student.attendance === "Absent").length;

  document.getElementById("studentCount").innerText = students.length;
  document.getElementById("presentCount").innerText = present;
  document.getElementById("absentCount").innerText = absent;
}

/* SAVE */
function saveStudents() {
  localStorage.setItem("students", JSON.stringify(students));
}

/* DELETE */
function deleteStudent(index) {
  students.splice(index, 1);

  saveStudents();
  displayStudents();
}

/* PRESENT */
function markPresent(index) {
  students[index].attendance = "Present";

  saveStudents();
  displayStudents();
}

/* ABSENT */
function markAbsent(index) {
  students[index].attendance = "Absent";

  saveStudents();
  displayStudents();
}

/* ADD RESULT */
function addResult(index) {
  let subject = prompt("Enter subject name:");

  if (subject === null || subject.trim() === "") {
    return;
  }

  let score = prompt("Enter score 0 - 100:");

  if (score === null) {
    return;
  }

  score = Number(score);

  if (isNaN(score) || score < 0 || score > 100) {
    alert("Invalid score");
    return;
  }

  let grade = "";

  if (score >= 70) {
    grade = "A";
  } else if (score >= 60) {
    grade = "B";
  } else if (score >= 50) {
    grade = "C";
  } else if (score >= 45) {
    grade = "D";
  } else {
    grade = "F";
  }

  if (!students[index].results) {
    students[index].results = [];
  }

  students[index].results.push({
    subject: subject.trim(),
    score: score,
    grade: grade
  });

  saveStudents();
  displayStudents();
}

/* EDIT */
function editStudent(index) {
  let newName = prompt("Enter new student name:", students[index].name);
  let newClass = prompt("Enter new student class:", students[index].class);

  if (newName === null || newClass === null) {
    return;
  }

  if (newName.trim() === "" || newClass.trim() === "") {
    alert("Student name and class cannot be empty");
    return;
  }

  students[index].name = newName.trim();
  students[index].class = newClass.trim();

  saveStudents();
  displayStudents();
}

/* EXPORT PDF */
function exportPDF() {
  const { jsPDF } = window.jspdf;

  let doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("AHYEL School Management System", 20, 20);

  doc.setFontSize(12);
  doc.text("Student Report", 20, 30);

  let y = 45;

  students.forEach((student, index) => {
    doc.text(
      `${index + 1}. ${student.name} | Class: ${student.class} | Attendance: ${student.attendance || "Present"}`,
      20,
      y
    );

    y += 8;

    if (student.results && student.results.length > 0) {
      student.results.forEach(result => {
        doc.text(
          `   - ${result.subject}: ${result.score} | Grade: ${result.grade}`,
          25,
          y
        );

        y += 8;

        if (y > 280) {
          doc.addPage();
          y = 20;
        }
      });
    } else {
      doc.text("   - No result added", 25, y);
      y += 8;
    }

    y += 4;

    if (y > 280) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save("ahyel-student-report.pdf");
}

/* DARK MODE */
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

/* SIDEBAR */
function toggleSidebar() {
  document.querySelector(".sidebar").classList.toggle("show-sidebar");
}

/* SEARCH STUDENT */
function searchStudent() {
  let input = document.getElementById("searchInput").value.toLowerCase();
  let listItems = document.querySelectorAll("#studentList li");

  listItems.forEach((item) => {
    if (item.innerText.toLowerCase().includes(input)) {
      item.style.display = "block";
    } else {
      item.style.display = "none";
    }
  });
}

/* PAGE LOAD */
window.onload = function() {
  if (localStorage.getItem("isLoggedIn") === "true") {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("appContent").style.display = "block";
    displayStudents();
  } else {
    document.getElementById("loginBox").style.display = "block";
    document.getElementById("appContent").style.display = "none";
  }
};
