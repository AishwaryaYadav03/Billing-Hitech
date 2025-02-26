import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './modules/component/home/home.component';
import { MainpageComponent } from './modules/component/mainpage/mainpage.component';
import { ReportComponent } from './modules/component/report/report.component';
import { FooterComponent } from './modules/component/footer/footer.component';
import { PdfPreviewComponent } from './modules/component/pdf-preview/pdf-preview.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,

    children: [
      { path: '', redirectTo: 'main', pathMatch: 'full' },
      { path: 'main', component: MainpageComponent },
      {path:'report',component:ReportComponent},
      {path:'footer',component:FooterComponent},
      {path:'preview',component:PdfPreviewComponent}
      
     
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
