import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Component } from '@angular/core';
import { UserService } from '../services/user/user.service';
import { TokenService } from '../services/token/token.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent {
  constructor(private userService: UserService, private tokenService: TokenService, private router: Router) { }

  public formModelSignIn = {
    email: "",
    password: ""
  };

  message:string ="";
  isLogin = false;
  successLogin = false;


  submit(form: any) {

    if (form.valid) {
      this.userService.login(this.formModelSignIn).subscribe(
        response => {
          if (response.status === 200 && response.body.token) {
            console.log('Login successful', response.body);
            this.tokenService.saveToken(response.body.token);
            this.userService.user = response.body.user;
            this.successLogin = true;
            if(response.body.user.role === "admin"){

              this.router.navigate(['admin']);
            }else{
              const adR = false
              this.router.navigate(['task', response.body.user._id,adR]);
            }

          } else {
            console.error('Login response does not contain a token', response);
          }
        },
        error => {
          if(error.status == 404){
            this.isLogin = true;
           this.message = error.error
          }

          if(error.status == 401){
            this.isLogin = true;
            this.message = error.error;
          }
          console.error('Login failed', error);
        }

      );
    } else {
      Object.values(form.controls).forEach((control: any) => {
        control.markAsTouched();
      });
    }
  }
}
