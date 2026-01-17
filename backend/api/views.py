# api views

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListAPIView, RetrieveDestroyAPIView, CreateAPIView
from rest_framework import viewsets
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .serializers import (
    CodeInputSerializer, ExplanationSerializer, SignupSerializer, LoginSerializer, 
    UserSerializer, CodeExplanationHistorySerializer, CodeExampleSerializer, 
    SharedCodeSerializer
)
from .models import CodeExplanationHistory, CodeExample, SharedCode
from .services.ai_service import AIService
import logging
import time
import uuid

logger = logging.getLogger(__name__)

class SignupView(APIView):
    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.first_name or user.username
                }
            }, status=status.HTTP_201_CREATED)
        error_messages = serializer.errors
        first_error = None
        if error_messages:
            for field, errors in error_messages.items():
                if isinstance(errors, list) and errors:
                    first_error = str(errors[0])
                    break
        return Response({'detail': first_error or 'Signup failed'}, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({'detail': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)
            
            user = authenticate(username=user.username, password=password)
            if user:
                token, created = Token.objects.get_or_create(user=user)
                return Response({
                    'token': token.key,
                    'user': {
                        'id': user.id,
                        'email': user.email,
                        'name': user.first_name or user.username
                    }
                }, status=status.HTTP_200_OK)
            return Response({'detail': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)
        # Return first error message for clarity
        error_messages = serializer.errors
        first_error = None
        if error_messages:
            for field, errors in error_messages.items():
                if isinstance(errors, list) and errors:
                    first_error = str(errors[0])
                    break
        return Response({'detail': first_error or 'Login failed'}, status=status.HTTP_400_BAD_REQUEST)

class ExplainCodeView(APIView):
    def post(self, request):
        serializer = CodeInputSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {"error": "Invalid input. Code is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        code = serializer.validated_data['code']
        language = serializer.validated_data.get('language', 'auto-detect')
        explanation_level = serializer.validated_data.get('explanation_level', 'intermediate')
        include_improvements = serializer.validated_data.get('include_improvements', False)
        include_output = serializer.validated_data.get('include_output', False)
        output_format = serializer.validated_data.get('format', 'text')
        
        try:
            start_time = time.time()
            ai_service = AIService()
            
            if include_improvements:
                result = ai_service.explain_with_improvements(code, language, explanation_level)
            else:
                result = ai_service.explain_code(code, language, explanation_level)
            
            if include_output:
                try:
                    output = ai_service.execute_code(code, language)
                    result['output'] = output
                except Exception as e:
                    result['output'] = f"Error executing code: {str(e)}"
            
            processing_time = time.time() - start_time
            
            if 'metadata' not in result:
                result['metadata'] = {}
            result['metadata']['processing_time'] = round(processing_time, 2)
            
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            error_msg = f"Error explaining code: {str(e)}"
            logger.error(error_msg)
            print(error_msg)
            return Response(
                {"error": error_msg},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class HealthCheckView(APIView):
    def get(self, request):
        return Response({
            "status": "healthy",
            "service": "CodeMentor API"
        })


class HistoryListView(ListAPIView):
    serializer_class = CodeExplanationHistorySerializer
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            return CodeExplanationHistory.objects.filter(user=self.request.user)
        return CodeExplanationHistory.objects.none()


class HistorySaveView(CreateAPIView):
    serializer_class = CodeExplanationHistorySerializer
    
    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save(session_id=self.request.META.get('HTTP_X_SESSION_ID', ''))


class HistoryDetailView(RetrieveDestroyAPIView):
    serializer_class = CodeExplanationHistorySerializer
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            return CodeExplanationHistory.objects.filter(user=self.request.user)
        return CodeExplanationHistory.objects.none()


class ExamplesListView(ListAPIView):
    serializer_class = CodeExampleSerializer
    
    def get_queryset(self):
        queryset = CodeExample.objects.all()
        language = self.request.query_params.get('language')
        difficulty = self.request.query_params.get('difficulty')
        
        if language:
            queryset = queryset.filter(language__iexact=language)
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        
        return queryset


class ExampleDetailView(APIView):
    def get(self, request, language=None):
        if language:
            examples = CodeExample.objects.filter(language__iexact=language)
            serializer = CodeExampleSerializer(examples, many=True)
            return Response(serializer.data)
        return Response({"error": "Language required"}, status=status.HTTP_400_BAD_REQUEST)


class ShareCreateView(CreateAPIView):
    serializer_class = SharedCodeSerializer
    
    def perform_create(self, serializer):
        share_id = str(uuid.uuid4())[:8]
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(share_id=share_id, created_by=user)


class ShareDetailView(APIView):
    def get(self, request, share_id):
        try:
            shared_code = SharedCode.objects.get(share_id=share_id)
            shared_code.view_count += 1
            shared_code.save(update_fields=['view_count'])
            
            serializer = SharedCodeSerializer(shared_code)
            return Response(serializer.data)
        except SharedCode.DoesNotExist:
            return Response({"error": "Share not found"}, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, share_id):
        try:
            shared_code = SharedCode.objects.get(share_id=share_id)
            if shared_code.created_by == request.user or not request.user.is_authenticated:
                shared_code.delete()
                return Response({"message": "Deleted successfully"})
            return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
        except SharedCode.DoesNotExist:
            return Response({"error": "Share not found"}, status=status.HTTP_404_NOT_FOUND)


class FollowUpView(APIView):
    def post(self, request):
        code = request.data.get('code')
        previous_explanation = request.data.get('previous_explanation')
        question = request.data.get('question')
        language = request.data.get('language', 'auto-detect')
        
        if not all([code, previous_explanation, question]):
            return Response(
                {"error": "code, previous_explanation, and question are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            ai_service = AIService()
            result = ai_service.answer_followup(code, previous_explanation, question, language)
            return Response(result)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CodeComparisonView(APIView):
    def post(self, request):
        code1 = request.data.get('code1')
        code2 = request.data.get('code2')
        language = request.data.get('language', 'auto-detect')
        
        if not code1 or not code2:
            return Response(
                {"error": "code1 and code2 are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            ai_service = AIService()
            result = ai_service.compare_code(code1, code2, language)
            return Response(result)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
