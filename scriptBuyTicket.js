// Hide loader when page fully loads
        window.addEventListener('load', () => {
            const loader = document.getElementById('loaderOverlay');
            if (loader) {
                loader.classList.add('hidden');
            }
        });

        // Dark mode toggle - synced across pages
        const toggle = document.getElementById("darkToggle");
        const body = document.body;

        function applyTheme(theme) {
            if (theme === "dark") {
                body.classList.add("dark");
                if (toggle) toggle.checked = true;
            } else {
                body.classList.remove("dark");
                if (toggle) toggle.checked = false;
            }
        }

        const savedTheme = localStorage.getItem("unitickets-theme");
        applyTheme(savedTheme || "light");

        if (toggle) {
            toggle.addEventListener("change", () => {
                const newTheme = toggle.checked ? "dark" : "light";
                applyTheme(newTheme);
                localStorage.setItem("unitickets-theme", newTheme);
            });
        }

        // Helper to read query params
        function qs(key) {
            const params = new URLSearchParams(window.location.search);
            return params.get(key) || '';
        }

        // Parse event data from URL
        const titleParam = qs('event');
        const priceParam = qs('price');

        const title = titleParam ? decodeURIComponent(titleParam) : 'Event';
        const price = priceParam ? decodeURIComponent(priceParam) : '';

        // Populate event details
        document.getElementById('eventTitle').innerText = title;
        document.getElementById('summaryEventName').innerText = title;
        document.getElementById('summaryPrice').innerText = price || 'Free';
        
        // Set placeholder dates/times (would come from backend in real app)
        document.getElementById('eventDate').innerText = '15 Mar 2026';
        document.getElementById('eventTime').innerText = '6:00 PM';
        document.getElementById('eventLocation').innerText = 'Main Auditorium';

        // Quantity management
        let quantity = 1;

        function incrementQty() {
            quantity++;
            document.getElementById('qty').value = quantity;
            updateSummary();
        }

        function decrementQty() {
            if (quantity > 1) {
                quantity--;
                document.getElementById('qty').value = quantity;
                updateSummary();
            }
        }

        function parseNumberFromCurrency(str) {
            if (!str) return 0;
            const n = str.replace(/[^0-9\.]/g, '');
            return parseFloat(n) || 0;
        }

        function updateSummary() {
            document.getElementById('summaryQty').innerText = quantity;
            const unit = parseNumberFromCurrency(price);
            const subtotal = unit * quantity;
            const fee = 0;
            const total = subtotal + fee;

            document.getElementById('subtotal').innerText = `₦${subtotal.toLocaleString()}`;
            document.getElementById('totalAmount').innerText = `₦${total.toLocaleString()}`;
        }

        // Initial summary update
        updateSummary();

        // Button handlers
        const proceedBtn = document.getElementById('proceedBtn');
        const proceedBtnSidebar = document.getElementById('proceedBtnSidebar');
        const cancelBtn = document.getElementById('cancelBtn');

        function handleProceed() {
            const buyer = document.getElementById('buyerName').value.trim();
            const matric = document.getElementById('buyerMatricNumber').value.trim();
            const dept = document.getElementById('buyerDepartment').value.trim();
            const email = document.getElementById('buyerEmail').value.trim();

            if (!buyer) {
                alert('Please enter your full name');
                return;
            }
            if (!matric) {
                alert('Please enter your matric number');
                return;
            }
            if (!dept) {
                alert('Please enter your department');
                return;
            }
            if (!email) {
                alert('Please enter your email');
                return;
            }

            const unit = parseNumberFromCurrency(price);
            const total = unit * quantity;

            alert(`✓ Purchase Successful!\n\n${quantity}x ${title}\nTotal: ₦${total.toLocaleString()}\n\nName: ${buyer}\nMatric: ${matric}\n\nYour ticket has been sent to ${email}`);
            window.location.href = 'dashboard.html';
        }

        proceedBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleProceed();
        });

        proceedBtnSidebar.addEventListener('click', (e) => {
            e.preventDefault();
            handleProceed();
        });

        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'dashboard.html';
        });