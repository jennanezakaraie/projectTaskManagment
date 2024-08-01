import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = "http://localhost:3000/user";
  private static _user: any;

  constructor(private http: HttpClient) { }

  login(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, data, { observe: 'response' });
  }

  createUser(user: any,userp:string): Observable<any> {
    return this.http.post(`${this.baseUrl}/create/${userp}`, user);
  }

  set user(user: any) {
    UserService._user = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  get user(): any {
    if (!UserService._user) {
      const storedUser = localStorage.getItem('currentUser');
      UserService._user = storedUser ? JSON.parse(storedUser) : null;
    }
    return UserService._user;
  }

  clearUser(): void {
    UserService._user = null;
    localStorage.removeItem('currentUser');
  }

  getOneUser(name: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${name}`);
  }

  getAllUsers(currentPage: number, pageSize: number): Observable<any> {
    const params = new HttpParams()
      .set('currentPage', currentPage.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get(this.baseUrl, { params });
  }

  updateUser(userID: string, user: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${userID}`, user);
  }

  deleteUser(userID: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${userID}`);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/forgotPassword`, { email });
  }
  resetPassword(token: string, email: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/resetPassword?token=${token}&email=${email}`, { newPassword });
  }

}
