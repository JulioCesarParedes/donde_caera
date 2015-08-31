nivel = {
	facil:{
		columnas:3,
		filas:6,
		bloques_activos:{
			min:1,
			max:3,
		},
		tiempo_para_elegir:3000,
	},
	medio:{
		columnas:3,
		filas:8,
		bloques_activos:{
			min:2,
			max:4,
		},
		tiempo_para_elegir:4000,
	},
	dificil:{
		columnas:4,
		filas:10,
		bloques_activos:{
			min:3,
			max:5,
		},
		tiempo_para_elegir:5000,
	},
};

function Juego(){
	var nodo = {
		num_niveles: document.getElementsByName("elegir_dificultad"),
		area_juego: document.querySelector('#area_juego'),
		temporizador: document.querySelector('#temporizador'),
		overlay_juego: document.querySelector('#overlay_juego'),
		correcto_incorrecto: document.querySelector('#correcto_incorrecto'),
		tiempo_para_elegir: document.querySelector('#tiempo_para_elegir'),
		puntos: document.querySelector('#puntaje_parcial'),
		pregunta: document.querySelector('#pregunta'),
	};
	var conf = {
		dificultad:'medio',
		duracion:90000,
	};
	var objetos = new Controlador_objetos(nivel['dificil'].bloques_activos.max);
	var puntaje = new PuntajeParcial();
	var puntajes = (window.localStorage) ? new Puntajes() : null;
	var opciones = new Opciones();
	var bloque;
	var retardo_nuevo_tablero;
	var Correcto = function(){
		nodo.correcto_incorrecto.setAttribute("name","Correcto");
	};
	var Incorrecto = function(){
		nodo.correcto_incorrecto.setAttribute("name","Incorrecto");
	};
	var ocultar_correcto_incorrecto = function(){
		nodo.correcto_incorrecto.style.display = 'none';
	};
	var mostrar_correcto_incorrecto = function(lugar_donde_ha_caido){
		nodo.correcto_incorrecto.style.top = (nodo.area_juego.offsetTop + nodo.area_juego.clientHeight - 70) + 'px';
		nodo.correcto_incorrecto.style.left = ((nodo.area_juego.clientWidth/nivel[conf.dificultad].columnas) * lugar_donde_ha_caido) + 'px';
		nodo.correcto_incorrecto.style.display = 'block';
	};
	var continuar_juego = function(lugar_donde_ha_caido){
		objetos.cancelar_caida(conf.dificultad);
		nodo.puntos.firstChild.nodeValue = puntaje.calcular(opciones.get_opcion_elegida() == lugar_donde_ha_caido);
		(opciones.get_opcion_elegida() == lugar_donde_ha_caido) ? Correcto() : Incorrecto();
		mostrar_correcto_incorrecto(lugar_donde_ha_caido);
		retardo_nuevo_tablero = window.setTimeout(function(){
			ocultar_correcto_incorrecto();
			ejecutar_juego();
		}, 1000);
	};
	this.mostrarPuntajes = function(){
		if(window.localStorage){
			puntajes.mostrarPuntajes(conf.dificultad);
		}
	};
	var ejecutar_caida = function(){
		opciones.deshabilitar_elegir_opcion();
		objetos.dejar_caer(conf.dificultad,bloque,continuar_juego);
	};
	var respuesta_a_tiempo = function(){
		temporizador_para_responder.detener();
		objetos.dejar_caer(conf.dificultad,bloque,continuar_juego);
	};
	var juego_finalizado = function(){
		opciones.deshabilitar_elegir_opcion();
		temporizador_para_responder.detener();
		objetos.cancelar_caida(conf.dificultad);
		nodo.temporizador.firstChild.nodeValue = '--:--';
		nodo.tiempo_para_elegir.firstChild.nodeValue = "--";
	};
	this.reconf = function(){
		temporizador_del_juego.detener();
		juego_finalizado();
		objetos.ocultar();
		clearTimeout(retardo_nuevo_tablero);
		ocultar_correcto_incorrecto();
		for(var i=0; i<nodo.num_niveles.length; i++){
			if(nodo.num_niveles[i].checked){
				conf.dificultad = nodo.num_niveles[i].value;
			}
		}
		puntaje.restablecer();
		nodo.overlay_juego.style.display = 'block';
		nodo.puntos.firstChild.nodeValue = "0";
		nodo.pregunta.style.visibility = 'hidden';
		opciones.quitar_atributo_opcion_elegida();
		this.mostrarPuntajes();
	};
	var ejecutar_juego = function(){
		if(!temporizador_del_juego.finalizado()){
			opciones.quitar_atributo_opcion_elegida();
			bloque = Bloque(conf.dificultad);
			objetos.establecer_comienzo(conf.dificultad);
			opciones.agregar(conf.dificultad,respuesta_a_tiempo);
			nodo.overlay_juego.style.display = 'none';
			temporizador_para_responder.setTiempo(nivel[conf.dificultad].tiempo_para_elegir);
			temporizador_para_responder.iniciar();
		}
		else{
			juego_finalizado();
			if(window.localStorage) puntajes.esNuevoRecord(puntaje.getPuntos(),conf.dificultad);
		}
	};
	var temporizador_del_juego = new Temporizador(nodo.temporizador,ejecutar_juego,conf.duracion,'M:S');
	var temporizador_para_responder = new Temporizador(nodo.tiempo_para_elegir,ejecutar_caida,nivel[conf.dificultad].tiempo_para_elegir,'s');
	this.iniciar = function(){
		puntaje.restablecer();
		nodo.puntos.firstChild.nodeValue = "0";
		nodo.pregunta.style.visibility = 'visible';
		objetos.cancelar_caida(conf.dificultad);
		temporizador_del_juego.iniciar();
		ejecutar_juego();
	};
	this.reiniciar = function(){};
};

function Opciones(){
	var nodo = {
		area_juego: document.querySelector('#area_juego'),
		area_opciones: document.querySelector('#area_opciones'),
		opciones: new Array(),
	};
	var opcion_elegida;
	var fue_elegida_una_opcion = false;
	this.get_opcion_elegida = function(){
		return opcion_elegida;
	};
	var opciones_deshablitadas = function(){
		for(var i=0; i<nodo.opciones.length; i++){
			nodo.opciones[i].setAttribute("class","opciones opciones-deshablitadas");
		}
	};
	var addListeners = function(accion){
		nodo.opciones = document.querySelectorAll('.opciones');
		for(var i=0; i<nodo.opciones.length; i++){
			nodo.opciones[i].addEventListener('click',function(){
				if(!fue_elegida_una_opcion){
					opcion_elegida = this.getAttribute("id");
					fue_elegida_una_opcion = true;
					this.setAttribute("name","opcion_elegida");
					opciones_deshablitadas();
					accion();
				}
			}, false);
		}
	};
	this.agregar = function(dificultad,accion){
		letra = new Array('a','b','c','d','e');
		nodo_opcion = new Array();
		ancho_columna = 100/nivel[dificultad].columnas;
		fue_elegida_una_opcion = false;
		while(nodo.area_opciones.childNodes.length > 0){
			nodo.area_opciones.removeChild(nodo.area_opciones.lastChild);
		}
		for(var i=0; i<=nivel[dificultad].columnas; i++){
			nodo_opcion[i] = document.createElement("div");
			nodo_opcion[i].setAttribute("class","opciones");
			nodo_opcion[i].setAttribute("id",i);
			nodo.area_opciones.appendChild(nodo_opcion[i]);
			descuento = (Math.floor(nodo_opcion[i].clientWidth/2) * 100) / nodo.area_juego.clientWidth;
			nodo_opcion[i].style.left = ((ancho_columna * i) - descuento) + '%';
			nodo_opcion[i].appendChild(document.createTextNode(letra[i]));
		}
		addListeners(accion);
	};
	var get_opcion_elegida = function(){
		nodo.opciones = document.querySelectorAll('.opciones');
		for(var i=0; i<nodo.opciones.length; i++){
			if(nodo.opciones[i].getAttribute("name") == 'opcion_elegida'){
				return nodo.opciones[i];
			}
		}
	};
	this.quitar_atributo_opcion_elegida = function(){
		nodo_opcion_elegida = get_opcion_elegida();
		if(typeof(nodo_opcion_elegida) != 'undefined'){
			nodo_opcion_elegida.removeAttribute("name","opcion_elegida");
		}
	};
	this.deshabilitar_elegir_opcion = function(){
		if(!fue_elegida_una_opcion){
			fue_elegida_una_opcion = true;
			opcion_elegida = -1;
		}
		opciones_deshablitadas();
	};
};

function Bloque(dificultad){
	var nodo = {
		area_juego: document.querySelector('#area_juego'),
	};
	crear_bloques = function(){
		eliminar = function(){
			while(nodo.area_juego.childNodes.length > 0){
				nodo.area_juego.removeChild(nodo.area_juego.lastChild);
			}
		};
		agregar = function(){
			ancho_columna = 100/nivel[dificultad].columnas;
			alto_fila = 100/(nivel[dificultad].filas + 1);
			for(var i=0; i<nivel[dificultad].columnas; i++){
				nodo_columna = document.createElement("div");
				nodo_columna.setAttribute("class","columna");
				nodo_columna.style.width = ancho_columna+'%';
				nodo.area_juego.appendChild(nodo_columna);
				for(var j=0; j<nivel[dificultad].filas; j++){
					nodo_fila = document.createElement("div");
					nodo_fila.style.height = alto_fila+'%';
					nodo_columna.appendChild(nodo_fila);
				}
			}
		};
		eliminar();
		agregar();
	}; 
	definir_num_bloques_activos = function(){
		num_bloques_activos = new Array();
		for(var i=0; i<nivel[dificultad].columnas; i++){
			num_bloques_activos[i] = Math.round(Math.random()*(nivel[dificultad].bloques_activos.max - nivel[dificultad].bloques_activos.min)) + nivel[dificultad].bloques_activos.min;
		}
		return num_bloques_activos;
	};
	definir_bloques_activos = function(bloque){
		num_bloques_activos = definir_num_bloques_activos();
		var num_disponibles = new Array();
		for(var i=0; i<nivel[dificultad].filas; i++){
			num_disponibles.push(i);
		}
		num_seleccionados = new Array(2);
		num_seleccionados[0] = new Array();
		num_seleccionados[1] = new Array();
		for(var i=0; i<nivel[dificultad].columnas; i++){
			if(i>1){
				for(var k=0; k<num_seleccionados[i%2].length; k++){
					num_disponibles.push(num_seleccionados[i%2][k]);
				}
				num_seleccionados[i%2].splice(0,num_seleccionados[i%2].length);
			}
			for(var j=0; j<num_bloques_activos[i]; j++){
				posicion = Math.round(Math.random()*(num_disponibles.length-1));
				num_aleatorio = num_disponibles.splice(posicion,1);
				num_seleccionados[i%2].push(num_aleatorio);
				bloque[i][num_aleatorio].activo = true;
				bloque[i][num_aleatorio].div.setAttribute("class","activo");
			}
		}
	};
	definir_bloques = function(){
		crear_bloques();
		bloque = new Array();
		for(var i=0; i<nivel[dificultad].columnas; i++){
			bloque[i] = new Array();
			for(var j=0; j<nivel[dificultad].filas; j++){
				bloque[i][j] = {
					div:document.querySelector('#area_juego > .columna:nth-child('+(i+1)+') > div:nth-child('+(j+1)+')'),
					activo:false,
				};
			}
		}
		definir_bloques_activos(bloque);
		return bloque;
	};
	return definir_bloques();
};

function Controlador_objetos(max_num_objetos){
	var nodo = {
		preguntar_color: document.querySelector('#pregunta > p span'),
	};
	var objeto = new Array();
	for(var i=0; i<max_num_objetos; i++){
		objeto[i] = new Objeto(i);
	}
	var color_objeto = {
		eng:new Array('lime','orange','purple','aqua','fuchsia'),
		spa:new Array('lima','naranja','morado','agua','fucsia'),
	};
	this.ocultar = function(){
		for(var i=0; i<objeto.length; i++){
			objeto[i].ocultar();
		}
	};
	this.cancelar_caida = function(dificultad){
		for(var i=0; i<=nivel[dificultad].columnas; i++){
			objeto[i].cancelar_caida();
		}
	};
	this.dejar_caer = function(dificultad,bloque,continuar_juego){
		for(var i=0; i<=nivel[dificultad].columnas; i++){
			objeto[i].dejar_caer(dificultad,bloque,continuar_juego);
		}
	};
	var establecer_objetos = function(dificultad){
		for(var i=0; i<objeto.length; i++){
			(i <= nivel[dificultad].columnas) ? objeto[i].mostrar() : objeto[i].ocultar();
		}
	};
	var establecer_pregunta = function(objetivo){
		nodo.preguntar_color.firstChild.nodeValue = color_objeto.spa[objetivo];
		nodo.preguntar_color.style.color = color_objeto.eng[objetivo];
	};
	var establecer_objetivo = function(dificultad){
		objetivo = Math.round(Math.random()*nivel[dificultad].columnas);
		establecer_pregunta(objetivo);
		for(var i=0; i<=nivel[dificultad].columnas; i++){
			objeto[i].set_objetivo(i == objetivo);
		}
	};
	this.establecer_comienzo = function(dificultad){
		establecer_objetos(dificultad);
		establecer_objetivo(dificultad);
		for(var i=0; i<=nivel[dificultad].columnas; i++){
			objeto[i].establecer_comienzo(dificultad);
		}
	};
};

function Objeto(asignar_columna){
	var nodo_objeto = document.createElement("div");
	nodo_objeto.setAttribute("class","objeto");
	nodo_objeto.setAttribute("id","objeto_" + (asignar_columna+1));
	document.querySelector('#juego').appendChild(nodo_objeto);
	nodo_area_juego = document.querySelector('#area_juego');
	var columna = asignar_columna;
	var columna_inicial = asignar_columna;
	var fila = 0;
	var cancelar = false;
	var velocidad = 120;
	var objetivo = false;
	var animacion_horizontal;
	var animacion_vertical;
	this.set_velocidad = function(new_velocidad){
		velocidad = new_velocidad;
	};
	this.set_columna = function(new_columna){
		columna = new_columna;
		columna_inicial = new_columna;
	};
	this.set_objetivo = function(es_el_objetivo){
		objetivo = es_el_objetivo;
	};
	this.mostrar = function(){
		nodo_objeto.style.display = 'block';
	};
	this.ocultar = function(){
		nodo_objeto.style.display = 'none';
	};
	var cancelAnimationFrame = (function(){
		return window.cancelAnimationFrame ||
			window.webkitCancelAnimationFrame ||
			window.mozCancelAnimationFrame ||
			window.msCancelAnimationFrame ||
			window.oCancelAnimationFrame ||
			function(animation){
				window.clearTimeout(animation);
			};
	})();
	var requestAnimationFrame = (function(){
		return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			function(callback){
				animate = window.setTimeout(callback, 1000/60);
				return animate;
			};
	})();
	var cancelar_animacion = function(){
		cancelAnimationFrame(animacion_horizontal);
		cancelAnimationFrame(animacion_vertical);
	};
	this.cancelar_caida = function(){
		cancelar = true;
		cancelar_animacion();
	};
	this.establecer_comienzo = function(dificultad){
		columna = columna_inicial;
		fila = 0;
		var ancho_columna = (nodo_area_juego.clientWidth/nivel[dificultad].columnas);
		nodo_objeto.style.top = '0px';
		var posicion_horizontal = (ancho_columna * columna) + 15;
		nodo_objeto.style.left = posicion_horizontal + 'px';
	};
	this.dejar_caer = function(dificultad,bloque,continuar_juego){
		cancelar_animacion();
		cancelar = false;
		function posicionar_horizontalmente(sentido){
			var distancia = (nodo_area_juego.clientWidth/nivel[dificultad].columnas);
			var posicion_final = distancia * columna;
			var posicion_actual = (distancia * (columna - sentido));
			var desplazamiento = velocidad/60;
			function is_negativo(numero){
				return numero < 0;
			}
			function continuar(){
				if(is_negativo(sentido)){
					return ((posicion_actual - posicion_final) > 0) ? true : false;
				}
				else{
					return ((posicion_actual - posicion_final) < 0) ? true : false;
				}
			}
			function animar(){
				posicion_actual = (posicion_actual + (desplazamiento * sentido));
				if(continuar()){
					nodo_objeto.style.left = (posicion_actual + 15) + 'px';
					animacion_horizontal = requestAnimationFrame(animar);
				}
				else{
					nodo_objeto.style.left = (posicion_final + 15) + 'px';
					mover_verticalmente();
				}
			}
			animar();
		};
		function posicionar_verticalmente(){
			var distancia = nodo_area_juego.clientHeight/(nivel[dificultad].filas + 1);
			var posicion_vertical_final = distancia * (fila + 1);
			var posicion_vertical_actual = distancia * fila;
			var desplazamiento_vertical = velocidad/60;
			function animar(){
				posicion_vertical_actual = posicion_vertical_actual + desplazamiento_vertical;
				if((posicion_vertical_actual - posicion_vertical_final) < 0){
					nodo_objeto.style.top = (posicion_vertical_actual - 5) + 'px';
					animacion_vertical = requestAnimationFrame(animar);
				}
				else{
					nodo_objeto.style.top = (posicion_vertical_final - 5) + 'px';
					mover();
				}
			}
			animar();
		};
		function mover(){
			if(!cancelar){
				if(fila < nivel[dificultad].filas){
					columna_anterior = columna - 1;
					columna_anterior = (columna_anterior < 0) ? columna : columna_anterior;
					if(columna < nivel[dificultad].columnas && bloque[columna][fila].activo){
						columna++;
						posicionar_horizontalmente(1);
					}
					else if(bloque[columna_anterior][fila].activo){
						columna--;
						posicionar_horizontalmente(-1);
					}
					else{
						mover_verticalmente();
					}
				}
				else{
					if(objetivo) continuar_juego(columna);
				}
			}
		};
		function mover_verticalmente(){
			cancelAnimationFrame(animacion_horizontal);
			fila++;
			posicionar_verticalmente();
		};
		posicionar_verticalmente();
	};
};

function Temporizador(nodo,aviso,getTiempoLimite,getFormato){//aviso es una funcion a ejecutar al finalizar el temporizador
	var nodoTemporizador = nodo;
	var inicio = 0;
	var ahora = 0;
	var activo = false;
	var parar = false;
	var tiempoEnPause = {
		inicio:0,
		fin:0,
	};
	var tiempoLimite = (typeof(getTiempoLimite) != 'undefined') ? getTiempoLimite : 90000;
	var formato = (typeof(getFormato) != 'undefined') ? getFormato : 'H:M:S';
	var enMilisegs = function(){
		return inicio - ahora + tiempoLimite + 999;
	};
	this.finalizado=function(){
		return !activo;
	};
	this.cambiarNodo = function(nuevoNodo){
		nodoTemporizador = nuevoNodo;
	};
	this.setTiempo = function(nuevotiempo){
		tiempoLimite = nuevotiempo;
	};
	this.setFormato = function(nuevoformato){
		formato = nuevoformato;
	};
	var formatear = function(hora,minuto,segundo){
		regresarValor = function(){
			arreglo = formato.split('');
			for(i=0; i<arreglo.length; i++){
				arreglo[i] = aplicar(arreglo[i]);
			}
			return arreglo.join('');
		};
		addCeroInicial = function(numero){
			return (numero < 10) ? '0'+numero : numero;
		};
		aplicar = function(caracter){
			switch(caracter){
				case 'H':
					return addCeroInicial(hora);
					break;
				case 'h':
					return hora;
					break;
				case 'M':
					return addCeroInicial(minuto);
					break;
				case 'm':
					return minuto;
					break;
				case 'S':
					return addCeroInicial(segundo);
					break;
				case 's':
					return segundo;
					break;
				default:
					return caracter;
					break;
			}
		};
		return regresarValor();
	};
	var imprimir = function(tiempo){
		getHours = function(){
			return Math.floor(tiempo / 1000 / 60 / 60);
		};
		getMinutes = function(){
			return Math.floor(tiempo / 1000 /60 - (60 * getHours()));
		};
		getSeconds = function(){
			return Math.floor(tiempo / 1000 - (60 * 60 * getHours()) - (60 * getMinutes()));
		};
		return isNaN(tiempo) ? formatear('--','--','--') : formatear(getHours(),getMinutes(),getSeconds());
	};
	var descontarPause = function(){
		inicio -= (tiempoEnPause.inicio - tiempoEnPause.fin);
		tiempoEnPause.inicio = 0;
		tiempoEnPause.fin = 0;
	};
	var contar = function(){
		if(!parar){
			ahora = new Date();
			if(enMilisegs() >= 1000) nodoTemporizador.firstChild.nodeValue = imprimir(enMilisegs());
			else{
				nodoTemporizador.firstChild.nodeValue = 0;
				activo = false;
				parar = true;
				aviso();
			}
			window.setTimeout(contar, 1000);
		}
	};
	this.iniciar = function(){
		inicio = new Date();
		activo = true;
		parar = false;
		contar();
	};
	this.pause = function(){
		parar = true;
		tiempoEnPause.inicio = new Date();
		contar();
	};
	this.play = function(){
		tiempoEnPause.fin = new Date();
		descontarPause();
		parar = false;
		contar();
	};
	this.detener = function(){
		parar = true;
		contar();
	};
};

function PuntajeParcial(){
	var aciertosConsecutivos=0;
	var erroresConsecutivos=0;
	var puntos=0;
	this.getPuntos=function(){
		return puntos;
	};
	this.restablecer=function(){
		aciertosConsecutivos=0;
		erroresConsecutivos=0;
		puntos=0;
	};
	this.getAciertosConsecutivos=function(){
		return aciertosConsecutivos;
	};
	var noNegativo=function(puntos){
		return (puntos < 0) ? 0 : puntos;
	};
	this.calcular=function(acierto){
		if(acierto){
			erroresConsecutivos=0;
			switch(aciertosConsecutivos){
				case 0:
					aciertosConsecutivos++;
					puntos+=25;
					return puntos;
					break;
				case 1:
					aciertosConsecutivos++;
					puntos+=30;
					return puntos;
					break;
				case 2:
					aciertosConsecutivos++;
					puntos+=40;
					return puntos;
					break;
				case 3:
					aciertosConsecutivos++;
					puntos+=55;
					return puntos;
					break;
				case 4:
					aciertosConsecutivos++;
					puntos+=75;
					return puntos;
					break;
				case 5:
					puntos+=100;
					return puntos;
					break;
				default:
					break;
			}
		}
		else{
			aciertosConsecutivos=0;
			switch(erroresConsecutivos){
				case 0:
					erroresConsecutivos++;
					puntos-=10;
					puntos = noNegativo(puntos);
					return puntos;
					break;
				case 1:
					erroresConsecutivos++;
					puntos-=12;
					puntos = noNegativo(puntos);
					return puntos;
					break;
				case 2:
					erroresConsecutivos++;
					puntos-=16;
					puntos = noNegativo(puntos);
					return puntos;
					break;
				case 3:
					erroresConsecutivos++;
					puntos-=22;
					puntos = noNegativo(puntos);
					return puntos;
					break;
				case 4:
					erroresConsecutivos++;
					puntos-=30;
					puntos = noNegativo(puntos);
					return puntos;
					break;
				case 5:
					puntos-=40;
					puntos = noNegativo(puntos);
					return puntos;
					break;
				default:
					break;
			}
		}
	};
};

function Puntajes(){
	var nodo = {
		obtenerUsuario:document.getElementById("obtenerUsuario"),
		overlay_pantalla:document.getElementById("overlay_pantalla"),
		records:document.getElementById("records"),
		ingresaUsuario:document.getElementById("ingresaUsuario"),
	};
	var record = new Record();
	var dialogModal = {
		mostrar:function(){
			nodo.overlay_pantalla.style.display = 'block';
			nodo.overlay_pantalla.style.opacity = 0.3;
			nodo.ingresaUsuario.style.display = 'block';
		},
		ocultar:function(){
			nodo.overlay_pantalla.style.display = 'none';
			nodo.obtenerUsuario.value = "";
		},
	};
	this.mostrarPuntajes = function(dificultad){
		record.imprimir(dificultad);
	};
	this.esNuevoRecord = function(puntos,dificultad){
		if (record.esNuevo(puntos,dificultad)){
			dialogModal.mostrar();
			nodo.obtenerUsuario.focus();
			nodo.obtenerUsuario.onkeyup = function(evento){
				var event = window.event || evento;
				var key = event.keyCode;
				if (key == 13){
					nombre = this.value;
					if(nombre == null || nombre == ''){
						nombre = 'anonimo';
					}
					record.acomodar(puntos,nombre,dificultad);
					record.imprimir(dificultad);
					nodo.ingresaUsuario.style.display='none';
					dialogModal.ocultar();
				}
			};
		}
		else{
			
		}
	};
};

function Record(){
	var MAX_USERS_RECORDS = 3;
	var NIVELES = new Array('facil','medio','dificil');
	var COLUMNAS = 2;
	var nodo={
		tbody:document.querySelector("#records table tbody"),
		celda:{},
	};
	var crearCeldas=function(numRenglones){
		for(var i=0; i<numRenglones; i++){
			nodoTr = document.createElement("tr");
			nodo.tbody.appendChild(nodoTr);
			for(var j=0; j<COLUMNAS; j++){
				nodoTd = document.createElement("td");
				nodoTr.appendChild(nodoTd);
				nodoTd.appendChild(document.createTextNode(''));
			}
		}
	};
	var eliminarCeldas=function(numRenglones){
		for(var i=0; i<numRenglones; i++){
			nodo.tbody.removeChild(nodo.tbody.lastChild);
		}
	};
	var establecerCeldas=function(){
		var numRenglonesCreados = document.querySelectorAll("#records table tbody tr").length;
		var numRenglones = MAX_USERS_RECORDS -  numRenglonesCreados;
		if(numRenglones > 0) crearCeldas(numRenglones);
		else if(numRenglones < 0) eliminarCeldas(Math.abs(numRenglones));
	};
	var crearArray=function(){
		var crearArray = new Array();
		for(var i = 0; i < MAX_USERS_RECORDS; i++){
			crearArray[i]='undefined';
		}
		return crearArray;
	};
	var crearIndefinido=function(){
		juego={};
		for(var i = 0; i < NIVELES.length; i++){
			juego[NIVELES[i]]={
				usuario:crearArray(),
				puntos:crearArray()
			}
		}
		return juego;
	};
	this.indefinido={
		juego:crearIndefinido()
	};
	this.aTexto=function(objeto){
		txt = '{';
		for(i in objeto){
			txt += "'"+i+"':{";
			for(j in objeto[i]){
				txt += "'"+j+"':{";
				for(k in objeto[i][j]){
					txt += "'"+k+"': [";
					for(l in objeto[i][j][k]){
						txt += "'"+objeto[i][j][k][l]+"',";
					}
					txt += "],";
				}
				txt += "},";
			}
			txt += "},";
		}
		txt += '}';
		return txt;
	};
	this.aObjeto=function(cadena){
		return eval('('+cadena+')');
	};
	this.getRecords=function(){
		if(!localStorage.getItem('recordsAdivinaDondeCae')){
			localStorage.setItem('recordsAdivinaDondeCae',this.aTexto(this.indefinido));
		}
		return this.aObjeto(localStorage.getItem("recordsAdivinaDondeCae"));
	};
	var isValido=function(){};
	this.records=this.getRecords();
	this.esNuevo=function(newScore,dificultad){
		this.records = this.getRecords();
		return isNaN(this.records.juego[dificultad].puntos[MAX_USERS_RECORDS-1]) || this.records.juego[dificultad].puntos[MAX_USERS_RECORDS-1] < newScore;
	};
	this.imprimir=function(dificultad){
		establecerCeldas();
		nodo.celda.usuario = document.querySelectorAll("#records table tbody tr td:nth-child(odd)");
		nodo.celda.puntos = document.querySelectorAll("#records table tbody tr td:nth-child(even)");
		for(atributo in this.records.juego[dificultad]){
			for(i in this.records.juego[dificultad][atributo]){
				if(atributo == 'puntos'){
					nodo.celda[atributo][i].firstChild.nodeValue = this.records.juego[dificultad][atributo][i];
				}
				else{
					nodo.celda[atributo][i].firstChild.nodeValue = this.records.juego[dificultad][atributo][i];
				}
			}
		}
	};
	this.acomodar=function(newScore,newName,dificultad){
		var j = 0;
		for(i in this.records.juego[dificultad].puntos){
			if (isNaN(this.records.juego[dificultad].puntos[i])){
				this.records.juego[dificultad].puntos[i] = newScore;
				this.records.juego[dificultad].usuario[i] = newName;
				localStorage.setItem('recordsAdivinaDondeCae',this.aTexto(this.records));
				break;
			}
			else if(parseInt(this.records.juego[dificultad].puntos[i]) < parseInt(newScore) || (parseInt(this.records.juego[dificultad].puntos[i]) == parseInt(newScore) && j > 0)){
				j++;
				tempTiempo = this.records.juego[dificultad].puntos[i];
				tempNombre = this.records.juego[dificultad].usuario[i];
				this.records.juego[dificultad].puntos[i] = newScore;
				this.records.juego[dificultad].usuario[i] = newName;
				newScore = tempTiempo;
				newName = tempNombre;
				localStorage.setItem('recordsAdivinaDondeCae',this.aTexto(this.records));
			}
		}
	};
};

function main(){
	juego = new Juego();
	juego.mostrarPuntajes();
	document.nivel.addEventListener('change',function(){
		juego.reconf();
	}, false);
	document.querySelector('#new').addEventListener('click',function(){
		juego.iniciar();
	}, false);
}

document.addEventListener("DOMContentLoaded", main, false);