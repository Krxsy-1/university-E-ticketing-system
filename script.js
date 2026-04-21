const loginForm = document.getElementById("loginForm");
        const studentModeBtn = document.getElementById("studentModeBtn");
        const adminModeBtn = document.getElementById("adminModeBtn");
        const studentFields = document.getElementById("studentFields");
        const adminFields = document.getElementById("adminFields");
        const rightSubtitle = document.getElementById("rightSubtitle");

        let loginMode = "student"; // default mode

        // Toggle between Student and Admin login
        function setLoginMode(mode) {
            loginMode = mode;
            
            if (mode === "student") {
                studentFields.style.display = "block";
                adminFields.style.display = "none";
                studentModeBtn.classList.add("active");
                adminModeBtn.classList.remove("active");
                rightSubtitle.innerText = "Use your student credentials to access your dashboard.";
            } else {
                studentFields.style.display = "none";
                adminFields.style.display = "block";
                studentModeBtn.classList.remove("active");
                adminModeBtn.classList.add("active");
                rightSubtitle.innerText = "Use your administrator credentials to manage events and users.";
            }
        }

        studentModeBtn.addEventListener("click", () => setLoginMode("student"));
        adminModeBtn.addEventListener("click", () => setLoginMode("admin"));

        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();

            if (loginMode === "student") {
                const studentId = document.getElementById("studentId").value.trim();
                const password = document.getElementById("password").value.trim();

                if (studentId === "201109012" && password === "demo1234") {
                    alert("Login successful! Welcome, Student.");
                    window.location.href = "dashboard.html";
                } else {
                    alert("Invalid credentials. Use demo: 201109012 / demo1234");
                }
            } else {
                const adminEmail = document.getElementById("adminEmail").value.trim();
                const adminPassword = document.getElementById("adminPassword").value.trim();

                if (adminEmail === "admin@university.edu" && adminPassword === "admin1234") {
                    alert("Login successful! Welcome, Administrator.");
                    // Redirect to admin dashboard (create administrator.html later)
                    window.location.href = "administrator.html";
                } else {
                    alert("Invalid credentials. Use demo: admin@university.edu / admin1234");
                }
            }
        });

        const toggle = document.getElementById("darkToggle");
        const body = document.body;

        function applyTheme(theme) {
            if (theme === "dark") {
                body.classList.add("dark");
                toggle.checked = true;
            } 
            else 
            {
                body.classList.remove("dark");
                toggle.checked = false;
            }
        }

        // Get saved theme (already applied in HEAD, but update toggle state)
        const currentTheme = localStorage.getItem("unitickets-theme");
        applyTheme(currentTheme || "light");

        toggle.addEventListener("change", () => {
        const newTheme = toggle.checked ? "dark" : "light";
        applyTheme(newTheme);
        localStorage.setItem("unitickets-theme", newTheme);
        });
