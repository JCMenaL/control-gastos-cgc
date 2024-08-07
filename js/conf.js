// Importar las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  addDoc,
  query, 
  where,
  getDocs,
  getDoc,
  Timestamp,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";

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
const storage = getStorage(app);

// Inicialización de Materialize
document.addEventListener("DOMContentLoaded", function () {
  const elems = document.querySelectorAll("select");
  M.FormSelect.init(elems);
  const tabs = document.querySelectorAll(".tabs");
  M.Tabs.init(tabs);

  const userEmailElement = document.getElementById("userEmail");
  const userEmail = localStorage.getItem("userEmail");

  if (userEmailElement && userEmail) {
    userEmailElement.textContent = userEmail;
  }
   // Establecer el año actual en el campo de entrada deshabilitado
   const currentYear = new Date().getFullYear();
   document.getElementById("year").value = currentYear;
 });

  document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fotoURL');
    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      // Tu lógica de subida de archivos aquí
    });
  });
  


  document.addEventListener('DOMContentLoaded', () => {
    // Inicializa los modales
    var elems = document.querySelectorAll('.modal');
    var instances = M.Modal.init(elems, );
  });



  document.addEventListener("DOMContentLoaded", function () {
    // Inicializa el menú hamburguesa de Materialize
    const elems = document.querySelectorAll(".sidenav");
    M.Sidenav.init(elems);


      



    
  
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
  
  })
  

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
    console.error("No hay usuario autenticado.");
    return;
  }

  const registrosContenedor = document.getElementById("registrosLista");
  const totalMontoContenedor = document.getElementById("totalMonto");
  const presupuestoContenedor = document.getElementById("presupuestoMonto"); // Contenedor para el presupuesto

  if (!registrosContenedor || !totalMontoContenedor || !presupuestoContenedor) {
    console.error(
      "Contenedor de registros, total de monto o presupuesto no encontrado en el DOM."
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
    registrosContenedor.innerHTML = `<h5 style="text-align: center; font-weight: bold;">Registros de: ${mes}</h5>`;
    let totalMonto = 0;

    // Obtener el presupuesto del mes seleccionado
    const userRef = doc(db, "usuarios", user.uid);
    const monthRef = doc(userRef, "meses", mes);
    const docSnap = await getDoc(monthRef);

    let presupuesto = 0;
    if (docSnap.exists()) {
      const data = docSnap.data();
      presupuesto = data.presupuesto || 0;
    } else {
      console.error(`No se encontró el documento para el mes ${mes}`);
    }

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
      const fotoNombre = fotoURL
        ? decodeURIComponent(fotoURL.split("/").pop().split("?")[0])
        : null; // Decodificar y obtener el nombre del archivo
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

    
  } catch (error) {
    console.error("Error al obtener datos del mes:", error);
  }
}

// Función para inicializar y verificar la autenticación del usuario
function inicializar() {
  auth.onAuthStateChanged((user) => {
    if (user) {
      // El usuario está autenticado, ahora podemos llamar a mostrarRegistros
      const mesSeleccionado = obtenerMesActual(); // Ajusta esto si tienes una forma específica de obtener el mes
      mostrarRegistros(mesSeleccionado);
    } else {
      console.error("No hay usuario autenticado.");
    }
  });
}

// Asegúrate de que la función se llame después de que el DOM esté listo
document.addEventListener("DOMContentLoaded", inicializar);

// Cargar el mes seleccionado al cargar el modal
loadSelectedMonth();

// Guardar el mes seleccionado en el localStorage y mostrar registros
saveSelectedMonth();

let isSubmitting = false; // Variable global para manejar el estado de envío











document.addEventListener('DOMContentLoaded', () => {
  let currentUser = null;

  // Función para obtener el mes y año actuales
  function getCurrentMonthAndYear() {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1; // Mes actual (1-12)
      return { year, month };
  }

  // Función para crear un nuevo input para el presupuesto
  function createBudgetInput(year, month) {
      const container = document.getElementById('presupuestoContainer');
      const inputWrapper = document.createElement('div');
      inputWrapper.classList.add('input-field');
      
      const monthString = month.toString().padStart(2, '0');
      const id = `${year}-${monthString}`;
      
      inputWrapper.innerHTML = `
          <input id="${id}" type="number" step="0.01" min="0">
          <label for="${id}">Presupuesto ${monthString}/${year}</label>
      `;
      
      container.appendChild(inputWrapper);
      
      // Agregar evento para guardar presupuesto en Firestore cuando se cambie el valor
      inputWrapper.querySelector('input').addEventListener('change', async (event) => {
          const budget = parseFloat(event.target.value);
          if (!isNaN(budget) && currentUser) {
              await saveBudgetToFirestore(currentUser.uid, year, month, budget);
              M.toast({html: 'Presupuesto guardado', classes: 'rounded'});
              updateBudgetMonto(budget, year, month);
          }
      });
  }

  // Función para actualizar los inputs de presupuesto
  async function updateBudgetInputs() {
      // Limpiar el contenedor antes de agregar nuevos inputs
      const container = document.getElementById('presupuestoContainer');
      container.innerHTML = '';

      const { year, month } = getCurrentMonthAndYear();
      
      // Crear inputs para todos los meses desde el inicio del año hasta el mes actual
      for (let m = 1; m <= month; m++) {
          createBudgetInput(year, m);
          if (currentUser) {
              await loadBudgetFromFirestore(currentUser.uid, year, m);
          }
      }
  }

  // Función para guardar el presupuesto en Firestore
  async function saveBudgetToFirestore(userId, year, month, budget) {
      const monthString = month.toString().padStart(2, '0');
      const id = `${year}-${monthString}`;
      await setDoc(doc(db, "users", userId, "presupuestos", id), {
          year,
          month,
          budget
      });
  }

  // Función para cargar el presupuesto desde Firestore
  async function loadBudgetFromFirestore(userId, year, month) {
      const monthString = month.toString().padStart(2, '0');
      const id = `${year}-${monthString}`;
      const docRef = doc(db, "users", userId, "presupuestos", id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
          const budgetData = docSnap.data();
          const input = document.getElementById(id);
          input.value = budgetData.budget;
          await updateBudgetMonto(budgetData.budget, year, month); // Actualizar el monto del presupuesto en el div
          M.updateTextFields(); // Actualizar los campos de texto de Materialize
      }
  }

  // Función para obtener el total de gastos del mes seleccionado
  async function getTotalExpensesForMonth(userId, year, month) {
      const monthString = month.toString().padStart(2, '0');
      const expensesQuery = query(
          collection(db, "users", userId, "gastos"),
          where("year", "==", year),
          where("month", "==", month)
      );
      const querySnapshot = await getDocs(expensesQuery);
      let totalExpenses = 0;
      querySnapshot.forEach((doc) => {
          totalExpenses += doc.data().amount;
      });
      return totalExpenses;
  }

  // Función para actualizar el div con el presupuesto del mes seleccionado
  async function updateBudgetMonto(budget, year, month) {
      const totalExpenses = await getTotalExpensesForMonth(currentUser.uid, year, month);
      const remainingBudget = budget - totalExpenses;
      
      const presupuestoMontoDiv = document.getElementById('presupuestoMonto');
      
      // Actualizar el contenido del div con el presupuesto y la diferencia
      presupuestoMontoDiv.innerHTML = `
          <p>Presupuesto: ₡${budget.toLocaleString("es-CR", { minimumFractionDigits: 0 })}</p>
          <p>Gastos: ₡${totalExpenses.toLocaleString("es-CR", { minimumFractionDigits: 0 })}</p>
          <p>Diferencia: ₡${remainingBudget.toLocaleString("es-CR", { minimumFractionDigits: 0 })}</p>
      `;
  }

  // Manejar autenticación del usuario
  onAuthStateChanged(auth, user => {
      if (user) {
          currentUser = user;
          updateBudgetInputs();
      } else {
          currentUser = null;
          const container = document.getElementById('presupuestoContainer');
          container.innerHTML = '<p>Please log in to see and set your budget.</p>';
          document.getElementById('presupuestoMonto').textContent = ''; // Limpiar el presupuesto mostrado si el usuario cierra sesión
      }
  });

  // Actualizar los inputs cuando se haga clic en el botón
  document.getElementById('addMonthBtn').addEventListener('click', () => {
      if (currentUser) {
          updateBudgetInputs();
      } else {
          M.toast({html: 'Please log in first', classes: 'rounded'});
      }
  });
});
















document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("agregarDatosForm");

  if (form) {
    form.addEventListener("submit", agregarGastoConFoto);
  } else {
    console.error("Formulario no encontrado.");
  }

  // Establecer el valor del campo año al cargar la página
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.value = new Date().getFullYear();
  } else {
    console.error("Campo 'year' no encontrado.");
  }
});

async function agregarGastoConFoto(event) {
  event.preventDefault();

  console.log("Formulario enviado");

  const form = document.getElementById("agregarDatosForm");
  if (!form) {
    console.error("Formulario no encontrado.");
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Enviando...";
  } else {
    console.error("Botón de envío no encontrado.");
    return;
  }

  const yearElement = document.getElementById("year");
  const mesElement = document.getElementById("mes");
  const tipoGastoElement = document.getElementById("tipoGasto");
  const numeroFacturaElement = document.getElementById("numeroFactura");
  const montoElement = document.getElementById("monto");
  const fotoElement = document.getElementById("fotoURL");

  if (!yearElement || !mesElement || !tipoGastoElement || !numeroFacturaElement || !montoElement || !fotoElement) {
    console.error("Uno o más elementos del formulario no se encontraron.");
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Agregar Gasto";
    }
    return;
  }

  const year = yearElement.value;
  const mes = mesElement.value;
  const tipoGasto = tipoGastoElement.value;
  const numeroFactura = numeroFacturaElement.value;
  const monto = montoElement.value;
  const file = fotoElement.files[0]; // Obtén el archivo seleccionado

  try {
    const user = auth.currentUser;
    if (user) {
      let fotoURL = "";
      if (file) {
        fotoURL = await subirImagen(file);
      }

      await addDoc(collection(db, `usuarios/${user.uid}/meses/${mes}/gastos`), {
        year: Number(year),
        tipoGasto: tipoGasto,
        numeroFactura: numeroFactura,
        monto: Number(monto),
        foto: fotoURL,
        fechaCreacion: Timestamp.now(),
      });

      console.log("Datos y URL de la imagen guardados en Firestore");
      M.toast({ html: "Gasto agregado correctamente" });

      form.reset();
      // Establecer el valor del campo año nuevamente después de resetear el formulario
      yearElement.value = new Date().getFullYear();
    } else {
      console.error("No hay usuario autenticado.");
    }
  } catch (error) {
    console.error("Error al agregar gasto:", error);
    M.toast({ html: `Error: ${error.message}` });
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Agregar Gasto";
    }
  }
}

async function subirImagen(file) {
  const storageRef = ref(storage, `imagenes/${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}



// Asignar el manejador de eventos al formulario
const agregarDatosForm = document.getElementById("agregarDatosForm");
if (agregarDatosForm) {
  agregarDatosForm.addEventListener("submit", agregarGastoConFoto);
} else {
  console.error("Formulario agregarDatosForm no encontrado.");
}
import { myFontBase64 } from "./fonts.js"; // Asegúrate de que la ruta sea correcta

const style = document.createElement("style");
style.textContent = `
  @font-face {
    font-family: 'MyFont';
    src: url('data:font/woff2;base64,${myFontBase64}') format('woff2');
    font-weight: normal;
    font-style: normal;
  }
`;


















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

    const mes = document.getElementById("mes").value;
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

      // Agregar fuente personalizada
      doc.addFileToVFS("MyFont.ttf", myFontBase64);
      doc.addFont("MyFont.ttf", "MyFont", "normal");
      doc.setFont("MyFont");

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const lineHeight = 10;
      const imageWidth = 50;
      const imageHeight = 50;
      const recordHeight = 80; // Altura estimada para cada registro, ajustable
      const marginLeft = 20;
      const marginRight = 20;
      const contentWidth = pageWidth - marginLeft - marginRight;

      // Encabezado en la primera página
      doc.setFontSize(26);
      let text = "Informe de Gastos";
      let textWidth = doc.getTextWidth(text);
      let x = (pageWidth - textWidth) / 2;
      doc.text(text, x, 20);

      doc.setFontSize(16);
      text = `Usuario: ${user.email}`;
      textWidth = doc.getTextWidth(text);
      x = (pageWidth - textWidth) / 2;
      doc.text(text, x, 40);

      text = `Realizado el día: ${new Date().toLocaleString()}`;
      textWidth = doc.getTextWidth(text);
      x = (pageWidth - textWidth) / 2;
      doc.text(text, x, 60);

      text = "-----------------------------";
      textWidth = doc.getTextWidth(text);
      x = (pageWidth - textWidth) / 2;
      doc.text(text, x, 80);

      text = `Registros de: ${mes}`;
      textWidth = doc.getTextWidth(text);
      x = (pageWidth - textWidth) / 2;
      doc.text(text, x, 100);

      text = "-----------------------------";
      textWidth = doc.getTextWidth(text);
      x = (pageWidth - textWidth) / 2;
      doc.text(text, x, 120);

      doc.addPage(); // Añadir nueva página para los registros

      let y = 20; // Ajustar la posición inicial de los registros
      let recordCount = 0;

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        recordCount++;

        if (recordCount > 3) {
          doc.addPage();
          y = 20; // Reiniciar la posición vertical para la nueva página
          recordCount = 1; // Reiniciar el contador de registros por página
        }

        // Añadir datos del gasto
        doc.setFontSize(16);
        doc.text(`Tipo de Gasto: ${data.tipoGasto}`, marginLeft, y);
        doc.text(`Número de Factura: ${data.numeroFactura}`, marginLeft, y + lineHeight);
        doc.text(`Monto: ₡${data.monto.toLocaleString("es-CR", { minimumFractionDigits: 2 })}`, marginLeft, y + 2 * lineHeight);
        doc.text(`Fecha de Creación: ${data.fechaCreacion.toDate().toLocaleString()}`, marginLeft, y + 3 * lineHeight);

        // Añadir imagen y ajustar la posición de la imagen y el texto
        if (data.foto) {
          const imageUrl = await obtenerImagenData(data.foto);
          if (imageUrl) {
            doc.addImage(imageUrl, "PNG", pageWidth - imageWidth - marginRight, y, imageWidth, imageHeight); // Ajustar posición y tamaño según sea necesario
            
            doc.link(pageWidth - imageWidth - marginRight, y, imageWidth, imageHeight, { url: data.foto });
          }
        } else {
          doc.text("Foto no disponible", pageWidth - imageWidth - marginRight, y + 4 * lineHeight);
        }

        y += recordHeight;

        // Añadir línea divisoria entre registros
        if (recordCount < 3) {
          doc.line(marginLeft, y - 5, pageWidth - marginRight, y - 5);
          y += 10;
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
