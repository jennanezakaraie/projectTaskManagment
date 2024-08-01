import { TaskService } from './../services/task/task.service';
import { Component } from '@angular/core';
import { UserService } from '../services/user/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.css']
})
export class InviteComponent {
  inviteForm: FormGroup;
  formSubmitted: boolean = false;
  userID: string | null = '';
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.userID = params.get('userID');

    });

 }

  constructor(
    private taskService:TaskService,
    private userService: UserService,
    private fb: FormBuilder,
    private route:ActivatedRoute
  ) {
    this.inviteForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  submit() {
    console.log()
    if (this.inviteForm.valid) {
      this.taskService.inviteUser(this.inviteForm.value.email,this.userID!).subscribe(
        response => {
          this.formSubmitted = true;
          console.log('Invitation sent successfully', response);
        },
        error => {
          console.error('Invitation failed', error);
        }
      );
    } else {
      Object.values(this.inviteForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }


}
