// Importar las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  Timestamp, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";

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
    registrosContenedor.innerHTML = `<<h5 style="text-align: center; font-weight: bold;">Registros de: ${mes}</h5>`;
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
      const docId = doc.id; // ID del documento para eliminar
      totalMonto += data.monto; // Sumar el monto de cada documento

      // Manejo de la fecha de creación
      let fechaCreacion = "";
      if (data.fechaCreacion && data.fechaCreacion.toDate) {
        fechaCreacion = data.fechaCreacion.toDate().toLocaleString();
      } else {
        fechaCreacion = "Fecha no disponible";
      }

      // Verifica la URL de la foto
      const fotoURL = data.foto;
      const fotoNombre = fotoURL ? decodeURIComponent(fotoURL.split('/').pop().split('?')[0]) : null; // Decodificar y obtener el nombre del archivo
      console.log(`URL de la foto: ${fotoURL}`);
      console.log(`Nombre del archivo: ${fotoNombre}`);

      const gastoItem = `<div class="gasto-item">
          <p><strong>Tipo de Gasto:</strong> ${data.tipoGasto}</p>
          <p><strong>Número de Factura:</strong> ${data.numeroFactura}</p>
          <p><strong>Monto:</strong> ₡${data.monto.toLocaleString("es-CR", {
            minimumFractionDigits: 0,
          })}</p>
          <p><strong>Fecha de Creación:</strong> ${fechaCreacion}</p>
          <p><strong>Foto:</strong> <a href="${fotoURL}" target="_blank">Ver Foto</a></p>
          <button class="btn eliminar-btn" data-id="${docId}" data-foto="${fotoURL}">Eliminar</button>
          <hr />
        </div>
      `;
      registrosContenedor.innerHTML += gastoItem;
    });

    //Esta linea muestra el total de gastos registrados
    totalMontoContenedor.innerHTML = `<p> ₡${totalMonto.toLocaleString(
      "es-CR",
      { minimumFractionDigits: 0 }
    )}</p>`;

    // Añadir eventos para los botones de eliminar
    document.querySelectorAll('.eliminar-btn').forEach(button => {
      button.addEventListener('click', async () => {
        const docId = button.getAttribute('data-id');
        const fotoURL = button.getAttribute('data-foto');
        if (fotoURL && confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
          try {
            // Eliminar el documento de Firestore
            await deleteDoc(doc(db, `usuarios/${user.uid}/meses/${mes}/gastos`, docId));

            // Eliminar el archivo de Storage
            const fotoNombre = decodeURIComponent(fotoURL.split('/').pop().split('?')[0]); // Decodificar y obtener el nombre del archivo
            const storageRef = ref(storage, `fotos/${fotoNombre}`);
            await deleteObject(storageRef);

            M.toast({ html: 'Gasto y foto eliminados correctamente' });
            mostrarRegistros(mes); // Volver a cargar los registros
          } catch (error) {
            console.error('Error al eliminar el gasto:', error);
            M.toast({ html: `Error: ${error.message}` });
          }
        }
      });
    });

  } catch (error) {
    console.error("Error al mostrar los registros:", error);
    M.toast({ html: `Error: ${error.message}` });
  }
}

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
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
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

  let isSubmitting = false; // Variable global para manejar el estado de envío

  async function agregarGastoConFoto(event) {
    event.preventDefault(); // Prevenir el comportamiento por defecto del formulario
  
    if (isSubmitting) {
      return; // Evitar múltiples envíos si ya está en proceso
    }
  
    isSubmitting = true; // Establecer el indicador de carga
  
    // Obtener el formulario y verificar si existe
    const form = document.getElementById("agregarDatosForm");
    if (!form) {
      console.error("Formulario no encontrado.");
      isSubmitting = false; // Rehabilitar el indicador de carga
      return;
    }
  
    // Deshabilitar el botón de envío para evitar múltiples envíos
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Enviando...";
    } else {
      console.error("Botón de envío no encontrado.");
      isSubmitting = false; // Rehabilitar el indicador de carga
      return;
    }
  
    const mes = document.getElementById("mesSelect").value;
    const tipoGasto = document.getElementById("tipoGasto").value;
    const numeroFactura = document.getElementById("numeroFactura").value;
    const monto = document.getElementById("monto").value;
    const file = document.getElementById("foto").files[0];
  
    if (!mes || !tipoGasto || !numeroFactura || !monto || !file) {
      alert("Por favor, completa todos los campos.");
      submitButton.disabled = false; // Habilitar el botón de envío si faltan campos
      submitButton.textContent = "Agregar Gasto";
      isSubmitting = false; // Rehabilitar el indicador de carga
      return;
    }
  
    try {
      // Subir la foto a Firebase Storage
      const storageRef = ref(storage, `fotos/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      console.log('Subida completada:', snapshot);
  
      // Obtener la URL de la foto
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('Archivo disponible en:', downloadURL);
  
      // Obtener el usuario autenticado
      const user = auth.currentUser;
      if (user) {
        // Agregar el gasto a Firestore
        await addDoc(collection(db, `usuarios/${user.uid}/meses/${mes}/gastos`), {
          tipoGasto: tipoGasto,
          numeroFactura: numeroFactura,
          monto: Number(monto),
          foto: downloadURL,
          fechaCreacion: Timestamp.now(),
        });
        console.log('Datos y URL de la imagen guardados en Firestore');
        M.toast({ html: "Gasto agregado correctamente" });
        // Limpiar el formulario
        form.reset();
      } else {
        M.toast({ html: "No estás autenticado" });
      }
    } catch (error) {
      console.error('Error al agregar el gasto:', error);
      M.toast({ html: `Error: ${error.message}` });
    } finally {
      // Habilitar el botón de envío después de completar la operación
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Agregar Gasto";
      }
      isSubmitting = false; // Rehabilitar el indicador de carga
    }
  }

  // Asignar el manejador de eventos al formulario
  const agregarDatosForm = document.getElementById("agregarDatosForm");
  if (agregarDatosForm) {
    agregarDatosForm.addEventListener("submit", agregarGastoConFoto);
  } else {
    console.error("Formulario agregarDatosForm no encontrado.");
  }
});


document.addEventListener("DOMContentLoaded", () => {
  const { jsPDF } = window.jspdf;

  async function obtenerImagenData(url) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error al obtener la imagen:", error);
      return null;
    }
  }

  // Función para regenerar el token
  async function regenerarToken() {
    try {
      const user = auth.currentUser;
      if (user) {
        await user.getIdToken(true); // Fuerza la regeneración del token
        console.log("Token regenerado exitosamente");
      } else {
        console.log("No hay usuario autenticado");
      }
    } catch (error) {
      console.error("Error al regenerar el token:", error);
    }
  }

  async function generarPDF() {
    await regenerarToken(); // Llamar a la función para regenerar el token

    const user = auth.currentUser;
    if (!user) {
      M.toast({ html: "No estás autenticado" });
      return;
    }

    const mes = document.getElementById("mesSelect").value;
    if (!mes) {
      M.toast({ html: "Selecciona un mes" });
      return;
    }

    // Deshabilitar el botón mientras se genera el PDF
    const botonGenerarPDF = document.getElementById("exportPDF");
    botonGenerarPDF.disabled = true;
    botonGenerarPDF.textContent = "Generando PDF...";

    try {
      const querySnapshot = await getDocs(
        collection(db, `usuarios/${user.uid}/meses/${mes}/gastos`)
      );

      if (querySnapshot.empty) {
        M.toast({ html: "No hay registros para el mes seleccionado" });
        botonGenerarPDF.disabled = false;
        botonGenerarPDF.textContent = "Generar PDF";
        return;
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const lineHeight = 10;
      const imageWidth = 50;
      const imageHeight = 50;
      const maxY = 250; // Ajusta el límite de la página según sea necesario

      // Encabezado centrado
      doc.setFontSize(16);
      let text = 'Informe de Gastos';
      let textWidth = doc.getTextWidth(text);
      let x = (pageWidth - textWidth) / 2;
      doc.text(text, x, 10);

      doc.setFontSize(12);
      text = `Usuario: ${user.email}`;
      textWidth = doc.getTextWidth(text);
      x = (pageWidth - textWidth) / 2;
      doc.text(text, x, 20);

      text = `Fecha de Generación: ${new Date().toLocaleString()}`;
      textWidth = doc.getTextWidth(text);
      x = (pageWidth - textWidth) / 2;
      doc.text(text, x, 30);

      text = '-----------------------------';
      textWidth = doc.getTextWidth(text);
      x = (pageWidth - textWidth) / 2;
      doc.text(text, x, 40);

      text = `Registros de: ${mes}`;
      textWidth = doc.getTextWidth(text);
      x = (pageWidth - textWidth) / 2;
      doc.text(text, x, 50);

      text = '-----------------------------';
      textWidth = doc.getTextWidth(text);
      x = (pageWidth - textWidth) / 2;
      doc.text(text, x, 60);

      let y = 70;

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();

        // Verificar si se necesita agregar una nueva página
        if (y + imageHeight > maxY) {
          doc.addPage();
          y = 10; // Reiniciar la posición vertical para la nueva página
        }

        // Añadir datos del gasto
        doc.setFontSize(12);
        doc.text(`Tipo de Gasto: ${data.tipoGasto}`, 10, y);
        doc.text(`Número de Factura: ${data.numeroFactura}`, 10, y + lineHeight);
        doc.text(`Monto: ₡${data.monto.toLocaleString("es-CR", { minimumFractionDigits: 2 })}`, 10, y + 2 * lineHeight);
        doc.text(`Fecha de Creación: ${data.fechaCreacion.toDate().toLocaleString()}`, 10, y + 3 * lineHeight);

        // Posición para la imagen y el enlace
        let imageX = 120; // Ajusta la posición horizontal de la imagen
        let imageY = y;

        // Añadir imagen
        if (data.foto) {
          const imageUrl = await obtenerImagenData(data.foto);
          if (imageUrl) {
            // Verificar si se necesita agregar una nueva página
            if (y + imageHeight > maxY) {
              doc.addPage();
              y = 10; // Reiniciar la posición vertical para la nueva página
            }
            doc.addImage(imageUrl, 'PNG', imageX, imageY, imageWidth, imageHeight); // Ajustar posición y tamaño según sea necesario

            // Añadir enlace a la imagen
            doc.link(imageX, imageY, imageWidth, imageHeight, { url: data.foto });
            y += imageHeight + 10; // Espacio adicional después de la imagen
          }
        } else {
          doc.text('Foto no disponible', 10, y + 4 * lineHeight);
          y += lineHeight + 10; // Espacio adicional si no hay foto
        }

        // Añadir línea divisoria entre registros
        if (y + lineHeight < maxY) { // Verificar si hay espacio suficiente para la línea
          doc.line(10, y + lineHeight, pageWidth - 10, y + lineHeight);
          y += lineHeight + 10; // Espacio después de la línea
        } else {
          doc.addPage();
          y = 10; // Reiniciar la posición vertical para la nueva página
        }
      }

      doc.save(`Registros_${mes}.pdf`);
      M.toast({ html: "PDF generado correctamente" });
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      M.toast({ html: `Error: ${error.message}` });
    } finally {
      // Habilitar el botón después de generar el PDF
      botonGenerarPDF.disabled = false;
      botonGenerarPDF.textContent = "Generar PDF";
    }
  }

  
  document.getElementById("exportPDF").addEventListener("click", generarPDF);
});




