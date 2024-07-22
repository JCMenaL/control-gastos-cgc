
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, child, get, set, update, remove } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDyWMNcIv6CUss6oICUgOuJRu_03JpFMZs",
  authDomain: "cofersa-f5a80.firebaseapp.com",
  databaseURL: "https://cofersa-f5a80-default-rtdb.firebaseio.com",
  projectId: "cofersa-f5a80",
  storageBucket: "cofersa-f5a80.appspot.com",
  messagingSenderId: "471398985252",
  appId: "1:471398985252:web:792b7318f26cffeb0a32b1",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let nombre = document.getElementById("nombre");
let apellido = document.getElementById("apellido");
let dpto = document.getElementById("dpto");
let cnciInp = document.getElementById("cnciInp");

let addBtn = document.getElementById("addBtn");
let retBtn = document.getElementById("retBtn");
let upBtn = document.getElementById("upBtn");
let delBtn = document.getElementById("delBtn");

let employeeTable = document.getElementById("employeeTable").getElementsByTagName('tbody')[0];

function AddData() {
    set(ref(db, 'EmployeeSet/' + cnciInp.value), {
        nombreEmpleado: { Nombre: nombre.value, Apellido: apellido.value },
        departamento: dpto.value,
        cnic: Number(cnciInp.value)
    }).then(() => {
        alert("Datos agregados correctamente");
        updateTable();
    }).catch((error) => {
        alert("Error al agregar datos");
        console.log(error);
    });
}

function RetData() {
    const dbRef = ref(db);

    get(child(dbRef, 'EmployeeSet/' + cnciInp.value)).then((snapshot) => {
        if (snapshot.exists()) {
            nombre.value = snapshot.val().nombreEmpleado.Nombre;
            apellido.value = snapshot.val().nombreEmpleado.Apellido;
            dpto.value = snapshot.val().departamento;
            updateTable();
        } else {
            alert("Empleado no existe");
        }
    }).catch((error) => {
        alert("Error al recuperar los datos");
        console.log(error);
    });
}

function UpdateData() {
    update(ref(db, 'EmployeeSet/' + cnciInp.value), {
        nombreEmpleado: { Nombre: nombre.value, Apellido: apellido.value },
        departamento: dpto.value
    }).then(() => {
        alert("Datos actualizados correctamente");
        updateTable();
    }).catch((error) => {
        alert("Error al actualizar datos");
        console.log(error);
    });
}

function DeleteData() {
    remove(ref(db, 'EmployeeSet/' + cnciInp.value)).then(() => {
        alert("Datos borrados correctamente");
        updateTable();
    }).catch((error) => {
        alert("Error al borrar datos");
        console.log(error);
    });
}

function updateTable() {
    employeeTable.innerHTML = "";
    const dbRef = ref(db);

    get(child(dbRef, 'EmployeeSet')).then((snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach(childSnapshot => {
                let row = employeeTable.insertRow();
                let cnicCell = row.insertCell(0);
                let nombreCell = row.insertCell(1);
                let apellidoCell = row.insertCell(2);
                let dptoCell = row.insertCell(3);

                cnicCell.textContent = childSnapshot.key;
                nombreCell.textContent = childSnapshot.val().nombreEmpleado.Nombre;
                apellidoCell.textContent = childSnapshot.val().nombreEmpleado.Apellido;
                dptoCell.textContent = childSnapshot.val().departamento;
            });
        } else {
            console.log("No hay datos disponibles");
        }
    }).catch((error) => {
        console.log("Error al recuperar los datos", error);
    });
}

addBtn.addEventListener('click', AddData);
retBtn.addEventListener('click', RetData);
upBtn.addEventListener('click', UpdateData);
delBtn.addEventListener('click', DeleteData);

// Inicializar la tabla al cargar la página
updateTable();