// Hard-coded list for now
const clients = [
  { id: "C-1001", name: "Alex Morgan",     age: 34, weightKg: 76.2 },
  { id: "C-1002", name: "Priya Sharma",    age: 29, weightKg: 61.5 },
  { id: "C-1003", name: "Marcus Lee",      age: 41, weightKg: 84.0 },
  { id: "C-1004", name: "Isabella Rossi",  age: 37, weightKg: 68.8 },
  { id: "C-1005", name: "Jamal Carter",    age: 32, weightKg: 79.3 },
  { id: "C-1006", name: "Hannah Kim",      age: 26, weightKg: 57.1 },
  { id: "C-1007", name: "Diego Alvarez",   age: 45, weightKg: 88.9 },
  { id: "C-1008", name: "Mei Chen",        age: 31, weightKg: 62.0 },
  { id: "C-1009", name: "Tom Becker",      age: 53, weightKg: 91.4 },
  { id: "C-1010", name: "Sara Yusuf",      age: 28, weightKg: 59.6 }
];

function renderClients(list) {
  const tbody = document.getElementById("clientsTableBody");
  const count = document.getElementById("clientCount");
  tbody.innerHTML = "";

  list.forEach(c => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.id}</td>
      <td>${c.name}</td>
      <td>${Number.isFinite(c.age) ? c.age : "—"}</td>
      <td>${Number.isFinite(c.weightKg) ? c.weightKg.toFixed(1) : "—"}</td>
    `;

    tr.style.cursor = "pointer";
    tr.addEventListener("click", () => {
      window.location.href = `professional_vitals_dashboard.html?id=${encodeURIComponent(c.id)}`;
    });
    tbody.appendChild(tr);
  });

  count.textContent = list.length;
}

renderClients(clients);
