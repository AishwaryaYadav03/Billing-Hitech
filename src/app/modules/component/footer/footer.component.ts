import { Component, ElementRef, ViewChild } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  // @ViewChild('invoicePDF') invoicePDF!: ElementRef;
  @ViewChild('invoicePDF', { static: false }) invoicePDF!: ElementRef;

 

  generatePDF() {
    const element = this.invoicePDF.nativeElement;

    html2canvas(element, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`invoice_${this.invoiceData.invoiceId}.pdf`);
    });
  }
  invoiceData: any = {
    invoiceId:'',
    invoiceDate: '',
    dueDate: '',
    customerName: '',
    customerAddress: '',
    customerMobile: '',
    termsAndConditions: '',
    note: '',
    taxableAmount: 0,
    totalAmount: 0,
    receivedAmount: 0,
    pendingAmount: 0,
    totalAmountInWords: '',
    descriptions: []
  };

  items = [
    { description: '', squareFt: '', quantity: 0, rate: 0, amount: 0 }
  ];
  getInvoiceElement(): ElementRef {
    return this.invoicePDF;
  }

}
