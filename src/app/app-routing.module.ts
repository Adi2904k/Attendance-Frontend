import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AttendanceComponent } from './attendance/attendance.component';
import { MainpageComponent } from './mainpage/mainpage.component';
import { RegisterComponent } from './register/register.component';
import { RegisterStudentComponent } from './register-student/register-student.component';
import { LoginStudentComponent } from './login-student/login-student.component';
import { LoginComponent } from './login/login.component';
import { TeacherDashboardComponent } from './teacher-dashboard/teacher-dashboard.component';
import { StudentDashboardComponent } from './student-dashboard/student-dashboard.component';

export const routes: Routes = [
    { path: '', redirectTo: 'main', pathMatch: "full"},
    { path: 'attendance', component: AttendanceComponent},
    {path:'main' , component:MainpageComponent},
    {path:'register', component:RegisterComponent},
    {path:'register-student', component:RegisterStudentComponent},
    {path:'login', component:LoginComponent},
    {path:'login-student', component:LoginStudentComponent},
    {path:'teacher-dashboard', component:TeacherDashboardComponent},
    {path:'student-dashboard', component:StudentDashboardComponent},



];


@NgModule({

    imports: [RouterModule.forRoot(routes),],

    exports: [RouterModule]

})

export class AppRoutingModule { }