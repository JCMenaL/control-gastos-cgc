// Importar las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDyWMNcIv6CUss6oICUgOuJRu_03JpFMZs",
  authDomain: "cofersa-f5a80.firebaseapp.com",
  databaseURL: "https://cofersa-f5a80-default-rtdb.firebaseio.com",
  projectId: "cofersa-f5a80",
  storageBucket: "cofersa-f5a80.appspot.com",
  messagingSenderId: "471398985252",
  appId: "1:471398985252:web:792b7318f26cffeb0a32b1",
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);  






// Función para crear una colección del usuario
async function createUserCollection(user) {
  const userRef = doc(db, "usuarios", user.uid);
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  for (const month of months) {
    const monthRef = doc(userRef, "meses", month);
    await setDoc(monthRef, { nombre: month });
  }
  console.log("Colección de usuario creada.");
}

// Manejo del registro de usuario
document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("registerEmail").value;
      const password = document.getElementById("registerPassword").value;
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        await createUserCollection(user);
        console.log("Usuario registrado y colección creada:", user);
        M.toast({ html: "Registro exitoso y colección creada" });
        registerForm.reset();
      } catch (error) {
        console.error("Error en el registro:", error);
        M.toast({ html: `Error: ${error.message}` });
      }
    });
  }
});
// Función para cargar el mes seleccionado del localStorage
function loadSelectedMonth() {
  const selectedMonth = localStorage.getItem("Date");
  if (selectedMonth) {
    const mesSelect = document.getElementById("mesSelect");
    if (mesSelect) {
      mesSelect.value = selectedMonth;
      mostrarRegistros(selectedMonth); // Mostrar registros del mes guardado
    }
  }
}

// Función para guardar el mes seleccionado en el localStorage y mostrar registros
function saveSelectedMonth() {
  const mesSelect = document.getElementById("mesSelect");
  if (mesSelect) {
    mesSelect.addEventListener("change", () => {
      const selectedMonth = mesSelect.value;
      localStorage.setItem("selectedMonth", selectedMonth);
      mostrarRegistros(selectedMonth); // Mostrar registros del mes seleccionado
    });
  }
}

// Función para obtener el mes actual en formato "Mes"
function obtenerMesActual() {
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
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

  const registrosContenedor = document.getElementById("registrosLista");
  const totalMontoContenedor = document.getElementById("totalMonto");
  if (!registrosContenedor || !totalMontoContenedor) {
    console.error(
      "Contenedor de registros o total de monto no encontrado en el DOM."
    );
    return;
  }

  if (!mes) {
    mes = obtenerMesActual();
  }

  if (!mes) {
    console.error("El mes seleccionado no es válido.");
    registrosContenedor.innerHTML = "<p>Selecciona un mes válido.</p>";
    return;
  }

  try {
    registrosContenedor.innerHTML = `<h5>Registros de ${mes}</h5>`;
    let totalMonto = 0;

    const querySnapshot = await getDocs(
      collection(db, `usuarios/${user.uid}/meses/${mes}/gastos`)
    );
    if (querySnapshot.empty) {
      registrosContenedor.innerHTML +=
        "<p>No hay registros para el mes seleccionado.</p>";
      totalMontoContenedor.innerHTML = "<p>Total: ₡0.00</p>";
      return;
    }

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      totalMonto += data.monto; // Sumar el monto de cada documento

      // Manejo de la fecha de creación
      let fechaCreacion = "";
      if (data.fechaCreacion && data.fechaCreacion.toDate) {
        fechaCreacion = data.fechaCreacion.toDate().toLocaleString();
      } else {
        fechaCreacion = "Fecha no disponible";
      }

      // Verifica la URL de la foto
      console.log(`URL de la foto: ${data.foto}`);

      const gastoItem = `<div class="gasto-item">
          <p><strong>Tipo de Gasto:</strong> ${data.tipoGasto}</p>
          <p><strong>Número de Factura:</strong> ${data.numeroFactura}</p>
          <p><strong>Monto:</strong> ₡${data.monto.toLocaleString("es-CR", {
            minimumFractionDigits: 0,
          })}</p>
          <p><strong>Fecha de Creación:</strong> ${fechaCreacion}</p>
          <p><strong>Foto:</strong> <a href="${data.foto}" target="_blank">Ver Foto</a></p>
        </div>
        <hr />
      `;
      registrosContenedor.innerHTML += gastoItem;
    });

    totalMontoContenedor.innerHTML = `<p>Total: ₡${totalMonto.toLocaleString(
      "es-CR",
      { minimumFractionDigits: 2 }
    )}</p>`;
  } catch (error) {
    console.error("Error al mostrar los registros:", error);
    M.toast({ html: `Error: ${error.message}` });
  }
}

// Llamada a mostrarRegistros con el mes actual al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  mostrarRegistros(); // Mostrar registros del mes actual si no se pasa un mes específico

  // Manejo del inicio de sesión
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value;
      const password = document.getElementById("loginPassword").value;
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        localStorage.setItem("userEmail", user.email);
        console.log("Usuario logueado:", user);
        M.toast({ html: "Login correcto" });
        window.location.href = "registro.html";
      } catch (error) {
        console.error("Error en el login:", error);
        M.toast({ html: `Error: ${error.message}` });
      }
    });
  } else {
    console.error("Formulario de login no encontrado en el DOM.");
  }

  // Cargar el mes seleccionado al cargar el modal
  loadSelectedMonth();

  // Guardar el mes seleccionado en el localStorage y mostrar registros
  saveSelectedMonth();

  // Manejo del formulario para agregar datos
  const agregarDatosForm = document.getElementById("agregarDatosForm");
  if (agregarDatosForm) {
    agregarDatosForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const mes = document.getElementById("mesSelect").value;
      const tipoGasto = document.getElementById("tipoGasto").value;
      const numeroFactura = document.getElementById("numeroFactura").value;
      const monto = document.getElementById("monto").value;
      const foto = document.getElementById("foto").value;

      if (!mes || !tipoGasto || !numeroFactura || !monto || !foto) {
        alert("Por favor, completa todos los campos.");
        return;
      }

      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = await addDoc(
            collection(db, `usuarios/${user.uid}/meses/${mes}/gastos`),
            {
              tipoGasto: tipoGasto,
              numeroFactura: numeroFactura,
              monto: Number(monto),
              foto: foto,
              fechaCreacion: Timestamp.now(), // Almacenar la fecha de creación
            }
          );
          console.log("Documento añadido con ID: ", docRef.id);
          M.toast({ html: "Gasto agregado correctamente" });
          agregarDatosForm.reset(); // Limpiar el formulario después de agregar datos
          // Mostrar registros del mes actualizado
        } else {
          M.toast({ html: "No estás autenticado" });
        }
      } catch (error) {
        console.error("Error al agregar el gasto:", error);
        M.toast({ html: `Error: ${error.message}` });
      }
    });
  }
});


// Capturar el archivo seleccionado
document.getElementById('foto').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    // Crear una referencia a la ubicación donde se almacenará la imagen
    const storageRef = ref(storage, `fotos/${file.name}`);
    uploadBytes(storageRef, file).then((snapshot) => {
      console.log('Subida completada:', snapshot);

      // Obtener la URL de descarga
      getDownloadURL(snapshot.ref).then((downloadURL) => {
        console.log('Archivo disponible en:', downloadURL);
        // Puedes almacenar esta URL en tu base de datos o usarla según necesites
      });
    }).catch((error) => {
      console.error('Error al subir la imagen:', error);
    });
  }
});


document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('foto');
  const addBtn = document.getElementById('agregarBtn');
  const fileLink = document.getElementById('fileLink');

  if (!fileInput || !addBtn || !fileLink) {
    console.error('Uno o más elementos no se encontraron en el DOM.');
    return;
  }

  const uploadFile = async (file) => {
    const storageRef = ref(storage, `fotos/${file.name}`);
    
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      console.log(`Archivo disponible en: ${downloadURL}`);

      fileLink.href = downloadURL;
      fileLink.textContent = 'Ver Foto';
      fileLink.style.display = 'inline';
    } catch (error) {
      console.error('Error al subir archivo:', error);
    }
  };
});

