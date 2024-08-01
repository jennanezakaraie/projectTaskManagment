import { NotificationsComponentComponent } from './notifications-component/notifications-component.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignUpComponent } from './sign-up/sign-up.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { TasksComponent } from './Tasks/tasks/tasks.component';
import { AuthGuard } from './AuthGuard/auht-guards';
import { AdminComponent } from './admin/admin.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { InviteComponent } from './invite/invite.component';

const routes: Routes = [
  { path: 'signUp', component: SignUpComponent },
  {path:'signIn',component:SignInComponent},
  {path:'task/:userID/:adR',component:TasksComponent,canActivate: [AuthGuard]},
  {path:'admin',component:AdminComponent,canActivate: [AuthGuard]},
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  {path:'Notify',component:NotificationsComponentComponent},
  {path:'invite/:userID',component:InviteComponent},

  {
    path: '',
    redirectTo: 'signIn',
    pathMatch: 'full'
  }


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
