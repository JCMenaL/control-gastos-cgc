

document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('select');
    var instances = M.FormSelect.init(elems);

      // Inicializar el menú lateral
   var sidenavElems = document.querySelectorAll('.sidenav');
   var sidenavInstances = M.Sidenav.init(sidenavElems);

   var elems = document.querySelectorAll('.modal');
   var instances = M.Modal.init(elems);
   
  });

 
