from django.db import models
from django.contrib.auth.models import AbstractUser

class UserRole(models.TextChoices):
    SUPER_ADMIN = 'super_admin', 'Super Admin'
    MONITORING = 'monitoring', 'Monitoring'
    DEPT_HEAD = 'dept_head', 'Department Head'
    EMPLOYEE = 'employee', 'Employee'

class Department(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.EMPLOYEE
    )
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.username})"

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.role = UserRole.SUPER_ADMIN
        super().save(*args, **kwargs)
