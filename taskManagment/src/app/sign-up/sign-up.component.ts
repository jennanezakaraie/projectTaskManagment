import { Component } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { UserService } from '../services/user/user.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  // standalone: true,
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',

})
export class SignUpComponent {

  userp:string="";
  constructor(private userService: UserService,private route: ActivatedRoute) { }

  ngOnInit(): void {
    // Extract email from the URL query parameters
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.formModel.email = params['email'];
        this.userp  = params['userp'];

      }
    });
  }
   public  formModel = {
      name:"",
      email:"",
      password:"",
 }
   formSubmitted: boolean = false;
  submit(form:any) {

    if (form.valid) {

      this.userService.createUser(this.formModel,this.userp).subscribe(
        response => {

          this.formSubmitted = true;
          console.log('SignUp successful', response);
          console.log(response.data._id);
         },

        error => {

          if (error.error && error.error.code === 11000) {
                  form.controls['email'].setErrors({ duplicateEmail: true });
          }
           console.error('SignUp failed', error);
 } )


} else {
      Object.values(form.controls).forEach((control: any) => {
        console.log(control);
        control.markAsTouched();
      });
 }
  }

}
