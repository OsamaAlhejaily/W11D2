// posts.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

// Import specific classes instead of the whole module
import { 
  HubConnection, 
  HubConnectionBuilder,
  HubConnectionState 
} from '@microsoft/signalr';

// Simple Post interface
interface Post {
  id: number;
  title: string;
  likeCount: number;
  isUpdated?: boolean;
}

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css']
})
export class PostsComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  hubConnection!: HubConnection;
  apiUrl = 'https://localhost:7186'; // Update with your actual port
  connectionState = 'Not connected'; // Add this property to match your template
  
  constructor(private http: HttpClient) {
    console.log('Posts component constructor called');
  }

  ngOnInit(): void {
    console.log('Posts component initialized');
    
    // Load initial data
    this.loadPosts();
    
    // Set up SignalR connection
    console.log('Setting up SignalR connection to:', `${this.apiUrl}/updateHub`);
    
    try {
      this.hubConnection = new HubConnectionBuilder()
        .withUrl(`${this.apiUrl}/updateHub`)
        .withAutomaticReconnect()
        .build();

      // Start connection
      this.startConnection();

      // Handle update messages
      this.hubConnection.on('ReceiveUpdate', (updatedPost: Post) => {
        console.log('Received update for post:', updatedPost);
        // Find and update the post
        const index = this.posts.findIndex(p => p.id === updatedPost.id);
        if (index !== -1) {
          // Mark as updated for visual indication
          this.posts[index] = { ...updatedPost, isUpdated: true };
          
          // Clear highlight after 2 seconds
          setTimeout(() => {
            this.posts[index].isUpdated = false;
          }, 2000);
        }
      });
    } catch (error) {
      console.error('Error setting up SignalR connection:', error);
      this.connectionState = 'Setup Error';
    }
  }

  private startConnection(): void {
    this.connectionState = 'Connecting...';
    
    this.hubConnection.start()
      .then(() => {
        console.log('Connection started successfully');
        this.connectionState = 'Connected';
        // Subscribe to updates
        this.hubConnection.invoke('SubscribeToUpdates', 'posts')
          .then(() => console.log('Subscribed to updates'))
          .catch(err => console.error('Error subscribing to updates:', err));
      })
      .catch(err => {
        console.error('Error starting connection:', err);
        this.connectionState = 'Connection Error';
        // Retry after 5 seconds
        setTimeout(() => this.startConnection(), 5000);
      });
  }

  ngOnDestroy(): void {
    console.log('Posts component destroyed');
    // Stop SignalR connection
    if (this.hubConnection) {
      this.hubConnection.stop()
        .then(() => console.log('Connection stopped'))
        .catch(err => console.error('Error stopping connection:', err));
    }
  }

  // Load posts from API
  loadPosts(): void {
    console.log('Loading posts from:', `${this.apiUrl}/api/posts`);
    
    this.http.get<Post[]>(`${this.apiUrl}/api/posts`)
      .subscribe({
        next: (data) => {
          console.log('Posts loaded successfully:', data);
          this.posts = data;
        },
        error: (error) => {
          console.error('Error loading posts:', error);
        }
      });
  }

  // Like a post
  likePost(id: number): void {
    console.log('Liking post:', id);
    
    this.http.post<Post>(`${this.apiUrl}/api/posts/${id}/like`, {})
      .subscribe({
        next: (response) => {
          console.log('Post liked successfully:', response);
        },
        error: (error) => {
          console.error('Error liking post:', error);
        }
      });
  }
}