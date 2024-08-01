import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TasksComponent } from './Tasks/tasks/tasks.component';
import { AuthInterceptorService } from './services/auth/auth-interceptor.service';
import { TokenService } from './services/token/token.service';
import { AuthGuard } from './AuthGuard/auht-guards';
import { ReactiveFormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { FilterDialogComponent } from './filter-dialog/filter-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { AdminComponent } from './admin/admin.component';
import { UpdateUserComponent } from './update-user/update-user.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { NotificationsComponentComponent } from './notifications-component/notifications-component.component';
import { InviteComponent } from './invite/invite.component';

@NgModule({
  declarations: [
    AppComponent,
    SignInComponent,
    SignUpComponent,
    TasksComponent,
    FilterDialogComponent,
    AdminComponent,
    UpdateUserComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    NotificationsComponentComponent,
    InviteComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    MatDialogModule,
    MatCheckboxModule,
    MatButtonModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,


],
  providers: [
    {provide:HTTP_INTERCEPTORS,useClass:AuthInterceptorService,multi:true},
    TokenService,
    AuthGuard,
    provideAnimationsAsync(),
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }
