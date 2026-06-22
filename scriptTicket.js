// scriptTicket.js
// Renders the ticket from localStorage and enables download

function generateTicketHTML(purchase) {
    const { id, title, quantity, total, buyer, matric, dept, email, date } = purchase;
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Ticket - ${title}</title>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>
        :root {
          --bg: #f5f6fb;
          --bg-elevated: #fff;
          --text-main: #111827;
          --text-muted: #6b7280;
          --accent: #4f46e5;
          --border-subtle: #e5e7eb;
          --radius-lg: 18px;
        }
        body.dark {
          --bg: #050816;
          --bg-elevated: #0b1020;
          --text-main: #e5e7eb;
          --text-muted: #9ca3af;
          --accent: #6366f1;
          --border-subtle: #1f2933;
        }
        body {
          background: radial-gradient(circle at top left, #e0e7ff 0, var(--bg) 40%, var(--bg) 100%);
          color: var(--text-main);
          font-family: Inter, system-ui, Arial, sans-serif;
          padding: 20px;
          margin: 0;
          transition: background 0.3s;
        }
        body.dark {
          background: radial-gradient(circle at top left, #111827 0, #020617 40%, #020617 100%);
        }
        .ticket {
          max-width: 680px;
          margin: 0 auto;
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          background: var(--bg-elevated);
          padding: 24px 20px;
          box-shadow: 0 8px 32px rgba(15,23,42,0.08);
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .title {
          font-weight: 700;
          font-size: 22px;
          color: var(--accent);
        }
        .meta {
          margin-top: 12px;
          font-size: 15px;
          color: var(--text-muted);
        }
        .section {
          margin-top: 18px;
        }
        /* QR placeholder removed - ticket will show an instruction text only */
        @media (max-width: 600px) {
          .ticket { padding: 12px 4px; }
          .header { flex-direction: column; align-items: flex-start; gap: 8px; }
        }
    </style>
    <script>
      (function() {
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const saved = localStorage.getItem('unitickets-theme');
        if (saved === 'dark' || (!saved && mql.matches)) {
          document.body.classList.add('dark');
        }
      })();
    <\/script>
    </head><body><div class="ticket"><div class="header"><div><div class="title">${title}</div><div style="font-size:12px;color:var(--text-muted)">UniTickets</div></div><div><strong>Ticket #${id}</strong></div></div>
    <div class="meta">Date: ${date} • Quantity: ${quantity} • Total: ₦${total.toLocaleString()}</div>
    <div class="section"><strong>Buyer</strong><div style="margin-top:6px">${buyer} • ${matric} • ${dept}</div></div>
    <div class="section"><strong>Contact</strong><div style="margin-top:6px">${email}</div></div>
  <div class="section"><div style="font-size:12px;color:var(--text-muted)">Present this ticket at the event entrance.</div></div>
    </div></body></html>`;
}

function downloadFile(filename, content, mime = 'text/html') {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function renderTicket() {
    const purchase = JSON.parse(localStorage.getItem('unitickets-latest-purchase') || 'null');
    if (!purchase) {
        document.getElementById('ticketDisplay').innerHTML = '<p style="color:var(--danger);text-align:center;">No ticket data found.</p>';
        document.getElementById('downloadTicketBtn').style.display = 'none';
        return;
    }
    document.getElementById('ticketDisplay').innerHTML = generateTicketHTML(purchase).replace(/<\/?(html|head|body)[^>]*>/g, '');
    document.getElementById('downloadTicketBtn').onclick = function() {
        const html = generateTicketHTML(purchase);
        downloadFile(`UniTicket-${purchase.title.replace(/\s+/g,'_')}-${purchase.id}.html`, html, 'text/html');
    };
}

document.addEventListener('DOMContentLoaded', renderTicket);
