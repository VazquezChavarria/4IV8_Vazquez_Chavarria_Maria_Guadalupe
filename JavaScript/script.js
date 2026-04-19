// =============================================
// JS MUY BÁSICO para principiantes
// Todo explicado con comentarios en español
// =============================================

// Función sencilla para mostrar el resultado en la pantalla
function mostrarResultado(id, texto) {
    let cuadro = document.getElementById(id);
    cuadro.style.display = "block";     // hace visible el cuadro
    cuadro.innerHTML = texto;           // pone el texto dentro
}

// Función sencilla para mostrar error
function mostrarError(id, mensaje) {
    let cuadro = document.getElementById(id);
    cuadro.style.display = "block";
    cuadro.style.background = "#ffe6e6";
    cuadro.style.borderColor = "red";
    cuadro.innerHTML = "❌ " + mensaje;
}

// ======================
// PROBLEMA 1
// ======================
function calcularProblema1() {
    let capital = document.getElementById("capital1").value;   // lee lo que escribió el usuario
    
    // Validación MUY básica (sin regex complicada)
    if (capital === "" || isNaN(capital) || Number(capital) <= 0) {
        mostrarError("resultado1", "Escribe un número positivo");
        return;
    }
    
    let dinero = Number(capital);               // convierte a número
    let ganancia = dinero * 0.02;               // calcula 2%
    let total = dinero + ganancia;
    
    let texto = "Capital: $" + dinero + "<br>" +
                "Ganancia: $" + ganancia.toFixed(2) + "<br>" +
                "<b>Total después de 1 mes: $" + total.toFixed(2) + "</b>";
    
    mostrarResultado("resultado1", texto);
}

// ======================
// PROBLEMA 2
// ======================
function calcularProblema2() {
    let sueldo = document.getElementById("sueldoBase").value;
    let v1 = document.getElementById("venta1").value;
    let v2 = document.getElementById("venta2").value;
    let v3 = document.getElementById("venta3").value;
    
    if (sueldo === "" || v1 === "" || v2 === "" || v3 === "" ||
        isNaN(sueldo) || isNaN(v1) || isNaN(v2) || isNaN(v3) ||
        Number(sueldo) < 0 || Number(v1) < 0 || Number(v2) < 0 || Number(v3) < 0) {
        mostrarError("resultado2", "Todos los campos deben ser números positivos");
        return;
    }
    
    let sueldoNum = Number(sueldo);
    let ventas = Number(v1) + Number(v2) + Number(v3);
    let comision = ventas * 0.10;
    let total = sueldoNum + comision;
    
    let texto = "Sueldo base: $" + sueldoNum + "<br>" +
                "Total ventas: $" + ventas + "<br>" +
                "Comisión 10%: $" + comision.toFixed(2) + "<br>" +
                "<b>Total a recibir: $" + total.toFixed(2) + "</b>";
    
    mostrarResultado("resultado2", texto);
}

// ======================
// PROBLEMA 3
// ======================
function calcularProblema3() {
    let compra = document.getElementById("compra").value;
    
    if (compra === "" || isNaN(compra) || Number(compra) <= 0) {
        mostrarError("resultado3", "Escribe un número positivo");
        return;
    }
    
    let totalCompra = Number(compra);
    let descuento = totalCompra * 0.15;
    let pagar = totalCompra - descuento;
    
    let texto = "Compra: $" + totalCompra + "<br>" +
                "Descuento 15%: $" + descuento.toFixed(2) + "<br>" +
                "<b>Deberás pagar: $" + pagar.toFixed(2) + "</b>";
    
    mostrarResultado("resultado3", texto);
}

// ======================
// PROBLEMA 4
// ======================
function calcularProblema4() {
    let p1 = document.getElementById("parcial1").value;
    let p2 = document.getElementById("parcial2").value;
    let p3 = document.getElementById("parcial3").value;
    let examen = document.getElementById("examen").value;
    let trabajo = document.getElementById("trabajo").value;
    
    if (p1 === "" || p2 === "" || p3 === "" || examen === "" || trabajo === "" ||
        isNaN(p1) || isNaN(p2) || isNaN(p3) || isNaN(examen) || isNaN(trabajo)) {
        mostrarError("resultado4", "Todas las calificaciones deben ser números");
        return;
    }
    
    let promedioParciales = (Number(p1) + Number(p2) + Number(p3)) / 3;
    let calFinal = (promedioParciales * 0.55) + (Number(examen) * 0.30) + (Number(trabajo) * 0.15);
    
    let texto = "Promedio parciales: " + promedioParciales.toFixed(2) + "<br>" +
                "<b>Calificación final: " + calFinal.toFixed(2) + "</b>";
    
    mostrarResultado("resultado4", texto);
}

// ======================
// PROBLEMA 5
// ======================
function calcularProblema5() {
    let hombres = document.getElementById("hombres").value;
    let mujeres = document.getElementById("mujeres").value;
    
    if (hombres === "" || mujeres === "" || isNaN(hombres) || isNaN(mujeres) ||
        Number(hombres) < 0 || Number(mujeres) < 0) {
        mostrarError("resultado5", "Escribe números positivos");
        return;
    }
    
    let h = Number(hombres);
    let m = Number(mujeres);
    let total = h + m;
    
    if (total === 0) {
        mostrarError("resultado5", "No puede haber 0 estudiantes");
        return;
    }
    
    let porHombres = (h / total * 100).toFixed(1);
    let porMujeres = (m / total * 100).toFixed(1);
    
    let texto = "Total estudiantes: " + total + "<br>" +
                "Hombres: " + porHombres + "%<br>" +
                "Mujeres: " + porMujeres + "%";
    
    mostrarResultado("resultado5", texto);
}

// ======================
// PROBLEMA 6  (aquí sí usamos una expresión regular muy simple)
// ======================
function calcularProblema6() {
    let anio = document.getElementById("anioNacimiento").value;
    
    // Expresión regular MUY sencilla: solo 4 números
    let regex = /^\d{4}$/;                     // esto significa "exactamente 4 dígitos"
    
    if (!regex.test(anio)) {
        mostrarError("resultado6", "Escribe exactamente 4 números (ej: 2005)");
        return;
    }
    
    let anioNacimiento = Number(anio);
    let anioActual = new Date().getFullYear();   // año actual automático
    let edad = anioActual - anioNacimiento;
    
    if (edad < 0 || edad > 120) {
        mostrarError("resultado6", "Año no válido");
        return;
    }
    
    let texto = "Año de nacimiento: " + anioNacimiento + "<br>" +
                "<b>Tu edad es: " + edad + " años</b>";
    
    mostrarResultado("resultado6", texto);
}