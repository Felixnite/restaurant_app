const btnGuardarCliente = document.querySelector('#guardar-cliente')

//Guardar la informacion del cliente

let cliente = {
    mesa:'',
    hora:'',
    pedido:[]
}

const categorias = {
    1: 'Pizzas',
    2: 'Postres',
    3: 'Jugos',
    4: 'Comida',
    5: 'Cafe'
}

btnGuardarCliente.addEventListener('click', guardarCliente)

function guardarCliente(){
    const mesa = document.querySelector('#mesa').value
    const hora = document.querySelector('#hora').value

    const camposVacios = [mesa,hora].some(i=>i=='')

    if(camposVacios){
        //Todos los campos estan vacios

        const existeAlerta = document.querySelector('.invalida')
        if(!existeAlerta){
            const alerta = document.createElement('div')
            alerta.textContent = "los campos son obligatorios"
            alerta.classList.add('.invalida')
            document.querySelector('.modal-body form').appendChild
            (alerta)

            setTimeout(()=>{
                alerta.remove()
            },3000)
        }
    }else{
        //Caso de que esten los cmapos llenos
        //console.log('Campos llenos')
        cliente = {...cliente,mesa,hora}
        //Ocultar la venta modal
        var modalFormulario = document.querySelector('#formulario')

        var modal = bootstrap.Modal.getInstance(modalFormulario)
        modal.hide()

        mostrarSecciones()
        obtenerMenu()
    }
}

function obtenerMenu(){
    const url = 'http://localhost:3000/menu'
    fetch(url)
    .then(respuesta => respuesta.json())
    .then(res => mostrarMenu(res))
    .catch(error => console.log(error))
}



function mostrarMenu(menu){
    // console.log('mostrar')
    // console.log(menu)

    const contenido = document.querySelector('#menu .contenido')

    menu.forEach(menu =>{
        const fila = document.createElement('div')
        fila.classList.add('row','border-top')

        const nombre = document.createElement('div')
        nombre.classList.add('col-md-3','py-3')
        nombre.textContent = menu.nombre

        const precio = document.createElement('div')
        precio.classList.add('col-md-3','py-3')
        precio.textContent = menu.precio

        const categoria = document.createElement('div')
        categoria.classList.add('col-md-3','py-3')
        categoria.textContent = categorias[menu.categoria]

        const inputCantidad = document.createElement('input')
        
        inputCantidad.type = 'number'
        inputCantidad.min = 0 
        inputCantidad.value = 0
        inputCantidad.id = `producto-${menu.id}`
        inputCantidad.onchange = function(){
            const cantidad = parseInt(inputCantidad.value)
            // console.log(cantidad) 

            agregarOrden({...menu, cantidad})
        }

        const agregar = document.createElement('div')
        agregar.classList.add('col-md-3')
        agregar.appendChild(inputCantidad)

        fila.appendChild(nombre)
        fila.appendChild(precio)
        fila.appendChild(categoria)
        fila.appendChild(agregar)

        contenido.appendChild(fila)

    })
}

function agregarOrden(producto) {
    let { pedido } = cliente;

    if (producto.cantidad > 0) {
        if (pedido.some(i => i.id === producto.id)) {
            // Actualizar cantidad del producto en el pedido
            const pedidoActualizado = pedido.map(item => {
                if (item.id === producto.id) {
                    item.cantidad = producto.cantidad;
                }
                return item;
            });
            cliente.pedido = pedidoActualizado;
        } else {
            // Agregar el producto al pedido si no está presente
            cliente.pedido = [...pedido, producto];
        }
    } else {
        // Si la cantidad es 0, eliminar del pedido
        cliente.pedido = pedido.filter(i => i.id !== producto.id);
    }

    limpiarHTML();

    if (cliente.pedido.length) {
        actualizarResumen()
    } else {
        mensajePedidoVacio();
    }
}

function mensajePedidoVacio(){
    const texto = document.createElement('p')
    texto.textContent = 'Agrega productos al pedido'
    texto.classList.add('text-center')
    contenido.appendChild(texto)
}


function limpiarHTML(){
    const contenido = document.querySelector('#resumen .contenido')
    while(contenido.firstChild){
        contenido.removeChild(contenido.firstChild)
    }
}

function eliminarProducto(id){
    const {pedido} = cliente
    cliente.pedido = pedido.filter(i=>i.id !== id)

    limpiarHTML()

    if(cliente.pedido.length){
        actualizarResumen()
    }else{
        mensajePedidoVacio()
    }

    //Actualizar la cantidad del producto eliminado a cero
    console.log(id)
    const productoEliminado = `#producto-${id}`
    const inputEliminado = document.querySelector(productoEliminado)
    inputEliminado.value = 0
}

function actualizarResumen(){
    const contenido = document.querySelector('#resumen .contenido')
    const resumen = document.createElement('div')
    resumen.classList.add('col-md-6','card', 'py-5', 'px-3', 'shadow')

    //Mostrar la mesa
    const mesa = document.createElement('p')
    mesa.textContent = 'Mesa: '
    mesa.classList.add('fw-bold')

    const mesaCliente = document.createElement('span')
    mesaCliente.textContent = cliente.mesa
    mesaCliente.classList.add('fw-normal')
    mesa.appendChild(mesaCliente)

    //Mostrar la hora

    const hora = document.createElement('span')
    hora.textContent = 'Mesa: '
    hora.classList.add('fw-bold')

    const horaCliente = document.createElement('span')
    horaCliente.textContent = cliente.hora
    horaCliente.classList.add('fw-normal')
    hora.appendChild(horaCliente)
    
    //Mostrar los items del menu consumidos
    const heading = document.createElement('h3')
    heading.textContent = 'Pedidos'
    heading.classList.add('my-4')

    const grupo = document.createElement('ul')
    grupo.classList.add('list-group')

    //Producto pedido
    const {pedido} = cliente
    pedido.forEach(item => {
        const {nombre,precio,cantidad,id} = item
        const lista = document.createElement('li')
        lista.classList.add('list-group-item')

        //Mostrar nombre
        const nombreP = document.createElement('h4')
        nombreP.classList.add('text-center','my-4')
        nombreP.textContent = nombre

        //Mostrar Cantidad
        const cantidadP = document.createElement('p')
        cantidadP.classList.add('fw-bold')
        cantidadP.textContent = 'Cantidad: '

        const cantidadValor = document.createElement('p')
        cantidadValor.classList.add('fw-normal')
        cantidadValor.textContent = cantidad

        const precioP = document.createElement('p')
        precioP.classList.add('fw-bold')
        precioP.textContent = 'Precio: '

        const precioValor = document.createElement('p')
        precioValor.classList.add('fw-normal')
        precioValor.textContent = `$${precio}`

        const subtotalP = document.createElement('p')
        subtotalP.classList.add('fw-bold')
        subtotalP.textContent = 'Subtotal: '

        subtotalValor = document.createElement('p')
        subtotalValor.classList.add('fw-normal')
        subtotalValor.textContent = calcularSubtotal(item)

        //Boton para eliminar pedido
        const btnEliminar = document.createElement('button')
        btnEliminar.classList.add('btn','btn-danger')
        btnEliminar.textContent = 'Eliminar pedido'

        //Agregar evento para eliminar el pedido
        btnEliminar.onclick = function(){
            eliminarProducto(id)
        }

        //Agregar los labels a los contenedores
        cantidadP.appendChild(cantidadValor)
        precioP.appendChild(precioValor)
        subtotalP.appendChild(subtotalValor)

        lista.appendChild(nombreP)
        lista.appendChild(cantidadP)
        lista.appendChild(precioP)
        lista.appendChild(subtotalP)
        lista.appendChild(btnEliminar)

        grupo.appendChild(lista)
    })

    resumen.appendChild(mesa)
    resumen.appendChild(hora)
    resumen.appendChild(heading)
    resumen.appendChild(grupo)
    //Agregamos el contenido
    contenido.appendChild(resumen)

    formularioPropinas()
}

function calcularSubtotal(item){
    const {cantidad,precio} = item
    return `$${cantidad*precio}`
}

function mostrarSecciones(){
    const secciones = document.querySelectorAll('.d-none')
    //console.log(secciones)
    secciones.forEach(i=>i.classList.remove('d-none'))
}

function formularioPropinas() {
    const contenido = document.querySelector('#resumen .contenido');
    const formulario = document.createElement('div');
    formulario.classList.add('col-md-6', 'formulario');

    const heading = document.createElement('h3');
    heading.classList.add('my-4');
    heading.textContent = 'Propina: ';

    // Crear radios para propinas
    const opciones = [
        { valor: 5, texto: '5%' },
        { valor: 10, texto: '10%' },
    ];

    opciones.forEach(opcion => {
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'propina';
        radio.value = opcion.valor;
        radio.classList.add('form-check-input');
        radio.onclick = calcularPropina;

        const label = document.createElement('label');
        label.textContent = opcion.texto;
        label.classList.add('form-check-label');

        const div = document.createElement('div');
        div.classList.add('form-check');
        div.appendChild(radio);
        div.appendChild(label);

        formulario.appendChild(div);
    });

    contenido.appendChild(formulario);
}


function calcularPropina(){
    console.log('entre')
    const radioSelect = parseInt(document.querySelector('[name="propina"]:checked').value)
    // console.log(radioSelect)

    const {pedido} = cliente
    console.log(pedido)

    let subtotal = 0
    pedido.forEach(item=>{
        subtotal += item.cantidad * item.precio
    })

    const divTotales = document.createElement('div')
    divTotales.classList.add('total-pagar')

    //Propina
    const propina = (subtotal * radioSelect)/ 100
    const total = propina + subtotal

    //subtotal
    const subtotalParrafo = document.createElement('p')
    subtotalParrafo.classList.add('fs-3','fw-bold','mt-5')
    subtotalParrafo.textContent = 'Subtotal consumo: '

    const subtotalP = document.createElement('p')
    subtotalP.classList.add('fs-normal')
    subtotalP.textContent = `$${subtotal}`
    subtotalParrafo.appendChild(subtotalP)

    const propinaParrafo = document.createElement('span')
    propinaParrafo.classList.add('fs-normal')
    propinaParrafo.textContent = 'Propina: '

    const propinaP = document.createElement('span')
    propinaP.classList.add('fw-normal')
    propinaP.textContent = `$${propina}`
    propinaParrafo.appendChild(propinaP)

    const totalParrafo = document.createElement('p')
    totalParrafo.classList.add('fs-normal')
    totalParrafo.textContent = 'Total a pagar: '

    const totalP = document.createElement('p')
    totalP.classList.add('fs-normal')
    totalP.textContent = `$${total}`

    totalParrafo.appendChild(totalP)

    const totalPagarDiv = document.querySelector('.total-pagar')

    if(totalPagarDiv){
        totalPagarDiv.remove()
    }

    divTotales.appendChild(subtotalParrafo)
    divTotales.appendChild(propinaParrafo)
    divTotales.appendChild(totalParrafo)

    const formulario = document.querySelector('.formulario')
    formulario.appendChild(divTotales)
}
