// Importar las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, doc, setDoc, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDyWMNcIv6CUss6oICUgOuJRu_03JpFMZs",
  authDomain: "cofersa-f5a80.firebaseapp.com",
  databaseURL: "https://cofersa-f5a80-default-rtdb.firebaseio.com",
  projectId: "cofersa-f5a80",
  storageBucket: "cofersa-f5a80.appspot.com",
  messagingSenderId: "471398985252",
  appId: "1:471398985252:web:792b7318f26cffeb0a32b1",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Función para crear una colección del usuario
async function createUserCollection(user) {
  const userRef = doc(db, "usuarios", user.uid);
  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  for (const month of months) {
    const monthRef = doc(userRef, "meses", month);
    await setDoc(monthRef, { nombre: month });
  }
  console.log('Colección de usuario creada con meses.');
}

// Función para cargar el mes seleccionado del localStorage
function loadSelectedMonth() {
  const selectedMonth = localStorage.getItem('selectedMonth');
  if (selectedMonth) {
    const mesSelect = document.getElementById('mesSelect');
    if (mesSelect) {
      mesSelect.value = selectedMonth;
      mostrarRegistros(selectedMonth); // Mostrar registros del mes guardado
    }
  }
}

// Función para guardar el mes seleccionado en el localStorage y mostrar registros
function saveSelectedMonth() {
  const mesSelect = document.getElementById('mesSelect');
  if (mesSelect) {
    mesSelect.addEventListener('change', () => {
      const selectedMonth = mesSelect.value;
      localStorage.setItem('selectedMonth', selectedMonth);
      mostrarRegistros(selectedMonth); // Mostrar registros del mes seleccionado
    });
  }
}

// Función para obtener el mes actual en formato "Mes"
function obtenerMesActual() {
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const fechaActual = new Date();
  return meses[fechaActual.getMonth()];
}

// Función para mostrar los registros del mes seleccionado
async function mostrarRegistros(mes) {
  const user = auth.currentUser;
  if (!user) {
    return;
  }

  const registrosContenedor = document.getElementById('registrosLista');
  if (!registrosContenedor) {
    console.error('Contenedor de registros no encontrado en el DOM.');
    return;
  }

  // Si no se proporciona un mes, usa el mes actual
  if (!mes) {
    mes = obtenerMesActual();
  }

  if (!mes) {
    console.error('El mes seleccionado no es válido.');
    registrosContenedor.innerHTML = '<p>Selecciona un mes válido.</p>';
    return;
  }

  try {
    // Mostrar el nombre del mes
    registrosContenedor.innerHTML = `<h5>Registros de ${mes}</h5>`;

    const querySnapshot = await getDocs(collection(db, `usuarios/${user.uid}/meses/${mes}/gastos`));
    if (querySnapshot.empty) {
      registrosContenedor.innerHTML += '<p>No hay registros para el mes seleccionado.</p>';
      return;
    }

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const gastoItem = `
        <div class="gasto-item">
          <p><strong>Tipo de Gasto:</strong> ${data.tipoGasto}</p>
          <p><strong>Número de Factura:</strong> ${data.numeroFactura}</p>
          <p><strong>Monto:</strong> ${data.monto}</p>
          <p><strong>Foto:</strong> <a href="${data.foto}" target="_blank">Ver Foto</a></p>
        </div>
        <hr />
      `;
      registrosContenedor.innerHTML += gastoItem;
    });
  } catch (error) {
    console.error('Error al mostrar los registros:', error);
    M.toast({ html: `Error: ${error.message}` });
  }
}

// Llamada a mostrarRegistros con el mes actual al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  mostrarRegistros(); // Mostrar registros del mes actual si no se pasa un mes específico



  // Manejo del inicio de sesión
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        localStorage.setItem('userEmail', user.email);
        console.log('Usuario logueado:', user);
        M.toast({ html: 'Login correcto' });
        window.location.href = 'registro.html';
      } catch (error) {
        console.error('Error en el login:', error);
        M.toast({ html: `Error: ${error.message}` });
      }
    });
  } else {
    console.error('Formulario de login no encontrado en el DOM.');
  }

  // Cargar el mes seleccionado al cargar el modal
  loadSelectedMonth();

  // Guardar el mes seleccionado en el localStorage y mostrar registros
  saveSelectedMonth();

  // Manejo del formulario para agregar datos
  const agregarDatosForm = document.getElementById('agregarDatosForm');
  if (agregarDatosForm) {
    agregarDatosForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const mes = document.getElementById('mesSelect').value;
      const tipoGasto = document.getElementById('tipoGasto').value;
      const numeroFactura = document.getElementById('numeroFactura').value;
      const monto = document.getElementById('monto').value;
      const foto = document.getElementById('foto').value;

      if (!mes || !tipoGasto || !numeroFactura || !monto || !foto) {
        alert('Por favor, completa todos los campos.');
        return;
      }

      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = await addDoc(collection(db, `usuarios/${user.uid}/meses/${mes}/gastos`), {
            tipoGasto: tipoGasto,
            numeroFactura: numeroFactura,
            monto: Number(monto),
            foto: foto
          });
          console.log('Documento añadido con ID: ', docRef.id);
          M.toast({ html: 'Gasto agregado correctamente' });
          agregarDatosForm.reset(); // Limpiar el formulario después de agregar datos
          // Mostrar registros del mes actualizado
          mostrarRegistros(mes);
        } else {
          M.toast({ html: 'No estás autenticado' });
        }
      } catch (error) {
        console.error('Error al agregar el gasto:', error);
        M.toast({ html: `Error: ${error.message}` });
      }
    });
  }
});
