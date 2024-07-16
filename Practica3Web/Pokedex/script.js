let idPokemonActual = 1;

document.addEventListener('DOMContentLoaded', () => {
    const botonAnterior = document.getElementById('botonAnterior');
    const botonSiguiente = document.getElementById('botonSiguiente');
    const botonBuscar = document.getElementById('botonBuscar');
    const botonAleatorio = document.getElementById('botonAleatorio');
    const busquedaPokemon = document.getElementById('busquedaPokemon');

    botonAnterior.addEventListener('click', () => navegarPokemon(idPokemonActual - 1));
    botonSiguiente.addEventListener('click', () => navegarPokemon(idPokemonActual + 1));
    botonBuscar.addEventListener('click', () => buscarPokemon());
    botonAleatorio.addEventListener('click', () => cargarPokemonAleatorio());
    busquedaPokemon.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            buscarPokemon();
        }
    });

    cargarPokemon(idPokemonActual);
});

function navegarPokemon(id) {
    if (id < 1) id = 1;
    cargarPokemon(id);
}

function buscarPokemon() {
    const terminoBusqueda = document.getElementById('busquedaPokemon').value.toLowerCase();
    cargarPokemon(terminoBusqueda);
}

function cargarPokemonAleatorio() {
    const idAleatorio = Math.floor(Math.random() * 898) + 1; 
    cargarPokemon(idAleatorio);
}

async function cargarPokemon(identificador) {
    try {
        const datosPokemon = await obtenerDatosPokemon(identificador);
        mostrarInfoPokemon(datosPokemon);
        idPokemonActual = datosPokemon.id;
    } catch (error) {
        console.error('Error al cargar el Pokémon:', error);
        alert('Pokémon no encontrado. Por favor, intenta con otro nombre o ID.');
    }
}

async function obtenerDatosPokemon(identificador) {
    const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${identificador}`);
    const datos = await respuesta.json();
    const respuestaEspecie = await fetch(datos.species.url);
    const datosEspecie = await respuestaEspecie.json();
    return { ...datos, species: datosEspecie };
}

function mostrarInfoPokemon(pokemon) {
    document.getElementById('nombrePokemon').textContent = capitalizarPrimeraLetra(pokemon.name);
    document.getElementById('numeroPokemon').textContent = `N.º ${pokemon.id}`;
    document.getElementById('imagenPokemon').src = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;

    mostrarEstadisticasPokemon(pokemon.stats);
    mostrarTiposPokemon(pokemon.types);
    mostrarDescripcionPokemon(pokemon.species);
    mostrarCaracteristicasPokemon(pokemon);
    mostrarDebilidadesPokemon(pokemon.types);
    mostrarCadenaEvolucion(pokemon.species);
}

function mostrarEstadisticasPokemon(estadisticas) {
    const contenedorEstadisticas = document.getElementById('estadisticasPokemon');
    contenedorEstadisticas.innerHTML = '';
    const nombresEstadisticas = {
        hp: 'PS',
        attack: 'Ataque',
        defense: 'Defensa',
        'special-attack': 'Ataque Especial',
        'special-defense': 'Defensa Especial',
        speed: 'Velocidad'
    };
    estadisticas.forEach(estadistica => {
        const nombreEstadistica = nombresEstadisticas[estadistica.stat.name] || estadistica.stat.name;
        const porcentaje = (estadistica.base_stat / 255) * 100; 
        contenedorEstadisticas.innerHTML += `
            <div class="mb-1">${nombreEstadistica}: ${estadistica.base_stat}</div>
            <div class="progress">
                <div class="progress-bar bg-success" role="progressbar" style="width: ${porcentaje}%" aria-valuenow="${estadistica.base_stat}" aria-valuemin="0" aria-valuemax="255"></div>
            </div>
        `;
    });
}

function mostrarTiposPokemon(tipos) {
    const contenedorTipos = document.getElementById('tiposPokemon');
    contenedorTipos.innerHTML = '';
    tipos.forEach(tipo => {
        const tipoEspanol = traducirTipo(tipo.type.name);
        const insignia = document.createElement('span');
        insignia.textContent = tipoEspanol;
        insignia.classList.add('type-badge');
        insignia.style.backgroundColor = obtenerColorTipo(tipoEspanol);
        contenedorTipos.appendChild(insignia);
    });
}

function mostrarDescripcionPokemon(especie) {
    const elementoDescripcion = document.getElementById('descripcionPokemon');
    const entradaEspanol = especie.flavor_text_entries.find(entrada => entrada.language.name === 'es');
    elementoDescripcion.textContent = entradaEspanol ? entradaEspanol.flavor_text.replace(/\f/g, ' ') : 'No hay descripción disponible en español.';
}

function mostrarCaracteristicasPokemon(pokemon) {
    const contenedorCaracteristicas = document.getElementById('caracteristicasPokemon');
    contenedorCaracteristicas.innerHTML = `
        <p>Altura: ${pokemon.height / 10} m</p>
        <p>Peso: ${pokemon.weight / 10} kg</p>
        <p>Categoría: ${obtenerCategoria(pokemon.species)}</p>
        <p>Habilidad: ${obtenerHabilidad(pokemon.abilities)}</p>
    `;
}

function obtenerCategoria(especie) {
    const genusEntries = especie.genera;
    const spanishGenus = genusEntries.find(entry => entry.language.name === 'es');
    return spanishGenus ? spanishGenus.genus : 'Desconocida';
}

function obtenerHabilidad(habilidades) {
    return habilidades.length > 0 ? capitalizarPrimeraLetra(habilidades[0].ability.name) : 'Desconocida';
}

function mostrarDebilidadesPokemon(tipos) {
    const contenedorDebilidades = document.getElementById('debilidadesPokemon');
    contenedorDebilidades.innerHTML = '<h3>Debilidades</h3>';
    const debilidades = calcularDebilidades(tipos);
    debilidades.forEach(debilidad => {
        const insignia = document.createElement('span');
        insignia.textContent = debilidad;
        insignia.classList.add('type-badge');
        insignia.style.backgroundColor = obtenerColorTipo(debilidad);
        contenedorDebilidades.appendChild(insignia);
    });
}

function calcularDebilidades(tipos) {
    const todasLasDebilidades = new Set();
    tipos.forEach(tipo => {
        const debilidadesTipo = obtenerDebilidadesPorTipo(tipo.type.name);
        debilidadesTipo.forEach(debilidad => todasLasDebilidades.add(debilidad));
    });
    return Array.from(todasLasDebilidades);
}

function obtenerDebilidadesPorTipo(tipo) {
    const tablaDebilidades = {
        normal: ['lucha'],
        fuego: ['agua', 'tierra', 'roca'],
        agua: ['eléctrico', 'planta'],
        eléctrico: ['tierra'],
        planta: ['fuego', 'hielo', 'veneno', 'volador', 'bicho'],
        hielo: ['fuego', 'lucha', 'roca', 'acero'],
        lucha: ['volador', 'psíquico', 'hada'],
        veneno: ['tierra', 'psíquico'],
        tierra: ['agua', 'planta', 'hielo'],
        volador: ['eléctrico', 'hielo', 'roca'],
        psíquico: ['bicho', 'fantasma', 'siniestro'],
        bicho: ['volador', 'roca', 'fuego'],
        roca: ['agua', 'planta', 'lucha', 'tierra', 'acero'],
        fantasma: ['fantasma', 'siniestro'],
        dragón: ['hielo', 'dragón', 'hada'],
        siniestro: ['lucha', 'bicho', 'hada'],
        acero: ['fuego', 'lucha', 'tierra'],
        hada: ['veneno', 'acero']
    };
    return tablaDebilidades[traducirTipo(tipo)] || [];
}

async function mostrarCadenaEvolucion(especie) {
    const respuestaCadenaEvolucion = await fetch(especie.evolution_chain.url);
    const datosCadenaEvolucion = await respuestaCadenaEvolucion.json();
    
    const cadenaEvolucion = [];
    let datosEvo = datosCadenaEvolucion.chain;

    do {
        const nombreEspecie = datosEvo.species.name;
        const datosPokemon = await obtenerDatosPokemon(nombreEspecie);
        cadenaEvolucion.push({
            nombre: nombreEspecie,
            imagen: datosPokemon.sprites.front_default
        });
        datosEvo = datosEvo.evolves_to[0];
    } while (datosEvo && datosEvo.evolves_to);

    const contenedorEvolucion = document.getElementById('cadenaEvolucion');
    contenedorEvolucion.innerHTML = '';
    cadenaEvolucion.forEach(pokemon => {
        const img = document.createElement('img');
        img.src = pokemon.imagen;
        img.alt = pokemon.nombre;
        img.classList.add('evolution-image');
        img.addEventListener('click', () => cargarPokemon(pokemon.nombre));
        contenedorEvolucion.appendChild(img);
    });
}

function capitalizarPrimeraLetra(cadena) {
    return cadena.charAt(0).toUpperCase() + cadena.slice(1);
}

function traducirTipo(tipo) {
    const traduccionesTipos = {
        normal: 'normal', fire: 'fuego', water: 'agua', electric: 'eléctrico', grass: 'planta',
        ice: 'hielo', fighting: 'lucha', poison: 'veneno', ground: 'tierra', flying: 'volador',
        psychic: 'psíquico', bug: 'bicho', rock: 'roca', ghost: 'fantasma', dragon: 'dragón',
        dark: 'siniestro', steel: 'acero', fairy: 'hada'
    };
    return traduccionesTipos[tipo] || tipo;
}

function obtenerColorTipo(tipo) {
    const coloresTipos = {
        normal: '#A8A878', fuego: '#F08030', agua: '#6890F0', eléctrico: '#F8D030', planta: '#78C850',
        hielo: '#98D8D8', lucha: '#C03028', veneno: '#A040A0', tierra: '#E0C068', volador: '#A890F0',
        psíquico: '#F85888', bicho: '#A8B820', roca: '#B8A038', fantasma: '#705898', dragón: '#7038F8',
        siniestro: '#705848', acero: '#B8B8D0', hada: '#EE99AC'
    };
    return coloresTipos[tipo] || '#68A090'; 
}