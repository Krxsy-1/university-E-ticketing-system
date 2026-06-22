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

            // show spinner and disable login button for feedback
            const loginBtn = document.getElementById('loginButton');
            const spinner = document.getElementById('loginSpinner');
            const btnText = document.getElementById('loginBtnText');
            if (loginBtn) loginBtn.disabled = true;
            if (spinner) spinner.style.display = 'inline-grid';
            if (btnText) btnText.style.opacity = '0.6';

            if (loginMode === "student") {
                const studentId = document.getElementById("studentId").value.trim();
                const password = document.getElementById("password").value.trim();

                if (studentId === "201109012" && password === "demo1234") {
                    // Successful login - give a quick visual pause then redirect
                    setTimeout(() => { window.location.href = "dashboard.html"; }, 600);
                } else {
                    if (window.showError) showError('Invalid credentials', 'Use demo: 201109012 / demo1234'); else alert("Invalid credentials. Use demo: 201109012 / demo1234");
                    if (window.logger && window.logger.warn) window.logger.warn('Student login failed for', studentId);
                    // restore button state
                    if (loginBtn) loginBtn.disabled = false;
                    if (spinner) spinner.style.display = 'none';
                    if (btnText) btnText.style.opacity = '1';
                }
            } else {
                const adminEmail = document.getElementById("adminEmail").value.trim();
                const adminPassword = document.getElementById("adminPassword").value.trim();

                if (adminEmail === "admin@university.edu" && adminPassword === "admin1234") {
                    // Successful admin login - give a quick visual pause then redirect
                    setTimeout(() => { window.location.href = "administrator.html"; }, 600);
                } else {
                    if (window.showError) showError('Invalid credentials', 'Use demo: admin@university.edu / admin1234'); else alert("Invalid credentials. Use demo: admin@university.edu / admin1234");
                    if (window.logger && window.logger.warn) window.logger.warn('Admin login failed for', adminEmail);
                    // restore button state
                    if (loginBtn) loginBtn.disabled = false;
                    if (spinner) spinner.style.display = 'none';
                    if (btnText) btnText.style.opacity = '1';
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
