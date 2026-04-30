console.log("Oversize board loaded");

let editingId = null;

//id-"loads card"
const storedLoads = JSON.parse(localStorage.getItem("loads"));

//id="migration - add status if it's missing"
if (storedLoads && Array.isArray(storedLoads)) {
  storedLoads.forEach((load) => {
    if (!load.status) load.status = "Available";
  });
  localStorage.setItem("loads", JSON.stringify(storedLoads));
}

//id="cards"
let loads =
  storedLoads && storedLoads.length > 0
    ? storedLoads
    : [
        {
          id: 1,
          title: "Excavator CAT 320",
          weight: 22000,
          from: "NJ",
          to: "TX",
          length: "9.5",
          width: "2.98",
          height: "2.9",
          status: "Available",
        },
        {
          id: 2,
          title: "Wind Turbine Blade",
          weight: 18000,
          from: "PA",
          to: "CA",
          length: "50",
          width: "1.85",
          height: "1.85",
          status: "Available",
        },
        {
          id: 3,
          title: "Industrial Generator",
          weight: 15000,
          from: "FL",
          to: "NY",
          length: "4.5",
          width: "2.0",
          height: "2.35",
          status: "Available",
        },
      ];
if (!storedLoads || storedLoads.length === 0) {
  localStorage.setItem("loads", JSON.stringify(loads));
}

//id="function saveLoads"
function saveLoads() {
  localStorage.setItem("loads", JSON.stringify(loads));
}

//id="logic input"
const titleInput = document.getElementById("title");
const weightInput = document.getElementById("weight");
const fromInput = document.getElementById("from");
const toInput = document.getElementById("to");

const lengthInput = document.getElementById("length");
const widthInput = document.getElementById("width");
const heightInput = document.getElementById("height");

const filterSearch = document.getElementById("filterSearch");
const filterStatus = document.getElementById("filterStatus");
const filterMinWeight = document.getElementById("filterMinWeight");

const statusSelect = document.getElementById("statusSelect");

const addBtn = document.getElementById("addBtn");
const cancelBtn = document.getElementById("cancelBtn");

const container = document.getElementById("loads-container");

//id="logic button"
addBtn.addEventListener("click", () => {
  weightInput.style.border = ""; //reset styles

  //id="check valid input"
  if (!titleInput.value.trim()) {
    alert("Enter title");
    return;
  }

  if (!weightInput.value.trim() || Number(weightInput.value) <= 0) {
    weightInput.style.border = "2px solid red";
    alert("Enter valid weight");
    return;
  }

  if (!fromInput.value.trim() || !toInput.value.trim()) {
    alert("Enter route");
    return;
  }

  if (!lengthInput.value || !widthInput.value || !heightInput.value) {
    alert("Enter all dimensions");
    return;
  }

  if (!statusSelect.value) {
    alert("Please select status");
    return;
  }

  if (editingId) {
    //✏️update
    loads = loads.map((load) => {
      if (load.id === editingId) {
        return {
          ...load,
          title: titleInput.value,
          weight: Number(weightInput.value),
          from: fromInput.value.toUpperCase(),
          to: toInput.value.toUpperCase(),
          length: lengthInput.value,
          width: widthInput.value,
          height: heightInput.value,
          status: statusSelect.value,
        };
      }
      return load;
    });

    editingId = null;
  } else {
    //+ add
    const newLoad = {
      id: Date.now(),
      title: titleInput.value,
      weight: Number(weightInput.value),
      from: fromInput.value.toUpperCase(),
      to: toInput.value.toUpperCase(),
      length: lengthInput.value,
      width: widthInput.value,
      height: heightInput.value,
      status: statusSelect.value,
    };

    loads.push(newLoad);
  }

  saveLoads();
  renderLoads();
  resetForm();
});

cancelBtn.addEventListener("click", resetForm);

//id="render loads"
function renderLoads() {
  container.innerHTML = "";

  //check for absence
  if (loads.length === 0) {
    container.innerHTML = `
      <div style = "grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">
        <h2>The board is empty</h2>
        <p>Add your first load using the form above!</p>
      </div>
        `;
    return;
  }

  const filtered = filteredLoads();

  if (filtered.length === 0) {
    container.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">
      <p>No matches found for your search criteria.</p>
    </div>
      `;
    return;
  }
  filtered.forEach((load) => {
    container.appendChild(createCard(load));
  });
}

//id="logic filter"
function filteredLoads() {
  const searchValue = filterSearch.value.toLowerCase();
  const selectedStatus = filterStatus.value;
  const minWeight = Number(filterMinWeight.value) || 0;

  return loads.filter((load) => {
    const matchesSearch = load.title.toLowerCase().includes(searchValue);
    const matchesStatus =
      selectedStatus === "" || load.status === selectedStatus;
    const matchesWeight = load.weight >= minWeight;
    return matchesSearch && matchesStatus && matchesWeight;
  });
}

//id="logic create card"
function createCard(load) {
  const card = document.createElement("div");
  card.classList.add("card");

  const status = load.status; //id="logic status"

  let statusColor;
  switch (status.toLowerCase()) {
    case "in progress":
      statusColor = "#ffc107";
      break;
    case "delivered":
      statusColor = "#28a745";
      break;
    default:
      statusColor = "#17a2b8";
      break;
  }

  const weightDisplay = !isNaN(Number(load.weight))
    ? Number(load.weight).toLocaleString("en-US")
    : "-";

  const isOversize = Number(load.width) > 8.5 || Number(load.weight) > 80000;
  if (isOversize) {
    card.style.borderLeft = "7px solid #dc3545";
  }

  card.innerHTML = `
            <div class="status-badge" style="background-color: ${statusColor}">${status}</div>
            <h3>${load.title}</h3>
            <P><b>Weight:</b> ${weightDisplay} lbs</P>
            <p><b>Dimensions:</b>
            ${load.length}' x 
            ${load.width}' x 
            ${load.height}' </p>
            <p><b>Route:</b> ${load.from} → ${load.to}</p>

            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
        `;

  card
    .querySelector(".edit-btn")
    .addEventListener("click", () => startEdit(load));
  card
    .querySelector(".delete-btn")
    .addEventListener("click", () => deleteLoad(load.id));

  return card;
}

renderLoads();

//id="logic delete"
function deleteLoad(id) {
  if (confirm("Are you sure you want to delete this load?")) {
    loads = loads.filter((load) => load.id !== id);

    saveLoads();

    renderLoads();
  }
}

//id="logic edit"
function startEdit(load) {
  titleInput.value = load.title;
  weightInput.value = load.weight;
  fromInput.value = load.from;
  toInput.value = load.to;
  lengthInput.value = load.length;
  widthInput.value = load.width;
  heightInput.value = load.height;
  statusSelect.value = load.status;

  editingId = load.id;

  addBtn.textContent = "Update";
  cancelBtn.style.display = "inline-block";
}

//id="logic reset form"
function resetForm() {
  editingId = null;
  const inputs = [
    titleInput,
    weightInput,
    fromInput,
    toInput,
    lengthInput,
    widthInput,
    heightInput,
  ];
  inputs.forEach((input) => {
    input.value = "";
    input.style.border = "";
  });
  statusSelect.selectedIndex = 0;
  addBtn.textContent = "Add Load";
  cancelBtn.style.display = "none";
}
console.log(loads);

//id="filter search load"
if (filterSearch) {
  filterSearch.addEventListener("input", () => {
    renderLoads();
  });
}
if (filterStatus) {
  filterStatus.addEventListener("change", () => {
    renderLoads();
  });
}
if (filterMinWeight) {
  filterMinWeight.addEventListener("input", () => {
    renderLoads();
  });
}
