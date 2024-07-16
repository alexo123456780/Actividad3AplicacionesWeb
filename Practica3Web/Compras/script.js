document.addEventListener('DOMContentLoaded', () => {
    const entradaBusqueda = document.getElementById('entradaBusqueda');
    const botonBuscar = document.getElementById('botonBuscar');
    const listaResultados = document.getElementById('listaResultados');

    botonBuscar.addEventListener('click', realizarBusqueda);
    entradaBusqueda.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            realizarBusqueda();
        }
    });

    function realizarBusqueda() {
        const terminoBusqueda = entradaBusqueda.value.trim();
        if (terminoBusqueda) {
            buscarProductos(terminoBusqueda);
        }
    }

    function buscarProductos(consulta) {
        listaResultados.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></div>';
        fetch(`https://api.mercadolibre.com/sites/MLA/search?q=${encodeURIComponent(consulta)}`)
            .then(respuesta => respuesta.json())
            .then(datos => {
                mostrarResultados(datos.results);
            })
            .catch(error => {
                console.error('Error:', error);
                listaResultados.innerHTML = '<div class="col-12 text-center text-danger">Ocurrió un error al buscar los productos. Por favor, intenta de nuevo.</div>';
            });
    }

    function mostrarResultados(resultados) {
        if (resultados.length === 0) {
            listaResultados.innerHTML = '<div class="col-12 text-center">No se encontraron productos. Por favor, intenta con otra búsqueda.</div>';
            return;
        }

        listaResultados.innerHTML = resultados.map(producto => `
            <div class="col">
                <div class="card h-100">
                    <img src="${producto.thumbnail}" class="card-img-top" alt="${producto.title}">
                    <div class="card-body">
                        <h5 class="card-title">${producto.title}</h5>
                        <p class="card-text">${producto.condition === 'new' ? 'Nuevo' : 'Usado'}</p>
                        <p class="precio">$${producto.price.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div class="card-footer">
                        <a href="${producto.permalink}" class="btn btn-primary btn-sm" target="_blank">Ver Detalles</a>
                    </div>
                </div>
            </div>
        `).join('');
    }
});