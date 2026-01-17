from rest_framework import serializers
from django.contrib.auth.models import User
from .models import CodeExplanationHistory, CodeExample, SharedCode


class CodeInputSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=10000, required=True)
    language = serializers.CharField(max_length=50, required=False, default="auto-detect")
    explanation_level = serializers.ChoiceField(
        choices=['beginner', 'intermediate', 'advanced'], 
        required=False, 
        default='intermediate'
    )
    include_improvements = serializers.BooleanField(required=False, default=False)
    include_output = serializers.BooleanField(required=False, default=False)
    format = serializers.ChoiceField(
        choices=['text', 'markdown'], 
        required=False, 
        default='text'
    )


class ExplanationSerializer(serializers.Serializer):
    explanation = serializers.CharField()
    diagram = serializers.CharField(allow_blank=True)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class SignupSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(min_length=6, required=True, write_only=True)
    name = serializers.CharField(max_length=150, required=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['name']
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True)


class CodeExplanationHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CodeExplanationHistory
        fields = ['id', 'code', 'language', 'explanation', 
                  'explanation_level', 'created_at', 'session_id']
        read_only_fields = ['id', 'created_at']


class CodeExampleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodeExample
        fields = ['id', 'title', 'language', 'code', 'description', 'difficulty', 'created_at']
        read_only_fields = ['id', 'created_at']


class SharedCodeSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = SharedCode
        fields = ['id', 'share_id', 'code', 'explanation', 'language', 
                  'created_at', 'created_by', 'created_by_username', 
                  'view_count', 'expires_at']
        read_only_fields = ['id', 'share_id', 'created_at', 'view_count', 'created_by']

