import { PusherService } from './../../services/pusher/pusher-service.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../services/user/user.service';
import { TaskService } from '../../services/task/task.service';
import { FilterDialogComponent } from '../../filter-dialog/filter-dialog.component';
import { TokenService } from '../../services/token/token.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {
  activeTab: 'myTasks' | 'inviterTasks' = 'myTasks';
  taskData: any[] = [];
  taskDataInviter: any[] = [];
  addTaskForm: FormGroup;
  editMode: boolean = false;
  selectedTaskId: string | null = null;
  sortField: string = 'title';
  sortOrder: string = 'asc';
  pageSize: number = 3;
  currentPage: number = 1;
  totalPages: number = 0;
  totalPagesArray: number[] = [];
  selectedFile: File | null = null;
  currentFileName: string | null = null;
  userID: string | null = '';
  adR: boolean = false;
  notifications: string[] = [];

  // Add separate pagination states
  inviterPageSize: number = 3;
  inviterCurrentPage: number = 1;
  inviterTotalPages: number = 0;
  inviterTotalPagesArray: number[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private taskService: TaskService,
    private dialog: MatDialog,
    private tokenService: TokenService,
    private router: Router,
    private route: ActivatedRoute,
    private pusherService: PusherService
  ) {
    this.addTaskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      dueDate: ['', Validators.required]
    });
  }

  setActiveTab(tab: 'myTasks' | 'inviterTasks') {
    this.activeTab = tab;
    // You may need to load tasks or refresh data when tab is changed
    if (tab === 'myTasks') {
      this.loadTasks();
    } else {
      this.InviterTasks();
    }
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.userID = params.get('userID');
      this.adR = (params.get('adR')?.toLowerCase() === 'true');
      console.log(params.get('adR'));
      console.log(Boolean(params.get('adR')));
      this.loadTasks();
      this.pusherService.bind('new-notification', (data: any) => {
        this.notifications.push(data.message);
      });
    });
  }

  goToInvite() {
    this.router.navigate(['invite', this.userService.user._id]);
  }

  back() {
    this.router.navigate(['admin']);
  }

  InviterTasks(): void {
    if (this.userID) {
      this.taskService.getInviterTasks(this.userID, this.sortField, this.sortOrder, this.inviterPageSize, this.inviterCurrentPage).subscribe(
        (response: any) => {
          this.taskDataInviter = response.data;
          this.inviterTotalPages = Math.ceil(response.totalTasks / this.inviterPageSize);
          this.inviterTotalPagesArray = Array.from({ length: this.inviterTotalPages }, (_, index) => index + 1);
        },
        (error) => {
          console.error('Error fetching inviter tasks:', error);
        }
      );
    } else {
      this.taskService.getInviterTasks(this.userService.user._id, this.sortField, this.sortOrder, this.inviterPageSize, this.inviterCurrentPage).subscribe(
        (response: any) => {
          this.taskDataInviter = response.data;
          this.inviterTotalPages = Math.ceil(response.totalTasks / this.inviterPageSize);
          this.inviterTotalPagesArray = Array.from({ length: this.inviterTotalPages }, (_, index) => index + 1);
        },
        (error) => {
          console.error('Error fetching inviter tasks:', error);
        }
      );
    }
  }

  loadTasks(): void {
    if (this.userID) {
      this.taskService.getMyTasks(this.userID, this.sortField, this.sortOrder, this.pageSize, this.currentPage).subscribe(
        (response: any) => {
          this.taskData = response.data;
          this.totalPages = Math.ceil(response.totalTasks / this.pageSize);
          this.totalPagesArray = Array.from({ length: this.totalPages }, (_, index) => index + 1);
        },
        (error) => {
          console.error('Error fetching my tasks:', error);
        }
      );
    } else {
      this.taskService.getMyTasks(this.userService.user._id, this.sortField, this.sortOrder, this.pageSize, this.currentPage).subscribe(
        (response: any) => {
          this.taskData = response.data;
          this.totalPages = Math.ceil(response.totalTasks / this.pageSize);
          this.totalPagesArray = Array.from({ length: this.totalPages }, (_, index) => index + 1);
        },
        (error) => {
          console.error('Error fetching my tasks:', error);
        }
      );
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.currentFileName = input.files[0].name;
    }
  }

  onSubmit(): void {
    if (this.addTaskForm.valid && !this.editMode) {
      const formData = new FormData();
      formData.append('title', this.addTaskForm.get('title')?.value);
      formData.append('description', this.addTaskForm.get('description')?.value);
      formData.append('dueDate', this.addTaskForm.get('dueDate')?.value);
      if (this.userID) {
        formData.append('user', this.userID);
      } else {
        formData.append('user', this.userService.user._id);
      }

      if (this.selectedFile) {
        formData.append('file', this.selectedFile);
      }

      this.taskService.addTask(formData).subscribe(
        (response: any) => {
          console.log('Task added successfully', response);
          this.loadTasks();
          this.addTaskForm.reset();
          this.selectedFile = null;
          this.currentFileName = null;
        },
        (error) => {
          console.error('Failed to add task', error);
        }
      );
    } else {
      console.error('Form is invalid or in edit mode');
    }
  }

  onUpdate(): void {
    if (this.editMode && this.selectedTaskId) {
      const formData = new FormData();
      formData.append('title', this.addTaskForm.get('title')?.value);
      formData.append('description', this.addTaskForm.get('description')?.value);
      formData.append('dueDate', this.addTaskForm.get('dueDate')?.value);
      if (this.selectedFile) {
        formData.append('file', this.selectedFile);
      }

      this.taskService.updateTask(this.selectedTaskId, formData).subscribe(
        (response: any) => {
          console.log('Task updated successfully', response);
          this.loadTasks();
          this.resetForm();
          alert('Task updated successfully');
        },
        (error) => {
          console.error('Failed to update task', error);
        }
      );
    } else {
      console.error('Form is invalid or not in edit mode');
    }
  }

  deleteTask(taskID: string): void {
    this.taskService.deleteTask(taskID).subscribe(
      (response: any) => {
        console.log('Task deleted successfully', response);
        this.loadTasks();
      },
      (error) => {
        console.error('Failed to delete task', error);
      }
    );
  }

  loadTaskForUpdate(taskID: string): void {
    this.taskService.oneTask(taskID).subscribe(
      (response: any) => {
        this.editMode = true;
        this.selectedTaskId = taskID;
        this.addTaskForm.patchValue({
          title: response.data.title,
          description: response.data.description,
          dueDate: this.formatDate(response.data.dueDate)
        });
        if (response.data.file) {
          this.currentFileName = response.data.file.originalname;
        } else {
          this.currentFileName = null;
        }
      },
      (error) => {
        console.error('Failed to fetch task for update', error);
      }
    );
  }

  toggleComplete(task: any): void {
    const originalCompleted = task.completed;
    task.completed = !task.completed;

    const formData = new FormData();
    formData.append('title', task.title);
    formData.append('description', task.description);
    formData.append('dueDate', task.dueDate);
    formData.append('completed', task.completed.toString());
    formData.append('user', this.userService.user._id);

    if (task.file) {
      formData.append('file', task.file);
    }

    this.taskService.updateTask(task._id, formData).subscribe(
      (response: any) => {
        console.log('Task completion status updated successfully', response);
      },
      (error) => {
        console.error('Failed to update task completion status', error);
        task.completed = originalCompleted;
      }
    );
  }

  downloadFile(taskID: string, originalname: string): void {
    this.taskService.downloadFile(taskID).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = originalname;
      a.click();
      window.URL.revokeObjectURL(url);
    }, error => {
      console.error('Download error', error);
    });
  }

  logOut(): void {
    this.tokenService.removeToken();
    this.router.navigate(['signIn']);
  }

  private resetForm(): void {
    this.editMode = false;
    this.selectedTaskId = null;
    this.addTaskForm.reset();
    this.selectedFile = null;
    this.currentFileName = null;
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  openFilterDialog(): void {
    const dialogRef = this.dialog.open(FilterDialogComponent, {
      width: '250px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.title) {
          this.changeSorting('title');
        } else if (result.description) {
          this.changeSorting('description');
        } else if (result.dueDate) {
          this.changeSorting('dueDate');
        }
      }
    });
  }

  changeSorting(field: string): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'asc';
    }
    this.loadTasks();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadTasks();
    }
  }

  incrementPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadTasks();
    }
  }

  decrementPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadTasks();
    }
  }

  // Inviter Pagination Methods
  inviterChangePage(page: number): void {
    if (page >= 1 && page <= this.inviterTotalPages) {
      this.inviterCurrentPage = page;
      this.InviterTasks();
    }
  }

  inviterIncrementPage(): void {
    if (this.inviterCurrentPage < this.inviterTotalPages) {
      this.inviterCurrentPage++;
      this.InviterTasks();
    }
  }

  inviterDecrementPage(): void {
    if (this.inviterCurrentPage > 1) {
      this.inviterCurrentPage--;
      this.InviterTasks();
    }
  }

  onDeleteFile(taskID: string) {
    this.taskService.deleteFile(taskID).subscribe(
      response => {
        console.log('File deleted successfully', response);
        this.loadTasks();
      },
      error => {
        console.error('Error deleting file', error);
      }
    );
  }
}
