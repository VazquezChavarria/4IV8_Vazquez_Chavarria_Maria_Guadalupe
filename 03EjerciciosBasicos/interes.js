function validarn(e) {
    var teclado = (document.all) ? e.keyCode : e.which;
    if (teclado == 8) return true;
    // Expresión regular para permitir solo números y punto decimal
    var patron = /[0-9.]/;
    var codigo = String.fromCharCode(teclado);
    return patron.test(codigo);
}
 
function interes() {
    var valor = document.getElementById('cantidadi').value;
    var interes = parseFloat(valor);
    // 10% anual
    var subtotal = interes * 0.10;
    var total = subtotal + interes;
    document.getElementById('sueldoi').value = "$" + total.toFixed(2);
}
 
function borrar() {
    document.getElementById('cantidadi').value = '';
    document.getElementById('sueldoi').value = '';
}
 