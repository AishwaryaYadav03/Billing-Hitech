import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import BASE_URL from '../../auth/services/storage/helper';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private invoiceData: any = null;

  constructor(private http: HttpClient) { }

  public addinvoice(data: any): Observable<any> {
    console.log(data);
    
    return this.http.post(BASE_URL + '/invoice/create', data);
  }

  public getinvoice(): Observable<any> {

    
    return this.http.get(BASE_URL + '/invoice/all');
  }

  public Deleteinvoice(id: number): Observable<any> {
    return this.http.delete(`${BASE_URL}/invoice/delete/${id}`);
    }

   public updateInvoice(id: number, invoice: any): Observable<any> {
      return this.http.put(`${BASE_URL}/invoice/update/${id}`, invoice);
    }
    

    
  setInvoiceData(data: any) {
    this.invoiceData = data;
  }

  getInvoiceData() {
    return this.invoiceData;
  }

  clearInvoiceData() {
    this.invoiceData = null;
  }

  // private invoiceDataSubject = new BehaviorSubject<any>(null);
  // invoiceData$ = this.invoiceDataSubject.asObservable();

  // setInvoiceData(data: any) {
  //   this.invoiceDataSubject.next(data);
  // }

  // getInvoiceData() {
  //   return this.invoiceDataSubject.getValue();
  // }
}
