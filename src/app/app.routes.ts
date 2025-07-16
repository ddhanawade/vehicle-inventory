import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { HeaderComponent } from './components/header/header.component';
import { ServicesComponent } from './components/services/services.component';
import { VehicleDetailsComponent } from './components/vehicle-details/vehicle-details.component';
import { AddVehicleComponent } from './components/add-vehicle/add-vehicle.component';
import { AuthGuard } from './services/AuthGuard';
import { VehicleReportComponent } from './components/vehicle-report/vehicle-report.component';
import { PreventBackGuard } from './services/PreventBackGuard';
import { FileuploadComponent } from './components/fileupload/fileupload.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { PurchasereportComponent } from './components/purchasereport/purchasereport.component';
import { TestVehicleReportComponent } from './components/test-vehicle-report/test-vehicle-report.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: LoginComponent
    },
    {
        path: "home-page",
        component: DashboardComponent,
        canActivate: [AuthGuard]
    },
    {
        path: "login-page",
        component: LoginComponent
    },
    {
        path: "user-page",
        component: UserManagementComponent,
        canActivate: [AuthGuard]
    },
    {
        path: "header-page",
        component: HeaderComponent
    },
    {
        path: "service-page",
        component: ServicesComponent,
        canActivate: [AuthGuard]
    },
    {
        path: "vehicle-page/:modelName",
        component : VehicleDetailsComponent,
        canActivate: [AuthGuard]
    },
    {
        path: "add-vehicle",
        component: AddVehicleComponent,
        canActivate: [AuthGuard]
    },
    {
        path: "monthly-report",
        component: VehicleReportComponent,
        canActivate: [AuthGuard]
    },
    {
        path: "bulk-upload",
        component: FileuploadComponent,
        canActivate: [AuthGuard]
    },
    {
        path: "reset-password",
        component: ResetPasswordComponent
    },
    {
        path: "purchase-report",
        component: PurchasereportComponent
    },
    {
        path: 'test-vehicle-report',
        component: TestVehicleReportComponent,
        canActivate: [AuthGuard]
    },
    {
        path: "**",
        component: LoginComponent
    }
];
