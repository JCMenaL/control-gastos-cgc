

document.addEventListener('DOMContentLoaded', function() {
      // Inicializar el menú lateral
   var sidenavElems = document.querySelectorAll('.sidenav');
   var sidenavInstances = M.Sidenav.init(sidenavElems);
   
  });

  document.addEventListener('DOMContentLoaded', () => {
    M.AutoInit(); // Inicializa todos los componentes de Materialize
    // Inicializa el elemento select
    const elems = document.querySelectorAll('select');
    M.FormSelect.init(elems, {});
  });

  document.addEventListener('DOMContentLoaded', () => {
    // Inicializa los modales
    var elems = document.querySelectorAll('.modal');
    var instances = M.Modal.init(elems, {});
  });

  document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('foto');
    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      // Tu lógica de subida de archivos aquí
    });
  });