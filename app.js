// Date hardcodate folosite ca sursa implicita.
const DEFAULT_EMPLOYEES = [
  { firstName: "Jackson", lastName: "Bailey", position: "Manager", startDate: "2023-01-15" },
  { firstName: "Jacqueline", lastName: "Smith", position: "Developer", startDate: "2024-08-01" },
  { firstName: "Chris", lastName: "Jones", position: "Designer", startDate: "2022-11-20" },
  { firstName: "Aaron", lastName: "Jones", position: "Developer", startDate: "2025-10-05" },
  { firstName: "Mai", lastName: "Ling", position: "HR", startDate: "2021-03-12" },
  { firstName: "Jim", lastName: "Johnson", position: "Manager", startDate: "2023-07-30" },
  { firstName: "Sabrina", lastName: "Zarnecki", position: "Designer", startDate: "2024-12-01" },
  { firstName: "Geoffrey", lastName: "Swift", position: "Developer", startDate: "2022-05-18" },
  { firstName: "Fong", lastName: "Xiong", position: "HR", startDate: "2020-09-09" }
];

let employees = [];

// Intoarce o copie noua a listei implicite, ca sa nu modificam sursa.
function loadEmployees() {
  const copy = [];
  for (let i = 0; i < DEFAULT_EMPLOYEES.length; i += 1) {
    copy.push(DEFAULT_EMPLOYEES[i]);
  }
  return copy;
}

// Cauta in firstName sau lastName fara Array.filter(); comparatie case-insensitive.
function searchByName(list, query) {
  const trimmed = query.trim();
  if (!trimmed) {
    return list;
  }

  const result = [];
  const needle = trimmed.toLowerCase();

  for (let i = 0; i < list.length; i += 1) {
    const employee = list[i];
    const first = employee.firstName.toLowerCase();
    const last = employee.lastName.toLowerCase();

    if (first.indexOf(needle) !== -1 || last.indexOf(needle) !== -1) {
      result.push(employee);
    }
  }

  return result;
}

// Filtreaza dupa pozitie fara Array.filter().
function filterByPosition(list, position) {
  if (!position || position === "all") {
    return list;
  }

  const result = [];
  for (let i = 0; i < list.length; i += 1) {
    const employee = list[i];
    if (employee.position === position) {
      result.push(employee);
    }
  }

  return result;
}

// Pastreaza doar angajatii cu vechime de cel putin 6 luni.
function filterBySixMonths(list) {
  const result = [];
  const threshold = new Date();
  threshold.setMonth(threshold.getMonth() - 6);

  for (let i = 0; i < list.length; i += 1) {
    const employee = list[i];
    const parsed = new Date(`${employee.startDate}T00:00:00`);
    if (!Number.isNaN(parsed.getTime()) && parsed <= threshold) {
      result.push(employee);
    }
  }

  return result;
}

// Combina toate filtrele in ordinea ceruta.
function applyAllFilters(list, nameQuery, position, sixMonths) {
  let result = list;
  result = searchByName(result, nameQuery);
  result = filterByPosition(result, position);
  if (sixMonths) {
    result = filterBySixMonths(result);
  }
  return result;
}

// Afiseaza rezultatele in tabel si comuta mesajul de "fara rezultate".
function renderResults(list) {
  const tbody = document.getElementById("resultsBody");
  const noResults = document.getElementById("noResults");

  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }

  if (!list.length) {
    noResults.style.display = "block";
    return;
  }

  noResults.style.display = "none";

  for (let i = 0; i < list.length; i += 1) {
    const employee = list[i];
    const row = document.createElement("tr");

    const lastNameCell = document.createElement("td");
    lastNameCell.textContent = employee.lastName;

    const firstNameCell = document.createElement("td");
    firstNameCell.textContent = employee.firstName;

    const positionCell = document.createElement("td");
    positionCell.textContent = employee.position;

    const dateCell = document.createElement("td");
    dateCell.textContent = employee.startDate;

    row.appendChild(lastNameCell);
    row.appendChild(firstNameCell);
    row.appendChild(positionCell);
    row.appendChild(dateCell);

    tbody.appendChild(row);
  }
}

// Citeste un fisier JSON si inlocuieste lista curenta de angajati.
function handleFileUpload(file) {
  const status = document.getElementById("uploadStatus");
  if (!file) {
    status.textContent = "Nu a fost selectat niciun fisier.";
    return;
  }

  const reader = new FileReader();
  reader.onload = function onLoad(event) {
    try {
      const data = JSON.parse(event.target.result);
      if (!data || !Array.isArray(data.employees)) {
        throw new Error("format invalid");
      }

      const loaded = [];
      for (let i = 0; i < data.employees.length; i += 1) {
        loaded.push(data.employees[i]);
      }

      employees = loaded;
      populatePositions(employees);
      resetFilters(false);
      status.textContent = "Fisier incarcat cu succes.";
    } catch (error) {
      status.textContent = "Fisier JSON invalid. Verifica formatul.";
    }
  };

  reader.onerror = function onError() {
    status.textContent = "Nu am putut citi fisierul.";
  };

  reader.readAsText(file);
}

// Construieste dropdown-ul de pozitii din valori unice.
function populatePositions(list) {
  const select = document.getElementById("positionSelect");
  while (select.firstChild) {
    select.removeChild(select.firstChild);
  }

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "Toate pozitiile";
  select.appendChild(allOption);

  const positions = [];
  for (let i = 0; i < list.length; i += 1) {
    const position = list[i].position;
    if (positions.indexOf(position) === -1) {
      positions.push(position);
    }
  }

  for (let i = 0; i < positions.length; i += 1) {
    const option = document.createElement("option");
    option.value = positions[i];
    option.textContent = positions[i];
    select.appendChild(option);
  }
}

// Reseteaza filtrele si re-afiseaza lista; optional curata mesajul de status.
function resetFilters(clearStatus) {
  const form = document.getElementById("filter-form");
  const status = document.getElementById("uploadStatus");

  form.reset();
  renderResults(employees);

  if (clearStatus) {
    status.textContent = "";
  }
}

// Initializeaza aplicatia: date, UI si evenimente.
function init() {
  employees = loadEmployees();
  populatePositions(employees);
  renderResults(employees);

  const form = document.getElementById("filter-form");
  const resetBtn = document.getElementById("resetBtn");
  const fileInput = document.getElementById("fileInput");

  form.addEventListener("submit", function onSubmit(event) {
    event.preventDefault();
    const nameQuery = document.getElementById("nameQuery").value;
    const position = document.getElementById("positionSelect").value;
    const sixMonths = document.getElementById("sixMonths").checked;
    const filtered = applyAllFilters(employees, nameQuery, position, sixMonths);
    renderResults(filtered);
  });

  resetBtn.addEventListener("click", function onReset() {
    resetFilters(true);
  });

  fileInput.addEventListener("change", function onFileChange(event) {
    const file = event.target.files && event.target.files[0];
    handleFileUpload(file);
    event.target.value = "";
  });
}

// Pornim initializarea dupa ce DOM-ul este incarcat.
document.addEventListener("DOMContentLoaded", init);
