import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, FormsModule, Validators  } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',

  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  form: FormGroup;

constructor(private fb: FormBuilder,private http: HttpClient ,private active: ActivatedRoute, private router:Router) {
  this.form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });
  }

  ngOnInit(): void {
  }
  
  signIn(): void {
    if (this.form.valid) {
      const formData = this.form.value;
      
      this.http.post<any>(`${environment.backendBaseUrl}/teacher/login`, formData)
        .subscribe(
          response => {
            localStorage.setItem('token', response.token); // Store JWT token
            
            // ✅ Store teacherId if it exists in response
            if (response.teacherId) {
              localStorage.setItem('teacherId', response.teacherId);
            } else {
              console.warn('Teacher ID missing in response');
            }
  
            console.log(response.message); // Log success message
            this.router.navigate(['/teacher-dashboard']); // Navigate to teacher dashboard
          },
          error => {
            console.error('Error:', error.error.message); // Log error message
          }
        );
    }
  }
}  