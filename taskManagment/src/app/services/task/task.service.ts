import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private baseUrl = 'http://localhost:3000/task';

  constructor(private http: HttpClient) { }

  addTask(task: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/addTask`, task);
  }

  // getAllTasks(userId: string, sortField: string, sortOrder: string, pageSize: number, currentPage: number): Observable<any> {
  //   let params = new HttpParams()
  //     .set('sortField', sortField)
  //     .set('sortOrder', sortOrder)
  //     .set('pageSize', pageSize.toString())
  //     .set('currentPage', currentPage.toString());

  //   return this.http.get(`${this.baseUrl}/allTasks/${userId}`, { params });
  // }

  getMyTasks(userId: string, sortField: string, sortOrder: string, pageSize: number, currentPage: number): Observable<any> {
    let params = new HttpParams()
      .set('sortField', sortField)
      .set('sortOrder', sortOrder)
      .set('pageSize', pageSize.toString())
      .set('currentPage', currentPage.toString());

    return this.http.get(`${this.baseUrl}/myTasks/${userId}`, { params });
  }

  getInviterTasks(userId: string, sortField: string, sortOrder: string, pageSize: number, currentPage: number): Observable<any> {
    let params = new HttpParams()
      .set('sortField', sortField)
      .set('sortOrder', sortOrder)
      .set('pageSize', pageSize.toString())
      .set('currentPage', currentPage.toString());

    return this.http.get(`${this.baseUrl}/inviterTasks/${userId}`, { params });
  }

  updateTask(taskID: string, task: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/updateTask/${taskID}`, task);
  }



  deleteTask(taskID: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/deletTask/${taskID}`);
  }

  oneTask(taskID: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/oneTask/${taskID}`);
  }

  downloadFile(taskID: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/download/${taskID}`, { responseType: 'blob' });
  }
  deleteFile(taskID:string){
    return this.http.put(`${this.baseUrl}/deleteFile/${taskID}`,null)
  }

  inviteUser(email: string,userp:string): Observable<any> {
    return this.http.post(`${this.baseUrl}/inviteUser/${userp}`, {email});
  }


}
