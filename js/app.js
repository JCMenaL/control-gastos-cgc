



  document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('foto');
    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      // Tu lógica de subida de archivos aquí
    });
  });
  


  document.addEventListener('DOMContentLoaded', () => {
    // Inicializa los modales
    var elems = document.querySelectorAll('.modal');
    var instances = M.Modal.init(elems, {});
  });

