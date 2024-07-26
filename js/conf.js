
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, child, get, set, update, remove } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

// Your web app's Firebase configuration
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
const auth = getAuth(app);

// Registro de usuario
const registerForm = document.getElementById('registerForm');
registerForm.addEventListener('submit', async (e) => {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('Usuario registrado:', userCredential.user);
        M.toast({html: 'Registro exitoso'});
        registerForm.reset();
    } catch (error) {
        console.error('Error en el registro:', error);
        M.toast({html: `Error: ${error.message}`});
    }
});

// Login de usuario
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', async (e) => {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Usuario logueado:', userCredential.user);
        M.toast({html: 'Login exitoso'});
        loginForm.reset();
    } catch (error) {
        console.error('Error en el login:', error);
        M.toast({html: `Error: ${error.message}`});
    }
});


//Cambio de pagina
document.addEventListener('DOMContentLoaded', function() {
    // Referencia a los elementos de la interfaz
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');

    if (emailInput && passwordInput && loginBtn) {
        // Función para manejar el inicio de sesión
        loginBtn.addEventListener('click', () => {
            const email = emailInput.value;
            const password = passwordInput.value;

            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // Usuario autenticado correctamente
                    window.location.href = 'registro.html'; // Redirigir a otra página
                })
                .catch((error) => {
                    // Manejar errores
                    console.error('Error al iniciar sesión:', error.message);
                    alert('Error al iniciar sesión: ' + error.message);
                });
        });
    } else {
        console.error('No se pudieron encontrar uno o más elementos del DOM');
    }
});


let nombre = document.getElementById("nombre");
let apellido = document.getElementById("apellido");
let dpto = document.getElementById("dpto");
let cnciInp = document.getElementById("cnciInp");

let addBtn = document.getElementById("addBtn");
//let retBtn = document.getElementById("retBtn");
l//et upBtn = document.getElementById("upBtn");
//let delBtn = document.getElementById("delBtn");

const employeeTable = document.getElementById("employeeTable").getElementsByTagName('tbody')[0];

// Función para validar los campos del formulario
function validateForm() {
    const dptoValue = dpto.value;
    const nombreValue = nombre.value;
    const montoValue = cnciInp.value;
    const fotoValue = apellido.value;

    // Verifica si alguno de los campos está vacío
    if (!dptoValue || !nombreValue || !montoValue || !fotoValue) {
        alert('Por favor, completa todos los campos.');
        return false; // Indica que la validación falló
    }
    return true; // Indica que la validación pasó
}


function AddData() {
    set(ref(db, 'EmployeeSet/' + cnciInp.value), {
        nombreEmpleado: { Nombre: nombre.value, Apellido: apellido.value },
        departamento: dpto.value,
        cnic: Number(cnciInp.value)
    }).then(() => {
        alert("Datos agregados correctamente");
    }).catch((error) => {
        alert("Error al agregar datos");
        console.log(error);
    });
}
/*async function RetData() {
    if (!validateForm()) return; // Verifica la validación antes de continuar

    const dbRef = ref(db);
    try {
        const snapshot = await get(child(dbRef, 'EmployeeSet/' + cnciInp.value));
        if (snapshot.exists()) {
            nombre.value = snapshot.val().nombreEmpleado.Nombre;
            apellido.value = snapshot.val().nombreEmpleado.Apellido;
            dpto.value = snapshot.val().departamento;
        } else {
            alert("Empleado no existe");
        }
    } catch (error) {
        alert("Error al recuperar los datos");
        console.log(error);
    }
}

async function UpdateData() {
    if (!validateForm()) return; // Verifica la validación antes de continuar

    try {
        await update(ref(db, 'EmployeeSet/' + cnciInp.value), {
            nombreEmpleado: { Nombre: nombre.value, Apellido: apellido.value },
            departamento: dpto.value
        });
        alert("Datos actualizados correctamente");
        await updateTable();
        // Limpiar los campos después de actualizar
        nombre.value = "";
        apellido.value = "";
        dpto.value = "";
        cnciInp.value = "";
    } catch (error) {
        alert("Error al actualizar datos");
        console.log(error);
    }
}*/

// Función para formatear valores en colón costarricense
function formatToColones(value) {
    return new Intl.NumberFormat('es-CR', {
        style: 'currency',
        currency: 'CRC',
        minimumFractionDigits: 0, // Puedes ajustar el número de decimales según tus necesidades
        maximumFractionDigits: 2
    }).format(value);
}

function updateTable(snapshot) {
    employeeTable.innerHTML = ""; // Limpia la tabla

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
}


window.onload = () => {
    initializeTableListener();
};

// Agrega eventos a los botones
addBtn.addEventListener('click', AddData);

// Inicializar la tabla al cargar la página
updateTable();     

//resetear el select 
function resetSelect() {
    const dptoSelect = document.getElementById('dpto');
    dptoSelect.selectedIndex = 0; // Restablece al primer elemento (la opción con value="")
}





