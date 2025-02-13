import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, FormsModule, Validators  } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-get-attendance',
  templateUrl: './get-attendance.component.html',
  styleUrl: './get-attendance.component.scss'
})
export class GetAttendanceComponent implements OnInit {

  qrCode: string | null = null; // To store the QR Code as a data URL
  attendanceMessage: string | null = null;
  errorMessage: string | null = null;
  sessionId: string | null = null; // Stores the created session ID
  presentStudents: any[] = []; // Stores present students data

  constructor(private http: HttpClient ,private active: ActivatedRoute, private router:Router) {
  }

  ngOnInit(): void {}

  getPresentStudents(): void {
    const token = localStorage.getItem('token');
    const teacherId = localStorage.getItem('teacherId'); // Fetch teacherId
    console.log(teacherId);
    if (!token) {
      this.errorMessage = 'No authentication token found. Please log in again.';
      return;
    }
  
    if (!teacherId) {
      this.errorMessage = 'Teacher ID is missing. Please log in again.';
      return;
    }
  
    if (!this.sessionId) {
      this.errorMessage = 'Session ID is missing. Please create a session first.';
      return;
    }
  
    this.http
      .get<any>(`${environment.backendBaseUrl}/attendance/getAttendance`, {
        params: { sessionId: this.sessionId, teacherId: teacherId },
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe(
        (response) => {
          console.log('Present students:', response);
          this.presentStudents = response.presentStudents || [];
        },
        (error) => {
          console.error('Error fetching attendance:', error);
          this.presentStudents = [];
          this.errorMessage = error.error?.error || 'Failed to fetch present students.';
        }
      );
  }
}
