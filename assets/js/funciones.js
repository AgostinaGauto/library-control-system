function calcularPesoyHoras(){
    const altura= parseInt(document.getElementById('altura').value);
    const sexo= document.querySelector('input[name= "sexo"]:checked')?.value;
    const horasDiarias= parseInt(document.getElementById('horasDiarias').value);

    let peso= 0;
    let horasSemanales= 0;

    if(sexo== "Femenino"){
        peso= (altura - 100) * 0.85;
    }

    if(sexo== "Masculino"){
        peso= (altura - 100) * 0.9;
    }

    horasSemanales= horasDiarias * 7;
    document.getElementById('peso').value= peso.toFixed(1);
    document.getElementById('horasSemanales').value= horasSemanales;


}

window.onload= function(){
    const formContacto= document.getElementById('formContacto');
    formContacto.addEventListener("input", calcularPesoyHoras);
    formContacto.addEventListener("change", calcularPesoyHoras);

};