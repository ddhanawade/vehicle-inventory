import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { HeaderComponent } from './components/header/header.component';
import { ServicesComponent } from './components/services/services.component';
import { VehicleDetailsComponent } from './components/vehicle-details/vehicle-details.component';
import { AddVehicleComponent } from './components/add-vehicle/add-vehicle.component';

export const routes: Routes = [
    {
        path: '',
        component: DashboardComponent
    },
    {
        path: "home-page",
        component: DashboardComponent
    },
    {
        path: "login-page",
        component: LoginComponent
    },
    {
        path: "user-page",
        component: UserManagementComponent
    },
    {
        path: "header-page",
        component: HeaderComponent
    },
    {
        path: "service-page",
        component: ServicesComponent
    },
    {
        path: "vehicle-page/:modelName",
        component : VehicleDetailsComponent
    },
    {
        path: "add-vehicle",
        component: AddVehicleComponent
    }
];
