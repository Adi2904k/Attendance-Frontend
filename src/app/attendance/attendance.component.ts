import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.scss'
})
export class AttendanceComponent {
  qrData: string = ''; 
  presentStudents: any[] = [];
  constructor(private http: HttpClient ,private active: ActivatedRoute, private router:Router) {
  }
  ngOnInit(): void {
    this.qrData = 'https://docs.google.com/forms/d/e/1FAIpQLSeBxfPUsLYaqa2vj2rlNd9ZS2y6y9HJrm1_eWa8hgtLqwIDkQ/viewform?usp=header';
    this.getPresentStudents();
  }
  
  // Fetch present students
  getPresentStudents(): void {
    this.http.get<any>(`${environment.backendBaseUrl}/api/attendance`).subscribe({
      next: (res) => {
        // Ensure the response structure matches the expected format
        if (res && Array.isArray(res.attendance)) {
          this.presentStudents = res.attendance; // Directly use the attendance data from the response
        } else {
          console.error('Unexpected response structure:', res);
          this.presentStudents = []; // Handle unexpected structure gracefully
        }
      },
      error: (err) => {
        console.error('Error fetching present students:', err);
      },
    });
  }
}
