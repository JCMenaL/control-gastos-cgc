
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
document.addEventListener('DOMContentLoaded', () => {
  // Registro de usuario
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault(); // Previene el envío del formulario por defecto

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
  } 
});

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Previene el envío del formulario por defecto
  
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
  
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
  
          // Almacenar el correo en el almacenamiento local
          localStorage.setItem('userEmail', user.email);
  
          console.log('Usuario logueado:', user);
          M.toast({ html: 'Login correcto' }); // Toast con mensaje de éxito
          
          // Redirigir a registro.html después del login exitoso
          window.location.href = 'registro.html';
        } catch (error) {
          console.error('Error en el login:', error);
          M.toast({ html: `Error: ${error.message}` });
        }
      });
    } else {
      console.error('Formulario de login no encontrado en el DOM.');
    }
  });
  
 
let nFactura = document.getElementById("nFactura");
let foto = document.getElementById("foto");
let tGasto = document.getElementById("tGasto");
let monto = document.getElementById("monto");

let addBtn = document.getElementById("addBtn");
//let retBtn = document.getElementById("retBtn");
//et upBtn = document.getElementById("upBtn");
//let delBtn = document.getElementById("delBtn");


// Función para validar los campos del formulario
function validateForm() {
    const tGastoValue = tGasto.value;
    const nFacturaValue = nFactura.value;
    const montoValue = monto.value;
    const fotoValue = foto.value;

    // Verifica si alguno de los campos está vacío
    if (!tGastoValue || !nFacturaValue || !montoValue || !fotoValue) {
        alert('Por favor, completa todos los campos.');
        return false; // Indica que la validación falló
    }
    return true; // Indica que la validación pasó
}


function AddData() {
    set(ref(db, 'EmployeeSet/' + monto.value), {
        nFacturaEmpleado: { nFactura: nFactura.value, foto: foto.value },
        departamento: tGasto.value,
        cnic: Number(monto.value)
    }).then(() => {
        alert("Datos agregados correctamente");
    }).catch((error) => {
        alert("Error al agregar datos");
        console.log(error);
    });
}
