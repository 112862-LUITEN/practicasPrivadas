import { DatePipe, LowerCasePipe } from '@angular/common';
import { Component, OnInit, EventEmitter, Output, Input, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DateAdapter, MatDateFormats, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
import { MatDatepickerToggle, MatDateRangeInput } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { ModalDevolucionesComponent } from '@app/_pj-deudas/modales/modal-devoluciones/modal-devoluciones.component';

export class CustomDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      const day = date.getUTCDate();
      const month = date.getUTCMonth() + 1;
      const year = date.getUTCFullYear();

      // Return the formatted date string in DD/MM/YYYY format
      return `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year}`;
    } else {
      return date.toDateString();
    }
  }
}

@Component({
  selector: 'app-pj-busqueda',
  templateUrl: './pj-busqueda.component.html',
  styleUrls: ['./pj-busqueda.component.css'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
    { provide: DateAdapter, useClass: CustomDateAdapter },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: { month: 'short', year: 'numeric', day: 'numeric' },
        },
        display: {
          dateInput: 'input',
          monthYearLabel: { year: 'numeric', month: 'short' },
          dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
          monthYearA11yLabel: { year: 'numeric', month: 'long' },
        },
      },
    },
  ]
})
export class PjBusquedaComponent implements OnInit {
  @Input()data : {}[];
  @Input()filtros: {campo:string,valor:any}[];
  // Los campos que se pasen como filtros tienen que denominarse idénticos a las propiedades del objeto pasado en Data
  constructor(public dialog : MatDialog) {
    this.datosFiltrados = [];
    this.filtros = [];
   }

  ngOnInit(): void {
    console.log('data pre filtro:',this.data);
    console.log('data en filtros:',this.filtros);
  }

  openDialog():void{
    let dialogRef = this.dialog.open(ModalDevolucionesComponent,{
      data:{
        Observacion:"Esto fue escrito"
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Di�logo cerrado');
      console.log(result);
      
    })
  }
  
  Filtrar(caracterIngresado:string) {
    this.mostrarCampos = 'true';
    // console.log('Se llamó a filtrar');
    // console.log('Los filtros son: ', this.filtros);
  
    
    const startDate = this.datePickerStart;
    const endDate = this.datePickerEnd;
    
    if (startDate && endDate && this.selectedDateType && this.selectedDateType !== "N/A") {
      const datePropertyName = this.selectedDateType.toLowerCase().replace(/ /g, '_');
      const startDateObj = new Date(startDate); 
      const endDateObj = new Date(endDate); 

      if (!isNaN(startDateObj.getTime()) && !isNaN(endDateObj.getTime())) {
        const formattedStartDate = startDateObj.toISOString();
        const formattedEndDate = endDateObj.toISOString();
        const startDateMillis = startDateObj.getTime(); 
        const endDateMillis = endDateObj.getTime(); 
        const pruebaMillis = new Date('04/12/2023').getTime(); 

      if (pruebaMillis >= startDateMillis && pruebaMillis <= endDateMillis) {
        //alert('Si');
      }
      this.mostrarCampos += ` && (new Date(dato.${datePropertyName}.split('/').reverse().join('/')).getTime() >= new Date('${formattedStartDate}').getTime() && new Date(dato.${datePropertyName}.split('/').reverse().join('/')).getTime() <= new Date('${formattedEndDate}').getTime())`;

      

      } else {
        alert('Invalid date format');
      }
    }
    if(this.mostrarCampos){
      this.filtros.forEach((element) => {
        if (!this.vacio(element.valor)) {
          this.mostrarCampos = this.mostrarCampos + ` && (dato.${element.campo}.toLowerCase().includes('${element.valor.toLowerCase()}'))`;
          console.log('element.campo: ', element.campo);
          console.log('element.valor: ', element.valor);
        }
      }
      );
    
      this.data.forEach((dato) => {
        console.log('Se evaluará: ', this.mostrarCampos);
        dato['visible'] = eval(this.mostrarCampos);
      });

    }
  }
  

  swapDayMonth(dateString: string): string {
    const parts = dateString.split('/'); // Split the date string by '/'
    const swappedDate = parts[1] + '/' + parts[0] + '/' + parts[2]; // Reassemble the date string with swapped day and month
    return swappedDate;
  }



  vacio(val:any,campo?:string){
    //console.log('Se llamó a la función vacio para el título: ',campo,' con el valor: ',val);
    return (
      val === '' ||
      val === null ||
      val === undefined ||
      (Array.isArray(val) && val.length === 0)
    );
  }

  onStartDateChange(){

  }

  onEndDateChange(){

  }


  datosFiltrados : {}[];
  textoIngresado : string = "";
  mostrarCampos: string = "true";
  //filtros: {campo:string,valor:any}[]
  dateRangeForm: FormGroup;
  selectedDateType: string;
  datePipe:DatePipe = new DatePipe('en-US');
  datePickerStart:Date;
  datePickerEnd:Date;
}








