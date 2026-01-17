from django.db import models
import uuid


class CodeExplanation(models.Model):
    code = models.TextField()
    explanation = models.TextField()
    diagram = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Explanation from {self.created_at}"




class CodeExplanationHistory(models.Model):
    LANGUAGE_CHOICES = [
        ('auto-detect', 'Auto-detect'),
        ('python', 'Python'),
        ('javascript', 'JavaScript'),
        ('java', 'Java'),
        ('cpp', 'C++'),
        ('csharp', 'C#'),
        ('ruby', 'Ruby'),
        ('php', 'PHP'),
        ('go', 'Go'),
        ('rust', 'Rust'),
        ('typescript', 'TypeScript'),
        ('sql', 'SQL'),
        ('html', 'HTML'),
        ('css', 'CSS'),
        ('other', 'Other'),
    ]
    
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    
    COMPLEXITY_CHOICES = [
        ('simple', 'Simple'),
        ('medium', 'Medium'),
        ('complex', 'Complex'),
    ]
    
    code = models.TextField()
    language = models.CharField(max_length=50, choices=LANGUAGE_CHOICES, default='auto-detect')
    explanation = models.TextField()
    complexity_score = models.CharField(
        max_length=20, 
        choices=COMPLEXITY_CHOICES, 
        null=True, 
        blank=True
    )
    explanation_level = models.CharField(
        max_length=20, 
        choices=LEVEL_CHOICES, 
        default='intermediate'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    session_id = models.CharField(max_length=100, blank=True)
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.language} - {self.created_at}"


class CodeExample(models.Model):
    DIFFICULTY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    
    title = models.CharField(max_length=200)
    language = models.CharField(max_length=50)
    code = models.TextField()
    description = models.TextField()
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['difficulty', 'language', 'title']
    
    def __str__(self):
        return f"{self.title} ({self.language})"


class SharedCode(models.Model):
    share_id = models.CharField(max_length=50, unique=True, default=uuid.uuid4)
    code = models.TextField()
    explanation = models.TextField()
    language = models.CharField(max_length=50, default='auto-detect')
    complexity_score = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, blank=True)
    view_count = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Share {self.share_id}"

