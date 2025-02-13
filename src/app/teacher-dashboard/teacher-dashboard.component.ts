import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-teacher-dashboard',
  templateUrl: './teacher-dashboard.component.html',
  styleUrls: ['./teacher-dashboard.component.scss']
})
export class TeacherDashboardComponent implements OnInit {
  form: FormGroup;
  qrCode: string = localStorage.getItem('qrCode') || ''; // Load QR Code from local storage with fallback
  attendanceMessage: string | null = localStorage.getItem('attendanceMessage') || ''; // Persist message with fallback
  errorMessage: string | null = null;
  sessionId: string = localStorage.getItem('sessionId') || ''; // Load session ID from local storage with fallback
  presentStudents: any[] = []; // Stores present students data
  attendanceDate: string = ''; // Store selected date
  attendanceBatch: string = ''; // Store entered batch number
  isLive: boolean = false; // ✅ Add this property to track live updates

  
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private active: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      topic: ['', [Validators.required]],
      date: ['', [Validators.required]],
      batch: ['', [Validators.required]],
      teacherEmail: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.autoFillSessionData();

  }

  createSession(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'No token found. Please log in again.';
      return;
    }

    if (this.form.valid) {
      const formData = this.form.value;

      this.http
        .post<any>(`${environment.backendBaseUrl}/teacher/create-session`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .subscribe(
          (response) => {
            console.log('Response from server:', response);

            if (response.qrCode && response.sessionId) {
              this.qrCode = response.qrCode;
              this.sessionId = response.sessionId;
              this.attendanceMessage = 'Session created successfully. QR Code is ready.';
              this.errorMessage = null;

              // Store session details in local storage
              localStorage.setItem('qrCode', this.qrCode);
              localStorage.setItem('sessionId', this.sessionId);
              localStorage.setItem('attendanceMessage', this.attendanceMessage);
            } else {
              this.errorMessage = 'Session creation failed. No QR Code received.';
              this.attendanceMessage = null;
            }
            
          },
          (error) => {
            console.error('Error creating session:', error);
            this.errorMessage = error.error?.message || 'Failed to create session';
            this.attendanceMessage = null;
          }
        );
    } else {
      this.errorMessage = 'Please fill in all required fields.';
    }
  }

  autoFillSessionData(): void {
    const storedDate = localStorage.getItem('sessionDate');
    const storedBatch = localStorage.getItem('sessionBatch');

    if (storedDate && storedBatch) {
      this.form.patchValue({ date: storedDate, batch: storedBatch });
    }
  }
  
  // getPresentStudents(): void {
  //   const token = localStorage.getItem('token');
  //   const date = this.form.value.date;
  //   const batch = this.form.value.batch;
  
  //   if (!token) {
  //     this.errorMessage = 'No authentication token found. Please log in again.';
  //     return;
  //   }
  
  //   if (!date || !batch) {
  //     this.errorMessage = 'Date and Batch are required to fetch attendance.';
  //     return;
  //   }
  
  //   this.http
  //     .get<any>('http://localhost:3000/attendance/getPresentStudents', {
  //       params: { date: date, batch: batch },
  //       headers: { Authorization: `Bearer ${token}` },
  //     })
  //     .subscribe(
  //       (response) => {
  //         console.log('Present students:', response.presentStudents);
  //         this.presentStudents = response.presentStudents || [];
  //       },
  //       (error) => {
  //         console.error('Error fetching attendance:', error);
  //         this.presentStudents = [];
  //         this.errorMessage = error.error?.message || 'Failed to fetch present students.';
  //       }
  //     );
  // }
  // getPresentStudents(): void {
  //   const date = this.form.value.date;
  //   const batch = this.form.value.batch;

  //   if (!date || !batch) {
  //     this.errorMessage = 'Date and Batch are required to fetch attendance.';
  //     return;
  //   }

  //   this.isLive = true;
  //   const eventSource = new EventSource(`http://localhost:3000/attendance/getAttendance?date=${date}&batch=${batch}`);

  //   eventSource.onmessage = (event) => {
  //     const data = JSON.parse(event.data);
  //     this.presentStudents = data.presentStudents || [];
  //   };

  //   eventSource.onerror = () => {
  //     this.errorMessage = 'Lost connection to live attendance updates!';
  //     eventSource.close();
  //     this.isLive = false;
  //   };
  // }

  getPresentStudents(): void {
    const sessionId = this.sessionId; // Use the session ID stored in local storage
  
    if (!sessionId) {
      this.errorMessage = 'Session ID is required to fetch attendance.';
      return;
    }
  
    this.http
      .get<any>(`${environment.backendBaseUrl}/attendance/getAttendance`, {
        params: { sessionId: sessionId },
      })
      .subscribe(
        (response) => {
          console.log('Present students:', response.presentStudents);
          this.presentStudents = response.presentStudents.map((student: any) => ({
            rollNumber: student.rollNumber,
            name: student.name,
          }));
        },
        (error) => {
          console.error('Error fetching attendance:', error);
          this.presentStudents = [];
          this.errorMessage = error.error?.message || 'Failed to fetch present students.';
        }
      );
  }
  
  

  resetSession(): void {
    localStorage.removeItem('qrCode');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('attendanceMessage');
    this.qrCode = '';
    this.sessionId = '';
    this.attendanceMessage = '';
  }
}
