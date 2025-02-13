import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',

  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  form: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {}

  register(): void {
    if (this.form.valid) {
      const formData = this.form.value;

      this.http.post<any>(`${environment.backendBaseUrl}/registerTeacher`, formData)
        .subscribe(
          response => {
            console.log(response.message); // Log success message
            this.router.navigate(['/login']); // Redirect to login page
          },
          error => {
            console.error('Error:', error.error.message); // Log error message
          }
        );
    }
  }
}
