import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, FormsModule, Validators  } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login-student',

  templateUrl: './login-student.component.html',
  styleUrl: './login-student.component.scss'
})
export class LoginStudentComponent implements OnInit {
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
      this.http.post<any>(`${environment.backendBaseUrl}/student/login`, formData)
        .subscribe(
          response => {
            localStorage.setItem('token', response.token); 
            console.log(response.message); 
            this.router.navigate(['/student-dashboard']); 
          },
          error => {
            console.error('Error:', error.error.message); 
           }
        );
    }
  }

}
