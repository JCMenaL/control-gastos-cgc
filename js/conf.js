// Importar las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  addDoc,
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
  
    // Carga datos en el  Presupuestos
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log("Usuario autenticado:", user);
        await cargarDatosmenuPresupuesto();
      } else {
        console.log("No hay usuario autenticado");
      }
    });
  });
  
  async function cargarDatosmenuPresupuesto() {
    const user = auth.currentUser;
    if (!user) {
      console.log("No hay usuario autenticado");
      return;
    }
  
    const months = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto",
      "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
  
    try {
      const userRef = doc(db, "usuarios", user.uid);
  
       // Limpia el contenido del menú
    const menu = document.getElementById("menuPresupuesto");
    menu.innerHTML = "";

  


    for (const month of months) {
      const monthRef = doc(userRef, "meses", month);
      const docSnap = await getDoc(monthRef);

      console.log(`Datos para el mes ${month}:`, docSnap.data());

      if (docSnap.exists()) {
        const data = docSnap.data();
        const presupuesto = data.presupuesto || 0;

        const menuItem = document.createElement("li");
        menuItem.classList.add("sidenav-item");

        const label = document.createElement("div");
        label.textContent = month;
        label.setAttribute("for", `input${month}`);

        const flexDiv = document.createElement("div");
        flexDiv.classList.add("flex-container");

        const input = document.createElement("input");
        input.type = "number";
        input.value = presupuesto;
        input.id = `input ${month}`;
        input.classList.add("validate", "input-field");

        const saveButton = document.createElement("button");
        saveButton.textContent = "Guardar";
        saveButton.classList.add("btn", "waves-effect", "waves-light", "btn-right");
        saveButton.onclick = () => guardarPresupuesto(month, input.value);

        flexDiv.appendChild(input);
        flexDiv.appendChild(saveButton);

        const div = document.createElement("div");
        div.classList.add("input-field", "col", "s12");

        div.appendChild(label);
        div.appendChild(flexDiv);

        menuItem.appendChild(div);
        menu.appendChild(menuItem);
      } else {
        console.error(`No se encontró el documento para el mes ${month}`);
      }
    }
  } catch (error) {
    console.error("Error al obtener datos del mes:", error);
  }
}
  
  async function guardarPresupuesto(month, newPresupuesto) {
    const user = auth.currentUser;
    if (!user) {
      console.log("No hay usuario autenticado");
      return;
    }
  
    try {
      const userRef = doc(db, "usuarios", user.uid);
      const monthRef = doc(userRef, "meses", month);
  
      await setDoc(
        monthRef,
        { presupuesto: parseFloat(newPresupuesto) },
        { merge: true }
      );
      M.toast({
        html: `Presupuesto para ${month} actualizado a ₡${parseFloat(newPresupuesto).toLocaleString("es-CR", { minimumFractionDigits: 0 })}`,
      });
    } catch (error) {
      console.error("Error al guardar el presupuesto:", error);
      M.toast({ html: `Error: ${error.message}` });
    }
  }
  

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

    // Mostrar el total de gastos y el presupuesto
    totalMontoContenedor.innerHTML = `<p>Total: ₡${totalMonto.toLocaleString(
      "es-CR",
      { minimumFractionDigits: 0 }
    )}</p>`;
    const diferencia = presupuesto - totalMonto;
    presupuestoContenedor.innerHTML = `<p>Presupuesto: ₡${presupuesto.toLocaleString(
      "es-CR",
      { minimumFractionDigits: 0 }
    )}</p>
                                        <p>Diferencia: ₡${diferencia.toLocaleString(
                                          "es-CR",
                                          { minimumFractionDigits: 0 }
                                        )}</p>`;

    // Añadir eventos para los botones de eliminar
    document.querySelectorAll(".eliminar-btn").forEach((button) => {
      button.addEventListener("click", async () => {
        const docId = button.getAttribute("data-id");
        const fotoURL = button.getAttribute("data-foto");
        if (
          fotoURL &&
          confirm("¿Estás seguro de que deseas eliminar este gasto?")
        ) {
          try {
            // Eliminar el documento de Firestore
            await deleteDoc(
              doc(db, `usuarios/${user.uid}/meses/${mes}/gastos`, docId)
            );

            // Eliminar el archivo de Storage
            const fotoNombre = decodeURIComponent(
              fotoURL.split("/").pop().split("?")[0]
            ); // Decodificar y obtener el nombre del archivo
            const storageRef = ref(storage, `fotos/${fotoNombre}`);
            await deleteObject(storageRef);

            M.toast({ html: "Gasto y foto eliminados correctamente" });
            mostrarRegistros(mes); // Volver a cargar los registros
          } catch (error) {
            console.error("Error al eliminar el gasto:", error);
            M.toast({ html: `Error: ${error.message}` });
          }
        }
      });
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
  const fotoURLElement = document.getElementById("fotoURL");

  console.log("year:", yearElement ? yearElement.value : "null");
  console.log("mes:", mesElement ? mesElement.value : "null");
  console.log("tipoGasto:", tipoGastoElement ? tipoGastoElement.value : "null");
  console.log("numeroFactura:", numeroFacturaElement ? numeroFacturaElement.value : "null");
  console.log("monto:", montoElement ? montoElement.value : "null");
  console.log("fotoURL:", fotoURLElement ? fotoURLElement.value : "null");

  if (!yearElement || !mesElement || !tipoGastoElement || !numeroFacturaElement || !montoElement || !fotoURLElement) {
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
  const fotoURL = fotoURLElement.value;

  try {
    const user = auth.currentUser;
    if (user) {
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

document.head.appendChild(style);

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
      const lineHeight = 10;
      const imageWidth = 50;
      const imageHeight = 50;
      const maxY = 250; // Ajusta el límite de la página según sea necesario

      // Encabezado centrado
      doc.setFontSize(26);
      let text = "Informe de Gastos";
      let textWidth = doc.getTextWidth(text);
      let x = (pageWidth - textWidth) / 2;
      doc.text(text, x, 10);

      doc.setFontSize(16);
      text = `Usuario: ${user.email}`;
      textWidth = doc.getTextWidth(text);
      x = (pageWidth - textWidth) / 2;
      doc.text(text, x, 20);

      text = `Realizado el día: ${new Date().toLocaleString()}`;
      textWidth = doc.getTextWidth(text);
      x = (pageWidth - textWidth) / 2;
      doc.text(text, x, 30);

      text = "-----------------------------";
      textWidth = doc.getTextWidth(text);
      x = (pageWidth - textWidth) / 2;
      doc.text(text, x, 40);

      text = `Registros de: ${mes}`;
      textWidth = doc.getTextWidth(text);
      x = (pageWidth - textWidth) / 2;
      doc.text(text, x, 50);

      text = "-----------------------------";
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
        doc.setFontSize(16);
        doc.text(`Tipo de Gasto: ${data.tipoGasto}`, 10, y);
        doc.text(
          `Número de Factura: ${data.numeroFactura}`,
          10,
          y + lineHeight
        );
        doc.text(
          `Monto: ₡${data.monto.toLocaleString("es-CR", {
            minimumFractionDigits: 2,
          })}`,
          10,
          y + 2 * lineHeight
        );
        doc.text(
          `Fecha de Creación: 
${data.fechaCreacion.toDate().toLocaleString()}`,
          10,
          y + 3 * lineHeight
        );

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
            doc.addImage(
              imageUrl,
              "PNG",
              imageX,
              imageY,
              imageWidth,
              imageHeight
            ); // Ajustar posición y tamaño según sea necesario

            // Añadir enlace a la imagen
            doc.link(imageX, imageY, imageWidth, imageHeight, {
              url: data.foto,
            });
            y += imageHeight + 10; // Espacio adicional después de la imagen
          }
        } else {
          doc.text("Foto no disponible", 10, y + 4 * lineHeight);
          y += lineHeight + 10; // Espacio adicional si no hay foto
        }

        // Añadir línea divisoria entre registros
        if (y + lineHeight < maxY) {
          // Verificar si hay espacio suficiente para la línea
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
