const btnGuardarCliente = document.querySelector('#guardar-cliente')

//Guardar la informacion del cliente
let ordenes = [];
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

function guardarCliente() {
    const mesa = document.querySelector('#mesa').value;
    const hora = document.querySelector('#hora').value;

    const camposVacios = [mesa, hora].some(i => i == '');

    if (camposVacios) {
        const existeAlerta = document.querySelector('.invalida');
        if (!existeAlerta) {
            const alerta = document.createElement('div');
            alerta.textContent = "Los campos son obligatorios";
            alerta.classList.add('invalida', 'alert', 'alert-danger');
            document.querySelector('.modal-body form').appendChild(alerta);

            setTimeout(() => {
                alerta.remove();
            }, 3000);
        }
    } else {
        clienteActual = { ...clienteActual, mesa, hora, pedido: [] };
        ordenes.push(clienteActual);

        var modalFormulario = document.querySelector('#formulario');
        var modal = bootstrap.Modal.getInstance(modalFormulario);
        modal.hide();

        mostrarSecciones();
        obtenerMenu();
        actualizarResumen();
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
    if (ordenes.length === 0) {
        alert("Please create a new order first.");
        return;
    }

    let currentOrder = ordenes[ordenes.length - 1];
    let { pedido } = currentOrder;

    if (producto.cantidad > 0) {
        const existingProductIndex = pedido.findIndex(item => item.id === producto.id);
        if (existingProductIndex !== -1) {
            pedido[existingProductIndex].cantidad = producto.cantidad;
        } else {
            pedido.push(producto);
        }
    } else {
        pedido = pedido.filter(i => i.id !== producto.id);
    }

    currentOrder.pedido = pedido;
    actualizarResumen();
}

    limpiarHTML();

    if (clienteActual.pedido.length) {
        actualizarResumen();
    } else {
        mensajePedidoVacio();
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

function actualizarResumen() {
    const contenido = document.querySelector('#resumen .contenido');
    limpiarHTML();

    ordenes.forEach((orden, index) => {
        const resumen = document.createElement('div');
        contenido.classList.add('order-grid');
        resumen.classList.add('card', 'py-5', 'px-3', 'shadow', 'mb-4', 'mx-6');

        const ordenHeading = document.createElement('h3');
        ordenHeading.textContent = `Orden ${index + 1}`;
        ordenHeading.classList.add('text-center', 'mb-4');
        resumen.appendChild(ordenHeading);

        const mesa = document.createElement('p');
        mesa.innerHTML = `<strong>Mesa:</strong> ${orden.mesa}`;
        resumen.appendChild(mesa);

        const hora = document.createElement('p');
        hora.innerHTML = `<strong>Hora:</strong> ${orden.hora}`;
        resumen.appendChild(hora);

        const pedidoHeading = document.createElement('h4');
        pedidoHeading.textContent = 'Pedidos';
        pedidoHeading.classList.add('my-4');
        resumen.appendChild(pedidoHeading);

        const grupo = document.createElement('ul');
        grupo.classList.add('list-group');

        orden.pedido.forEach(item => {
            const lista = document.createElement('li');
            lista.classList.add('list-group-item');

            lista.innerHTML = `
                <h5 class="text-center my-2">${item.nombre}</h5>
                <p><strong>Cantidad:</strong> ${item.cantidad}</p>
                <p><strong>Precio:</strong> $${item.precio}</p>
                <p><strong>Subtotal:</strong> $${item.cantidad * item.precio}</p>
            `;

            const btnEditar = document.createElement('button');
            btnEditar.classList.add('btn', 'btn-warning', 'me-2');
            btnEditar.textContent = 'Editar';
            btnEditar.onclick = () => editarProducto(index, item.id);

            const btnEliminar = document.createElement('button');
            btnEliminar.classList.add('btn', 'btn-danger');
            btnEliminar.textContent = 'Eliminar';
            btnEliminar.onclick = () => eliminarProducto(index, item.id);

            lista.appendChild(btnEditar);
            lista.appendChild(btnEliminar);
            grupo.appendChild(lista);
        });

        resumen.appendChild(grupo);

        const btnEliminarOrden = document.createElement('button');
        btnEliminarOrden.classList.add('btn', 'btn-danger', 'mt-4');
        btnEliminarOrden.textContent = 'Eliminar Orden';
        btnEliminarOrden.onclick = () => eliminarOrden(index);
        resumen.appendChild(btnEliminarOrden);

        contenido.appendChild(resumen);
    });

    formularioPropinas();
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
    ordenes.forEach((orden, index) => {
        const ordenResumen = document.querySelectorAll('#resumen .card')[index];
        const formulario = document.createElement('div');
        formulario.classList.add('formulario', 'mt-4');

        const heading = document.createElement('h4');
        heading.classList.add('mb-2');
        heading.textContent = 'Propina:';

        formulario.appendChild(heading);

        const opciones = [
            { valor: 0, texto: '0%' },
            { valor: 5, texto: '5%' },
            { valor: 10, texto: '10%' },
            { valor: 15, texto: '15%' },
        ];

        opciones.forEach(opcion => {
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = `propina-${index}`;
            radio.value = opcion.valor;
            radio.classList.add('form-check-input');
            radio.onclick = () => calcularPropina(index);

            const label = document.createElement('label');
            label.textContent = opcion.texto;
            label.classList.add('form-check-label', 'me-3');

            formulario.appendChild(radio);
            formulario.appendChild(label);
        });

        ordenResumen.appendChild(formulario);
    });
}



function calcularPropina(ordenIndex) {
    const orden = ordenes[ordenIndex];
    const radioSelect = parseInt(document.querySelector(`[name="propina-${ordenIndex}"]:checked`).value);
    
    let subtotal = 0;
    orden.pedido.forEach(item => {
        subtotal += item.cantidad * item.precio;
    });

    const propina = (subtotal * radioSelect) / 100;
    const total = propina + subtotal;

    const ordenResumen = document.querySelectorAll('#resumen .card')[ordenIndex];
    let divTotales = ordenResumen.querySelector('.total-pagar');
    
    if (!divTotales) {
        divTotales = document.createElement('div');
        divTotales.classList.add('total-pagar');
        ordenResumen.appendChild(divTotales);
    } else {
        divTotales.innerHTML = '';
    }

    divTotales.innerHTML = `
        <p class="fs-4 fw-bold mt-2">Subtotal consumo: <span class="fw-normal">$${subtotal.toFixed(2)}</span></p>
        <p class="fs-4 fw-bold">Propina: <span class="fw-normal">$${propina.toFixed(2)}</span></p>
        <p class="fs-4 fw-bold">Total a pagar: <span class="fw-normal">$${total.toFixed(2)}</span></p>
    `;
}



function prepararNuevaOrden() {
    clienteActual = { mesa: '', hora: '', pedido: [] };
    document.querySelector('#mesa').value = '';
    document.querySelector('#hora').value = '';
    const inputsCantidad = document.querySelectorAll('input[type="number"]');
    inputsCantidad.forEach(input => input.value = 0);
}


function editarProducto(ordenIndex, productoId) {
    const orden = ordenes[ordenIndex];
    const producto = orden.pedido.find(item => item.id === productoId);
    const nuevaCantidad = prompt(`Ingrese nueva cantidad para ${producto.nombre}:`, producto.cantidad);
    
    if (nuevaCantidad !== null) {
        producto.cantidad = parseInt(nuevaCantidad);
        actualizarResumen();
    }
}

function eliminarProducto(ordenIndex, productoId) {
    ordenes[ordenIndex].pedido = ordenes[ordenIndex].pedido.filter(item => item.id !== productoId);
    actualizarResumen();
}

function eliminarOrden(index) {
    if (confirm('¿Está seguro de que desea eliminar esta orden?')) {
        ordenes.splice(index, 1);
        actualizarResumen();
    }
}

function cambiarOrdenActual() {
    const selectOrden = document.getElementById('selectOrden');
    const selectedIndex = selectOrden.selectedIndex - 1; // -1 because of the default option
    if (selectedIndex >= 0) {
        clienteActual = ordenes[selectedIndex];
        actualizarResumen();
    }
}
