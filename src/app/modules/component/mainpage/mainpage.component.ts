import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { Observable } from 'rxjs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';


@Component({
  selector: 'app-mainpage',
  templateUrl: './mainpage.component.html',
  styleUrls: ['./mainpage.component.css']
})
export class MainpageComponent implements OnInit{
  @ViewChild('invoicePDF', { static: false }) invoicePDF!: ElementRef;
  pdfSrc: string | null = null;
  items = [{ description: '',size:'', squareFt: 0, quantity: 0, rate: 0, amount: 0,discountAmount:0,discountAmountPercentage:0, }];
  showDiscountColumns = false;
  hasDiscountData(): boolean {
    return this.items.some(item => item.discountAmount || item.discountAmountPercentage);
  }

  
  
  hasGSTData(): boolean {
    return this.invoiceData.cgst || this.invoiceData.sgst || this.invoiceData.igst;
  }
  
  toggleDiscountColumns() {
    this.showDiscountColumns = !this.showDiscountColumns;
  }

  invoiceData: any = {
    invoiceId:'',
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
  
  
  
  constructor(private service: AdminService,
    private toast :ToastrService,
    private router:Router
  ) {}
 
  ngOnInit(): void {
    const data = this.service.getInvoiceData();
    if (data) {
      this.invoiceData = { ...data };
      this.items = data.descriptions || [];
      this.isEditMode = true;
    }
  }
  

  isEditMode = false;

  addRow() {
    this.items.push({ description: '',size:'', squareFt: 0, quantity: 0, rate: 0, amount: 0,discountAmount:0,discountAmountPercentage:0 });
  }

 

  removeRow(index: number) {
    this.items.splice(index, 1);
    if (this.items.length === 0) {
      this.showDiscountColumns = false;
    }
  }


    calculateAmount(index: number) {
      const item = this.items[index];
    
      item.squareFt = this.convertToSquareFeet(item.size);
    
   
      let originalItemAmount = item.quantity * item.rate;
      let itemAmount = originalItemAmount;
    
if (item.discountAmount && item.discountAmount > 0) {
  let discountPercentage = (item.discountAmount / originalItemAmount) * 100;
  

  item.discountAmountPercentage = Math.round(discountPercentage * 100) / 100;
  
  itemAmount -= item.discountAmount;
}

    
      
     
      item.amount = parseFloat(itemAmount.toFixed(2));
    
    
      this.calculateTotal();
    }
    

    convertToSquareFeet(size?: string): number {  
      if (!size) return 0;
    
      const match = size.match(/\d+/);
      const value = match ? parseInt(match[0], 10) : 0;
    
      if (size.toUpperCase().includes('MM')) {
        return Math.round(value * 0.010764);
      } else if (size.toUpperCase().includes('INCH')) {
        return Math.round(value * 0.083333);
      }
      return value;
    }
    
    
    
    calculateTotal() {
      let totalAmount = this.items.reduce((sum, item) => sum + item.amount, 0);
    
     
      if (this.invoiceData.discountAmount && this.invoiceData.discountAmount > 0) {
        this.invoiceData.discountAmountPercentage = (this.invoiceData.discountAmount / totalAmount) * 100;
        totalAmount -= this.invoiceData.discountAmount;
      }
    
     
      let gstAmount = this.calculateGST(totalAmount);
      totalAmount += gstAmount;
    
     
  this.invoiceData.totalAmount = parseFloat(totalAmount.toFixed(2));
  this.invoiceData.pendingAmount = parseFloat(
    (this.invoiceData.totalAmount - (this.invoiceData.receivedAmount || 0)).toFixed(2)
  );
     
    
     
      this.invoiceData.totalAmountInWords = this.convertNumberToWords(this.invoiceData.totalAmount);
    }
    
    calculateGST(totalAmount: number): number {
      if (this.invoiceData.igst && this.invoiceData.igst > 0) {
        this.invoiceData.cgst = 0;
        this.invoiceData.sgst = 0;
        return (totalAmount * this.invoiceData.igst) / 100;
      } else {
        this.invoiceData.igst = 0;
        return (
          (totalAmount * (this.invoiceData.sgst || 0)) / 100 +
          (totalAmount * (this.invoiceData.cgst || 0)) / 100
        );
        
      }
      
    }

    previousReceivedAmount: number = 0; // Store the previous received amount

    updateReceivedAmount(receivedAmount: number) {
      receivedAmount = receivedAmount || 0; // Ensure it's a valid number
    
      // Calculate the difference in received amounts
      let difference = receivedAmount - this.previousReceivedAmount;
    
      // Update the pending amount
      // this.invoiceData.pendingAmount -= difference;
      this.invoiceData.pendingAmount = parseFloat(
        (this.invoiceData.pendingAmount - difference).toFixed(2)
      );
    
      // Update previous received amount for the next calculation
      this.previousReceivedAmount = receivedAmount;
    }
    
    

    convertNumberToWords(amount: number): string {
      const a = [
        "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
        "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
      ];
      
      const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
      
      const units = ["", "Thousand", "Lakh", "Crore"];
      
      if (amount === 0) return "Zero Rupees Only";
      
      let integerPart = Math.floor(amount);
      let decimalPart = Math.round((amount - integerPart) * 100);
      
      function numToWords(num: number): string {
        if (num === 0) return "";
        
        if (num < 20) return a[num];
        
        if (num < 100) return b[Math.floor(num / 10)] + (num % 10 !== 0 ? " " + a[num % 10] : "");
        
        if (num < 1000) return a[Math.floor(num / 100)] + " Hundred" + (num % 100 !== 0 ? " " + numToWords(num % 100) : "");
        
        let result = "", unitIndex = 0;
        while (num > 0) {
          let part = num % 1000; // Changed from num % 100 to num % 1000
          if (part !== 0) {
            result = numToWords(part) + " " + (units[unitIndex] || "") + " " + result;
          }
          num = Math.floor(num / 1000); // Corrected to divide by 1000
          unitIndex++;
        }
        
        return result.trim();
      }
    
      let words = numToWords(integerPart) + " Rupees";
      
      if (decimalPart > 0) {
        words += " and " + numToWords(decimalPart) + " Paise";
      }
      
      return words + " Only";
    }
    
    

  
  
  // Reset form function
resetForm() {
  this.invoiceData = {
    gstNumber:'',
    invoiceDate: '',
    dueDate: '',
    customerName: '',
    customerAddress: '',
    customerMobile: '',
    termsAndConditions: '',
    note: '',
    sgst:0,
    cgst:0,
    igst:0,
    totalAmount: 0,
    discountAmount:0,
    discountAmountPercentage:0,
    receivedAmount: 0,
    pendingAmount: 0,
    totalAmountInWords: '',
    descriptions: [{}]
  };
  
  this.items = [{ description: '',size:'', squareFt: 0, quantity: 0, rate: 0, amount: 0,discountAmount:0,discountAmountPercentage:0 }];
  this.isEditMode = false; // Reset mode to add new
}



submitInvoice() {

  if (this.invoiceData) {
    this.service.setInvoiceData(this.invoiceData);  // ✅ Set data first
    this.router.navigate(['/preview']);                    // ✅ Navigate after setting data
  } else {
    alert('Please fill out the form.');
  }

  this.invoiceData.descriptions = this.items;

  if (this.isEditMode) {
    // Update existing invoice
    this.service.updateInvoice(this.invoiceData.invoiceId, this.invoiceData).subscribe(response => {
      
      console.log(response);
      this.resetForm();
    }, error => {
      console.error('Error:', error);
      alert('Failed to update invoice');
    });
  } else {
    this.service.addinvoice(this.invoiceData).subscribe(response => {
      console.log("invoice data",this.invoiceData);
      
      this.toast.success('Invoice Added SuccesFully');
      console.log(response);
      this.resetForm();
    }, error => {
      console.error('Error:', error);
      alert('Failed to add invoice');
    });
  }
}

downloadPDF() {
  const originalElement = this.invoicePDF.nativeElement;

  // Clone the element for manipulation
  const clonedElement = originalElement.cloneNode(true) as HTMLElement;
  clonedElement.style.display = 'block';
  clonedElement.style.position = 'absolute';
  clonedElement.style.top = '0';
  clonedElement.style.left = '0';
  clonedElement.style.zIndex = '-9999';

  // Append to body to ensure proper rendering
  document.body.appendChild(clonedElement);

  setTimeout(() => {
    html2canvas(clonedElement, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4'); // A4: 210mm x 297mm

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio

      // Scale content to fit within A4 size
      const scaleFactor = Math.min(297 / imgHeight, 1); // Ensure it fits within A4 height
      const adjustedHeight = imgHeight * scaleFactor;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, adjustedHeight);
      pdf.save('invoice.pdf');

      // Remove cloned element
      document.body.removeChild(clonedElement);
    });
  }, 500);
}


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
