// app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostsComponent } from './posts/posts.component'; // Make sure this path is correct

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, PostsComponent], // Explicitly import PostsComponent
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'real-time-updates';
}