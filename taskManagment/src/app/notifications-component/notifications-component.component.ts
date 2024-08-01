import { Component } from '@angular/core';
import { PusherService } from '../services/pusher/pusher-service.service';

@Component({
  selector: 'app-notifications-component',
  templateUrl: './notifications-component.component.html',
  styleUrl: './notifications-component.component.css'
})
export class NotificationsComponentComponent {
  notifications: string[] = [];

  constructor(private pusherService: PusherService) { }

  ngOnInit(): void {
    this.pusherService.bind('new-notification', (data: any) => {
      this.notifications.push(data.message);
    });
  }
}
