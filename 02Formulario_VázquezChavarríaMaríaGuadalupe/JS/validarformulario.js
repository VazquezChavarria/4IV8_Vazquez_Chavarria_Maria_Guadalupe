function validar(formulario){
    //vamos a crear una funcion para validar un numero minimo de caracteres en el nombre
    if(formulario.nombre.value.length < 3){
        alert("Por favor ingrese un nombre mayor de 3 caracteres");
        formulario.nombre.focus();
        return false;
    }

    var abc0k = "QWERTYUIOPASDFGHJKLÑZXCVBNM" + "qwertyuiopasdfghjklñzxcvbnm" + " ";
    var checkString = formulario.nombre.value;
    var allValid = true;

    //tenemos que ir comparando y recorriendo la cadena caracter por caracter
    for(var i = 0; i < checkString.length; i++){
        //necesito la cadena pasarla a caracter
        var caracters = checkString.charAt(i);
        for(var j = 0; j < abc0k.length; j++){
            if(caracters == abc0k.charAt(j)){
                break;
            }
        }
        if(j == abc0k.length){
            allValid = false;
            break;
        }
    }
    if(!allValid){
        alert("Por favor, escriba unicamente letras en el campo nombre");
        formulario.nombre.focus();
        return false;
    }
        return true;
}