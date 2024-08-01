import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UpdateUserComponent } from '../update-user/update-user.component';
import { TokenService } from '../services/token/token.service';
import { Router } from '@angular/router';
import { TaskService } from '../services/task/task.service';
import { PusherService } from '../services/pusher/pusher-service.service';
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'] // Fixed typo here
})
export class AdminComponent implements OnInit {
  taskData: any[] = [];
  userData: any[] = [];
  searchUserForm: FormGroup;
  pageSize: number = 10;
  currentPage: number = 1;
  totalPages: number = 0;
  totalPagesArray: number[] = [];
  isSearchMode: boolean = false;
  sortField: string = 'title';
  sortOrder: string = 'asc';
   adR = false;
   notifications: string[] = [];


  constructor(private userService: UserService, private fb: FormBuilder, private dialog: MatDialog,
    private taskService: TaskService, private router: Router,
    private tokenService: TokenService,
    private  pusherService:PusherService
  ) {
    this.searchUserForm = this.fb.group({
      search: ['', Validators.required],
    });
  }

  ngOnInit(): void {

    this.loadUsers();
      this.pusherService.bind('new-notification', (data: any) => {
      this.notifications.push(data.message);

    });

  }

  onSubmit() {
    if (this.searchUserForm.valid) {
      const searchValue = this.searchUserForm.value.search;
      this.userService.getOneUser(searchValue).subscribe(
        (response: any) => {
          if (response.data.length > 0) {
            console.log("User found successfully", response.data);
            this.userData = response.data;
            this.isSearchMode = true;
          } else {
            console.log("User not found");
          }

        },
        (error) => {
          console.log('User not found');

        }
      );
    }
  }

  resetSearchForm(): void {
    this.searchUserForm.reset();
  }

  ListUsers(): void {
    this.loadUsers();
    this.resetSearchForm(); // Reset the search form when loading all users
  }

  loadUsers(): void {
    this.userService.getAllUsers(this.currentPage, this.pageSize).subscribe(
      (response: any) => {
        this.userData = response.data;
        console.log(this.userData);
        this.totalPages = Math.ceil(response.totalUser / this.pageSize);
        this.totalPagesArray = Array.from({ length: this.totalPages }, (_, index) => index + 1);
        this.isSearchMode = false; // Ensure isSearchMode is false when loading all users
      },
      (error) => {
        console.error('Error fetching Users:', error);
      }
    );
  }

  incrementPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  decrementPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  deleteUser(userID: string): void {

    this.userService.deleteUser(userID).subscribe(
      (response: any) => {
        console.log('User deleted successfully', response);
        this.loadUsers();
      },
      (error) => {
        console.error('Failed to delete user', error);
      }
    );
  }


  openUpdateDialog(user: any): void {
    const dialogRef = this.dialog.open(UpdateUserComponent, {
      width: '300px',
      data: { title: user.name, email: user.email }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.updateUser(user._id, result).subscribe(
          (response: any) => {
            console.log('User updated successfully', response);
            this.loadUsers();
          },
          (error: any) => {
            console.error('Failed to update user', error);
          }
        );
      }
    });
  }

  displayTasksUser(userID: string) {
    console.log('userIddisplay', userID);
    if (userID) {
       this.adR= true
      this.router.navigate(['task', userID,this.adR]);
    }
  }

  logOut() {
    this.tokenService.removeToken();
    this.router.navigate(['signIn']);
      }


}
