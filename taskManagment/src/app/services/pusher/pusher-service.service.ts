import { Injectable } from '@angular/core';
import Pusher from 'pusher-js';

@Injectable({
  providedIn: 'root'
})
export class PusherService {

  private pusher: Pusher;
  private channel: any;

  constructor() {
    this.pusher = new Pusher('8e7f9942d9f91fae4f0e', {
      cluster: 'eu'
    });

    this.channel = this.pusher.subscribe('notifications');
    console.log(this.channel);
  }

  public bind(eventName: string, callback: (data: any) => void) {
    this.channel.bind(eventName, callback);
  }
}
