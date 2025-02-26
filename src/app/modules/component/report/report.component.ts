import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

export interface Invoice {
  srNo: number;
  invoiceDate: string;
  dueDate: string;
  customerName: string;
  customerAddress: string;
  customerMobile: string;
  termsAndConditions: string;
  note: string;
  taxableAmount: number;
  totalAmount: number;
  receivedAmount: number;
  pendingAmount: number;
  totalAmountInWords: string;
  descriptions: Description[];
}

export interface Description {
  descriptionId: number;
  description: string;
  squareFt: number;
  quantity: number;
  rate: number;
  amount: number;
}


@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrl: './report.component.css',
})
export class ReportComponent implements OnInit, AfterViewInit {
 
  displayedColumns: string[] = [
    'srNo', 
    'gstNumber',
    'invoiceDate', 
    'dueDate', 
    'customerName', 
    'customerAddress', 
    'customerMobile', 
    'totalAmount', 
    'receivedAmount', 
    'pendingAmount', 
    // 'totalAmountInWords', 
    'cgst',
    'sgst',
    'igst',
    'discountAmount',
    'discountAmountPercentage',
    // 'termsAndConditions',
    // 'note',
    'actions' // For edit and delete
  ];
  
  descriptionColumns: string[] = [
    'descriptionId', 
    'description', 
    'size',
    'squareFt', 
    'quantity', 
    'rate', 
    'amount'
  ];
  
  dataSource = new MatTableDataSource<Invoice>([]);
  

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  

  constructor(private service: AdminService, private router: Router,private toast:ToastrService) {}

onEdit(invoice: any) {
  this.service.setInvoiceData(invoice); 
  this.router.navigate(['/main']); 
}
  ngOnInit(): void {
    this.getInvoice();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getInvoice() {
    this.service.getinvoice().subscribe((data: Invoice[]) => {
      console.log("invoice get",data);
      
      this.dataSource.data = data; // Assign the entire invoice data to the table
    });
  }

  
  

  onDelete(id: number) {
    console.log(id);
    
    this.service.Deleteinvoice(id).subscribe(
      (response) => {
        this.ngOnInit()
       
        this.toast.warning('Invoice Deleted successfully!');
       
      },
      (error) => {
        console.error('Error deleting material:', error);
        
      }
    );
  }
}
