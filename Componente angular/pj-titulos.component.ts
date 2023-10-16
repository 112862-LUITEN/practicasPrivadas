import { Component, OnInit, Type } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PjDeudasService } from '@app/_pj-deudas/pj-deudas.service';
import { Command } from 'protractor';
import { Titulo } from '../models/titulo';
import { Comprobante } from '../models/comprobante';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ModalDevolucionesComponent } from '../modales/modal-devoluciones/modal-devoluciones.component'
import { ModalHistoricoComponent } from '../modales/modal-historico/modal-historico.component';
import { ModalObservacionesComponent } from '../modales/modal-observaciones/modal-observaciones.component';
import { ModalComprobantesComponent } from '../modales/modal-comprobantes/modal-comprobantes.component';
import { ModalDeudoresComponent } from '../modales/modal-deudores/modal-deudores.component';
import { Deudor } from '../models/deudor';
import { MatButton } from '@angular/material/button';
import { MatTableDataSource } from '@angular/material/table';
import { ModalAnotacionesComponent } from '../modales/modal-anotaciones/modal-anotaciones.component';
import { AbstractControl } from '@angular/forms';
import { exit } from 'process';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { AppsGenericoService, CampoTypes, InputValidoTypes } from 'projects/apps-generico/src/lib/apps-generico.service';
import { ModalEdicionComponent } from '../modales/modal-edicion/modal-edicion.component';



@Component({
  selector: 'app-pj-titulos',
  templateUrl: './pj-titulos.component.html',
  styleUrls: ['./pj-titulos.component.css']
})
export class PjTitulosComponent implements OnInit {

  constructor(private serv: PjDeudasService, public dialog: MatDialog, private router: Router, private route: ActivatedRoute, private servGenerico: AppsGenericoService) {
    this.ocultas = ["titulo", "objid", "procurador", "estado", "visible", "historico",
      "para_devolucion", "ubicacion", "copia",
      "anotaciones_procurador", "id_dependencia", "id_de_certificado",
      "id_descarga_certificado", "id_tipo_de_concepto", "id_localidad",
      "numero_de_titulo", "fecha_de_ingreso", "deudores", "estado_actual", "nrodocumento", "observaciones", "archivos", "comprobantes"];
    this.comprobantes = [];
    //this.titulos = [];
    this.prueba = 1;
    this.filtros = [{
      campo: 'estado_',
      valor: ''
    },
    {
      campo: 'localidad_',
      valor: ''
    },
    {
      campo: 'deudor',
      valor: ''
    }
    ]
    this.tablaI = new MatTableDataSource();
  }

  nombrePrestador: string;
  codigoProcurador: number;

  ngOnInit(): void {
    this.watermark = this.serv.getWatermark()
    let user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
      this.nombrePrestador = user['nombreUsuarioKermet'];
      this.codigoProcurador = user['codigoProcurador'];
      
      this.serv.setUsuarioWeb(user['username'])
      this.serv.setNombrePrestador(this.nombrePrestador);
      this.serv.setCodigoProcurador(this.codigoProcurador)
    }

    this.fileName = 'Certificados';

    this.serv.obtenerTitulosAsync().subscribe(informacion => {
      console.log('pj-titulos component', informacion);
      this.serv.obtenerDeudoresAsync().subscribe(() => {
        //this.titulos = this.serv.getTitulos();
        console.log(this.titulos);

        this.tablaI.data = this.titulos
        this.devolucionSolicitada = false;
        //this.estadoSeleccionado='1'
        this.tablaI.filterPredicate = this.customFiltered();
        this.val = "";

        // this.serv.getArchivosProcurador().subscribe(data => {
        //   this.archivos = data.registros;
        //   this.matchearArchivosTitulos();
        //   this.cargarFiltroDeudores()
        // });
      });
    })

  }

  get titulos() {
    return this.serv.getTitulos()
  }

  // matchearArchivosTitulos() {
  //   const data = this.titulos;


  //   this.titulos.forEach(titulo =>{
  //     this.archivos.forEach(archivo => {
  //       if(archivo.idcertificado == titulo.id_de_certificado){
  //         let pa= 22;
  //         titulo.archivos.push(archivo)
  //       }
  //     });
  //   })
  // }

  cargarFiltroDeudores() {
    //Esta función sirve para setear en el campo deudor de cada título un string que contenga deserializado el array de deudores
    //Esto sirve para que poder filtrar certificados por cualquier valor relacionado al deudor que exista en el array deudores del título
    this.titulos.forEach(titulo => {
      const stringAux = titulo.deudores
        .map(({ domiciliolegal, domicilioreal, idprocurador, idcertificado, iddeudor, objid, ...rest }) => rest);
      titulo.deudor = JSON.stringify(stringAux)
      var pp = 22;
    });


  }

  // isOptionDisabled(estadoElegido: string, estadoActual: string): boolean {
  //   switch (estadoElegido) {
  //     case 'Adeudado':
  //       return estadoActual !== 'Adeudado';
  //     case 'Gestion Extrajudicial':
  //       return estadoActual !== 'Adeudado';
  //     case 'Gestion Judicial':
  //       return estadoActual !== 'Adeudado' && estadoActual !== 'Gestion Extrajudicial';


  //     case 'Con Plan de Pago':
  //       return estadoActual !== 'Gestion Extrajudicial' && estadoActual !== 'Con Plan de Pago'
  //     case 'Cobro Extrajudicial':
  //       return estadoActual !== 'Gestion Extrajudicial' && estadoActual !== 'Gestion Judicial' && estadoActual !== 'Con Plan de Pago';
  //     case 'Cobro Judicial':
  //       return estadoActual !== 'Gestion Judicial' && estadoActual !== 'Con Plan de Pago';
  //     case 'Pagado con anterioridad':
  //       return estadoActual !== 'Gestion Extrajudicial' && estadoActual !== 'Gestion Judicial' && estadoActual !== 'Con Plan de Pago';

  //     case 'Incobrable':
  //       return estadoActual !== 'Gestion Extrajudicial' && estadoActual !== 'Gestion Judicial';

  //     default:
  //       return false; // Por defecto, no deshabilitar el campo
  //   }
  // }

/*   exportarExcel(){
    let ehhhhh = ()=>{
      this.servGenerico.mostrarNotificacion('ej'+this.contador.toString(),'red')
      this.contador++;
  }
    let ehh = setInterval(ehhhhh, 3000)
  }
  contador=0; */
  exportarExcel(): void {
    // Get the filtered data from the MatTableDataSource

    const newDataAux = this.tablaI.filteredData
    newDataAux.forEach(cert => {
      cert.nrodocumento = this.obtenerDNIs(cert);
      cert.deudor = this.obtenerDeudores(cert)
    });

    let newData = newDataAux
      .filter(titulo => titulo.visible === true)
      .map(({ visible, id_de_certificado, id_dependencia, numero_de_titulo, id_descarga_certificado, id_localidad, estado_actual, delegación, id_tipo_de_concepto, deudores, archivos, objid, ...rest }) => rest);


    const filteredData = newData;

    // Create the worksheet using the filtered data
    const worksheet = XLSX.utils.json_to_sheet(filteredData);

    // Create the workbook with the filtered data
    const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };

    // Convert workbook to Excel buffer
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Create a Blob with the Excel buffer
    const excelData: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

    // Save the Blob as an Excel file
    saveAs(excelData, this.fileName + '.xlsx');
  }

  obtenerDNIs(cert: Titulo) {
    let auxStringDnis = "";
    cert.deudores.forEach(deudor => {
      if (auxStringDnis.length > 0) {
        auxStringDnis = auxStringDnis + ", "
      }
      auxStringDnis = auxStringDnis + deudor.documento
    });
    return auxStringDnis;
  }

  obtenerDeudores(cert: Titulo) {
    let auxStringNombres = "";
    cert.deudores.forEach(deudor => {
      if (auxStringNombres.length > 0) {
        auxStringNombres = auxStringNombres + " | "
      }
      auxStringNombres = auxStringNombres + deudor.nombre
    });
    return auxStringNombres;
  }

  async filterevent(val: string) {
    this.val = ((val == "_") ? " " : val);
    this.tablaI.filter = val.toLowerCase().trim();
  }

  customFiltered() {
    return (data, filter) => {
      if (this.val) {
        let filtros = this.val.trim().toLowerCase().split(" ");
        var properties = Object.keys(data);
        var cantidadFiltros = 0;
        var BreakException = {};
        filtros.forEach(function (unfiltro) {
          try {
            properties.forEach(function (key) {
              if (data[key] != null && data[key].toString().toLowerCase().includes(unfiltro)) {
                cantidadFiltros++;
                throw BreakException;
              }
            })
          }
          catch (e) {
            if (e !== BreakException) throw e;
          }
        })
        return cantidadFiltros == filtros.length;
      }
      return true;
    }
  }

  mostrarDeudores(titulo: Titulo) {
    let dialogRef = this.dialog.open(ModalDeudoresComponent, {
      data: {
        deudores: titulo.deudores
      }
    })
  }

  descargarPDF(titulo: Titulo) {
    if (titulo.archivos.length > 0) {
      let auxIndex = titulo.archivos.findIndex(arch => arch.tipo.startsWith('C'))

      this.serv.getImagenPrueba(titulo.archivos[auxIndex].archivo).subscribe(data => {
        let blob = new Blob([data["body"]], { type: "application/pdf" })
        var _url = window.URL.createObjectURL(blob)
        window.open(_url, "_blank")
      })
    } else {
      this.serv.showAviso("Archivo no disponible", "El certificado " + titulo.titulo + " no posee un archivo pdf asociado")
    }

  }

  mostrarComprobantes(titulo: Titulo) {
    let pp = 22

    let dialogRef = this.dialog.open(ModalComprobantesComponent, {
      data: { idCertificadoElegido: titulo.id_de_certificado }
    });
  }


  historico(titulo: Titulo): void {

    this.serv.obtenerObservacionesNovedades(titulo.id_de_certificado).subscribe();

    setTimeout(() => {
      let novedadesServ = this.serv.getNovedades();
      console.log('En getNovedades quedó: ', novedadesServ);

      let dialogRef = this.dialog.open(ModalHistoricoComponent, {
        data: {
          novedades: novedadesServ
        }
      });
    }, 2000);

  }
  //20 enero 2023: Se agregó componente 'Anotaciones' para que el procurador haga anotaciones
  //sobre el certificado. Las 'observaciones' son justamente observaciones del certificado
  //previas al sorteo del mismo. Se van a mostrar en el desplegable y no con este componente.
  // agregarObservacion(titulo:Titulo){
  //   let dialogRef = this.dialog.open(ModalObservacionesComponent,{
  //     data:{
  //       titulo:titulo
  //     }
  //   });
  //   dialogRef.afterClosed().subscribe(result => {
  //     console.log('Se cerró el modal Observaciones con el valor: ',result.mensaje);
  //     //En result va a estar el texto que necesito almacenar junto con la fecha en observaciones históricas
  //    //console.log(titulo.observaciones+'\n'+result.mensaje);
  //    if (result ===""){
  //     //console.log('La observación está vacía.');

  //   } else {
  //     let fechaHora = new Date().toLocaleString('en-GB', { timeZone: 'America/Argentina/Cordoba' }) +": "
  //     let observacionesAcumuladas = titulo.observaciones;
  //     let historicoAcumulado = titulo.historico;
  //     titulo.observaciones = "";
  //     titulo.historico="";
  //     //console.log("Se enviará la peticion para agregar la observacion");

  //     //this.serv.agregarObservacion(titulo).subscribe();
  //     titulo.observaciones = observacionesAcumuladas+((observacionesAcumuladas.length>0) ? '\n':"")+fechaHora+result.mensaje;
  //     titulo.historico = historicoAcumulado+'\n'+fechaHora+result.mensaje
  //     //this.serv.agregarObservacion(titulo).subscribe();
  //   }


  //   })
  // }

  indicarExpedienteFiscal(titulo: Titulo, referenciaDesplegable: any) {
    let estadoOriginal = titulo.estado_
    let dialogRef = this.dialog.open(ModalEdicionComponent, { data: titulo });
    //estadoNuevo = 9
    dialogRef.afterClosed().subscribe(
      result => {
        if (result) {
          // Si guardó los cambios, persistir
          this.serv.showMensaje("Control", "Está seguro asignar el Nro. de expediente ejecutivo fiscal '" + titulo.expte_ejec_fiscal
            + "' al título " + titulo.numero_de_titulo + "? Se cambiará su estado a 'Gestión judicial'").subscribe(value => {
              if (value) {
                titulo.estado_actual = 9
                titulo.estado_ = "Gestion Judicial"
                let fechaHora = new Date().toLocaleString('en-GB', { timeZone: 'America/Argentina/Cordoba' }) + ": "
                let historicoAcumulado = titulo.historico;
                titulo.historico = "";
                titulo.historico = historicoAcumulado + '\n' + fechaHora + 'Se cambió el estado a "' + titulo.estado_ + '"';
                this.serv.cambiarEstado(titulo).subscribe();
              } else {
                titulo.expte_ejec_fiscal = ""
                referenciaDesplegable.source.writeValue(titulo.estado_);
                return
              }
              referenciaDesplegable.source.writeValue(titulo.estado_);
              this.reRenderizar();

              /* this.reRenderizar()
              setTimeout(() => {
                this.reRenderizar()
              }, 0.5); */
            })
        }
        // acà reinicipar posiciòn del desplegable estado
        referenciaDesplegable.source.writeValue(titulo.estado_);
      }
    )
  }

  reRenderizar() {
    this.tablaI.data = [];
    this.tablaI.filteredData = [];
    this.tablaI.data = JSON.parse(JSON.stringify(this.serv.getTitulos()))
    this.tablaI.filterPredicate = this.customFiltered()
  }

  agregarAnotacion(titulo: Titulo) {
    let dialogRef = this.dialog.open(ModalAnotacionesComponent, {
      data: {
        titulo: titulo
      },
      width: 'min(92%, 1000px)',
      maxWidth: '100vw',
      height: 'min(90%,1000px)'
    });

    dialogRef.afterClosed().subscribe(
      result => {
        let pp = 22;
        /* console.log('Se cerró el modal Observaciones con el valor: ', result.mensaje);
        if (result === "") {
          //El usuario no escribió nada en la anotación
        }
        else {
          const spacesNeeded = 20 - this.serv.getNomebrePrestador().length;
          let usuario = this.serv.getNomebrePrestador() + ' '.repeat(spacesNeeded);;
          let fechaHora = new Date().toLocaleString('en-GB', { timeZone: 'America/Argentina/Cordoba' }) + ": "
          let anotacionesAcumuladas = titulo.anotaciones_procurador;
          let historicoAcumulado = titulo.historico;
          titulo.anotaciones_procurador = "";
          titulo.historico = "";
          //console.log("Se enviará la peticion para agregar la anotacion");

          //this.serv.agregarObservacion(titulo).subscribe();
          titulo.anotaciones_procurador = anotacionesAcumuladas + ((anotacionesAcumuladas.length > 0) ? '\n' : '') + usuario +" " + fechaHora + result.mensaje;
          titulo.historico = historicoAcumulado + '\n' + usuario +" "+ fechaHora + result.mensaje
          this.serv.agregarAnotacion(titulo).subscribe();
        } */
      }
    )
  }



  Devolver(event, titulo: Titulo): void {
    event.preventDefault();
    let dialogRef = this.dialog.open(ModalDevolucionesComponent, {
      data: {
        Observacion: "Esto fue escrito",
        tituloADevolver: titulo
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      //console.log('Pj-titulos.component- Se cerró el modal');
      //console.log('El texto ingresado fue',result);

      let chkbox = document.getElementById('chkbxDevolver') as HTMLInputElement | null;
      if (result.accion == "Guardar") {
        let tituloAModificar = this.titulos.findIndex(certificado => certificado.titulo === titulo.titulo)
        this.titulos[tituloAModificar].para_devolucion = 'S'
        let pr = 2;
        let fechaHora = new Date().toLocaleString('en-GB', { timeZone: 'America/Argentina/Cordoba' }) + ": "
        titulo.para_devolucion = "S";
        let observacionesAcumuladas = titulo.anotaciones_procurador;
        titulo.anotaciones_procurador = titulo.anotaciones_procurador.length > 0 ?
          observacionesAcumuladas + '\n' + this.serv.getNombreUsuarioWeb(true) + fechaHora + 'Se solicitó la devolución con motivo de: ' + result.mensaje
          :
          this.serv.getNombreUsuarioWeb(true) +" " + fechaHora + 'Se solicitó la devolución con motivo de: ' + result.mensaje

        titulo.observacion_devolucion = result.mensaje;

        titulo.ubicacion = 'A';
        this.serv.devolverCertificado(titulo).subscribe();
        chkbox.checked = true;
        this.reRenderizar();
      }
      else {
        this.titulo.para_devolucion = 'N'
        chkbox.checked = false;

      }
    })
  }


  public abrirListbox(valor: number, titulo: any) {
    this.estadoActual = valor;
  }


  cambiar(estadoElegido: any, titulo: Titulo, indice: number) {
    //console.log('El estado actual es ',titulo.estado);
    // alert('El estado actual del título '+titulo.titulo+'. Es '+this.estadoActual)
    //Hacer llamada a modal confirmación indicando el estado actual que posee el título y el nuevo estado seleccionado al cual se cambiara si confirma

    let nombreEstadoActual: string = titulo.estado_
    let estadoNuevo: number = 0;
    // let tituloN: Titulo[] = [];
    // let tituloNuevo = Object.assign({}, titulo);


    let indexAux = -1
    switch (estadoElegido.value) {
      case 'Adeudado':
        estadoNuevo = 1
        break;
      case 'Gestion Extrajudicial':
        estadoNuevo = 8
        //titulo.estado_actual = 'Gestión extrajudicial'
        break;
      case 'Gestion Judicial':
        // if (titulo.expte_ejec_fiscal.length < 1) {
        //   this.serv.showAviso("Control", "Para poder cambiar el estado a 'Gestión judicial', el título debe poseer un número/codigo de Expediente de ejecución fiscal.")
        //   estadoElegido.source.writeValue(titulo.estado_);
        //   return
        // }
        this.indicarExpedienteFiscal(titulo, estadoElegido)
        return;
      case 'Con Plan de Pago':
        indexAux = titulo.comprobantes.findIndex(c => c.tipo.toUpperCase() === 'PLAN DE PAGO')
        if (indexAux === -1) {
          this.serv.showAviso("Control", "Para poder cambiar el estado a 'Plan de pago', debe cargar un comprobante de tipo 'Plan de pago'.")
          estadoElegido.source.writeValue(titulo.estado_);
          return
        }
        estadoNuevo = 12
        break;
      case 'Cobro Extrajudicial':
        indexAux = titulo.comprobantes.findIndex(c => c.tipo.toUpperCase() === 'PLAN DE PAGO' || c.tipo.toUpperCase() === 'BOLETA' || c.tipo.toUpperCase() === 'O.P.E');
        if (indexAux === -1) {
          this.serv.showAviso("Control", "Para poder cambiar el estado a 'Cobro Extrajudicial', debe cargar un comprobante de tipo 'Plan de pago', 'Boleta' o 'O.P.E'.")
          estadoElegido.source.writeValue(titulo.estado_);
          return
        }
        estadoNuevo = 18
        break;
      case 'Cobro Judicial':
        indexAux = titulo.comprobantes.findIndex(c => c.tipo.toUpperCase() === 'PLAN DE PAGO' || c.tipo.toUpperCase() === 'BOLETA' || c.tipo.toUpperCase() === 'O.P.E')
        let indexTasaEjec = titulo.comprobantes.findIndex(c => c.tipo.toUpperCase() === 'TASA DEL EJECUTIVO')
        if (indexAux >= 0 && indexTasaEjec >= 0) {
          estadoNuevo = 11
          break;
        } else {
          this.serv.showAviso("Control", "Para poder cambiar el estado a 'Cobro Judicial', debe cargar un comprobante de tipo 'Plan de pago', 'Boleta' o 'O.P.E' y además otro de tipo 'Tasa del ejecutivo'")
          estadoElegido.source.writeValue(titulo.estado_);
          return

        }

      case 'Incobrable':
        indexAux = titulo.comprobantes.findIndex(c => c.tipo.toUpperCase() === 'CONSTANCIAS DE INCOBRABLE')
        if (indexAux === -1) {
          this.serv.showAviso("Control", "Para poder cambiar el estado a 'Incobrable', debe cargar un comprobante de tipo 'Constancias de Incobrable'.")
          estadoElegido.source.writeValue(titulo.estado_);
          return
        }
        estadoNuevo = 11
        break;
      case 'Pagado con anterioridad':
        indexAux = titulo.comprobantes.findIndex(c => c.tipo.toUpperCase() === 'PLAN DE PAGO' || c.tipo.toUpperCase() === 'BOLETA' || c.tipo.toUpperCase() === 'O.P.E');
        if (indexAux === -1) {
          this.serv.showAviso("Control", "Para poder cambiar el estado a 'Pagado con anterioridad', debe cargar un comprobante de tipo 'Plan de pago', 'Boleta' o 'O.P.E'.")
          estadoElegido.source.writeValue(titulo.estado_);
          return
        }
        estadoNuevo = 14
        break;

      default:
        break;
    }



    if (estadoElegido.value == nombreEstadoActual) {
      return;
    } else {
      const EstadoAnterior = this.estadoActual;
      //////////////

      this.serv.showMensaje
        ("Aviso", "¿Está seguro de que desea cambiar el estado del certificado " + titulo.titulo + " : " + nombreEstadoActual + " a " + estadoElegido.value + "?").subscribe(
          value => {
            if (value) {
              titulo.estado_actual = estadoNuevo
              titulo.estado_ = estadoElegido.value
              let fechaHora = new Date().toLocaleString('en-GB', { timeZone: 'America/Argentina/Cordoba' }) + ": "
              let historicoAcumulado = titulo.historico;
              titulo.historico = "";
              titulo.historico = historicoAcumulado + '\n' + fechaHora + 'Se cambió el estado a "' + titulo.estado_ + '"';
              this.serv.cambiarEstado(titulo).subscribe();
            } else {
              estadoElegido.source.writeValue(titulo.estado_);
              return;
            }
          }
        )
    }

  }

  onTextoBusquedaIngresado(searchValue: {}) {
    //this.textoBusqueda = searchValue;
    //console.log('titulo: ',searchValue);

  }

  swapDayMonth(dateString: string): string {
    const parts = dateString.split('/'); // Split the date string by '/'
    const swappedDate = parts[1] + '/' + parts[0] + '/' + parts[2]; // Reassemble the date string with swapped day and month
    return swappedDate;
  }

  isOptionDisabled(estadoElegido: string, estadoActual: string, index: number): boolean {
    const option = this.estadoOptions.find(opt => opt.value === estadoElegido);
    let referenciaCert = this.serv.getTitulos()[index]
    if (referenciaCert.numero_de_titulo === '95952') {
      let pp = 22
    }
    if (!option) {
      return false;
    }

    for (const constraint of option.constraints) {
      if (estadoActual === constraint) {
        // if (estadoElegido === 'Gestion Judicial' && referenciaCert.expte_ejec_fiscal.length > 0) {
        //   if (referenciaCert.numero_de_titulo === '95952') {
        //     let pp = 22
        //   }
        //   return true;
        // }
        return false;
      }
    }

    return true;
  }

  getTooltip(estadoElegido: string): string {
    const option = this.estadoOptions.find(opt => opt.value === estadoElegido);
    return option ? option.tooltip : '';
  }


  estadoOptions = [
    {
      value: 'Adeudado',
      label: 'Adeudado',
      tooltip: '',
      constraints: ['Adeudado']
    },
    {
      value: 'Gestion Extrajudicial',
      label: 'Gestión extrajudicial',
      tooltip: '',
      constraints: ['Adeudado', 'Gestion Extrajudicial']
    },
    {
      value: 'Gestion Judicial',
      label: 'Gestión judicial',
      tooltip: '',
      constraints: ['Adeudado', 'Gestion Extrajudicial', 'Gestion Judicial']
    },
    {
      value: 'Con Plan de Pago',
      label: 'Con Plan de pago',
      tooltip: '',
      constraints: ['Gestion Extrajudicial', 'Gestion Judicial', 'Con Plan de Pago']
    },
    {
      value: 'Cobro Extrajudicial',
      label: 'Cobro extrajudicial',
      tooltip: '',
      constraints: ['Gestion Extrajudicial', 'Con Plan de Pago']
    },
    {
      value: 'Cobro Judicial',
      label: 'Cobro judicial',
      tooltip: '',
      constraints: ['Gestion Judicial', 'Con Plan de Pago']
    },
    {
      value: 'Pagado con Anterioridad',
      label: 'Pagado con anterioridad',
      tooltip: '',
      constraints: ['Gestion Extrajudicial', 'Gestion Judicial', 'Con Plan de Pago']
    },
    {
      value: 'Incobrable',
      label: 'Incobrable',
      tooltip: '',
      constraints: ['Gestion Extrajudicial', 'Gestion Judicial']
    }
  ];

  registroConsola: any[];
  ocultas: string[];
  titulo: Titulo;
  //titulos: Titulo[];
  filtros: {}[];
  textoBusqueda: string;
  estadoSeleccionado: string;
  devolucionSolicitada: boolean;
  comprobantes: Comprobante[];
  deudores: Deudor[];
  tablaI: MatTableDataSource<Titulo>;
  val: string;
  prevMatSelectValue: string;
  estadoActual: number;
  prueba: number;
  fileName: string;
  archivos: any
  reRender: boolean = false;
  watermark: string;
}
