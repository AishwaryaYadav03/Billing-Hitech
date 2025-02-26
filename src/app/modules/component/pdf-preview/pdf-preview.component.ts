import { Component, ElementRef, ViewChild } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-pdf-preview',
  templateUrl: './pdf-preview.component.html',
  styleUrl: './pdf-preview.component.css'
})
export class PdfPreviewComponent {
  @ViewChild('invoicePDF', { static: false }) invoicePDF!: ElementRef;
  pdfSrc: string | null = null;

  invoiceData: any = {
    invoiceId: '',
    gstNumber: '',
    invoiceDate: '',
    dueDate: '',
    customerName: '',
    customerAddress: '',
    customerMobile: '',
    termsAndConditions: '',
    note: '',
    totalAmount: 0.0,
    receivedAmount: 0.0,
    pendingAmount: 0.0,
    totalAmountInWords: '',
    sgst: 0.0,
    cgst: 0.0,
    igst: 0.0,
    discountAmount: 0.0,
    discountAmountPercentage: 0.0,
    descriptions: [
      {
        descriptionId: 0,
        description: '',
        size: '',
        squareFt: 0,
        quantity: 0,
        rate: 0.0,
        discountAmount: 0.0,
        discountAmountPercentage: 0.0,
        amount: 0.0,

      }
    ]
  };
  constructor(private invoiceService: AdminService, private router: Router) { }



  ngOnInit(): void {
    const data = this.invoiceService.getInvoiceData();
    if (data) {
      this.invoiceData = { ...data };
      this.items = data.descriptions || [];
    }
    this.invoiceData = this.invoiceService.getInvoiceData();

    if (!this.invoiceData) {
      console.error('No invoice data found.');
      return;
    }

    setTimeout(() => this.generateAndViewPDF(), 0);
  }



  hasDiscountDataForItems(): boolean {
    return this.items?.some(item => item.discountAmount || item.discountAmountPercentage);
  }


  hasDiscountDataForInvoice(): boolean {
    return !!(this.invoiceData?.discountAmount || this.invoiceData?.discountAmountPercentage);
  }


  downloadPDF() {
    const originalElement = this.invoicePDF.nativeElement;


    const clonedElement = originalElement.cloneNode(true) as HTMLElement;
    clonedElement.style.display = 'block';
    clonedElement.style.position = 'absolute';
    clonedElement.style.top = '0';
    clonedElement.style.left = '0';
    clonedElement.style.zIndex = '-9999';


    document.body.appendChild(clonedElement);

    setTimeout(() => {
      html2canvas(clonedElement, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');

        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const scaleFactor = Math.min(297 / imgHeight, 1);
        const adjustedHeight = imgHeight * scaleFactor;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, adjustedHeight);
        pdf.save('invoice.pdf');


        document.body.removeChild(clonedElement);
      });
    }, 500);
  }


  async sharePDF() {
    const element = this.invoicePDF.nativeElement;


    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    const pdfBlob = pdf.output('blob');


    const fileName = `invoice_${new Date().getTime()}.pdf`;
    const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

    // Save the file using FileSaver
    // saveAs(file);


    setTimeout(() => {
      const fileURL = window.URL.createObjectURL(pdfBlob);


      window.location.href = `whatsapp://send?text=Here is your invoice.&attachment=${fileURL}`;
    }, 1000);
  }

  hasGSTData(): boolean {
    return !!(this.invoiceData?.cgst || this.invoiceData?.sgst || this.invoiceData?.igst);
  }

  items = [{ description: '', size: '', squareFt: 0, quantity: 0, rate: 0, amount: 0, discountAmount: 0, discountAmountPercentage: 0, }];

  async generateAndViewPDF(): Promise<void> {
    if (!this.invoicePDF) {
      console.error('Invoice element not found.');
      return;
    }

    try {
      const element = this.invoicePDF.nativeElement;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      const pdfBlob = pdf.output('blob');

      if (this.pdfSrc) {
        URL.revokeObjectURL(this.pdfSrc); // Prevent memory leaks
      }

      this.pdfSrc = URL.createObjectURL(pdfBlob); // Display in ngx-extended-pdf-viewer
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  }




}