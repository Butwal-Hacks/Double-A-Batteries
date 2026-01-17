import os
from typing import Dict, Any, Optional
import google.generativeai as genai
import subprocess
import sys


class AIService:
    def __init__(self):
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set")
        genai.configure(api_key=api_key)
        self.client = genai.GenerativeModel('gemini-2.5-flash')
    
    def _detect_language(self, code: str) -> str:
        prompt = f"""Identify the programming language of this code snippet. 
        Return ONLY the language name in lowercase (e.g., python, javascript, java).
        
        Code:
        {code}"""
        
        try:
            response = self.client.generate_content(prompt)
            return response.text.strip().lower()
        except Exception:
            return "unknown"
    
    def _get_explanation_prompt(self, code: str, language: str, level: str) -> str:
        """Get explanation prompt"""
        level_prompts = {
            'beginner': """Explain this code in simple terms that a beginner can understand. 
Use analogies and avoid jargon. Break down each concept step by step.
Use Nepali cultural references and examples where appropriate (e.g., "like a Nepali recipe", "like climbing the Himalayas") to make it relatable for Nepali learners.

CRITICAL FORMATTING RULES:
- Do NOT use ## markdown headers or any markdown formatting
- Do NOT use ** for bold text or * for any emphasis
- Do NOT use --- or any separator lines
- Use plain text only with clear line breaks
- Add blank lines between sections for spacing and readability
- Keep explanations simple, conversational, and friendly
- Number lines or sections clearly (1., 2., 3., etc.)
- NO special characters or decorations""",
            
            'intermediate': """Explain this code assuming the reader knows basic programming concepts.
Focus on how and why the code works, including any patterns or best practices used.
Include relevant design patterns, algorithms, or concepts being demonstrated.
Use Nepali cultural references where helpful but keep explanations technical.

CRITICAL FORMATTING RULES:
- Do NOT use ## markdown headers or any markdown formatting
- Do NOT use ** for bold text or * for any emphasis  
- Use plain text with clear sections
- Number important points (1., 2., 3., etc.)
- Explain the logic and flow clearly
- Mention any edge cases or important considerations""",
            
            'advanced': """Provide a technical deep-dive of this code. Include:
1. Design patterns and architectural decisions
2. Performance considerations and potential optimizations
3. Advanced concepts being used
4. Edge cases and error handling

Use Nepali technical references where appropriate. Be precise and technical.

FORMATTING:
- Use numbered sections for clarity
- Mention specific design patterns by name
- Discuss trade-offs and alternatives
- No markdown formatting, plain text only"""
        }
        
        return f"""You are CodeMentor, an AI that explains code to learners in English.

{level_prompts.get(level, level_prompts['intermediate'])}

Code to explain ({language}):
```
{code}
```

Provide a clear, well-structured explanation:"""
    
    def _get_improvements_prompt(self, code: str, language: str) -> str:
        """Get prompt for code improvement suggestions"""
        return f"""Analyze this {language} code and suggest specific improvements for:
1. Performance optimization
2. Readability and maintainability
3. Best practices and patterns
4. Potential bugs or edge cases

For each suggestion, provide:
- Title of the improvement
- Description of why this matters
- Improved code example

Format each improvement clearly with numbered points. Use plain text without markdown formatting.

Code:
```
{code}
```"""
    
    def explain_code(self, code: str, language: str = "auto-detect", level: str = "intermediate") -> Dict[str, Any]:
        if language == "auto-detect":
            language = self._detect_language(code)
        
        prompt = self._get_explanation_prompt(code, language, level)
        
        try:
            response = self.client.generate_content(prompt)
            text = response.text if hasattr(response, 'text') else str(response)
            
            # Extract mermaid diagram if present
            diagram = ""
            if "```mermaid" in text:
                start = text.find("```mermaid") + 10
                end = text.find("```", start)
                diagram = text[start:end].strip()
            
            return {
                "explanation": text,
                "diagram": diagram,
                "language": language
            }
        except Exception as e:
            raise Exception(f"Gemini API error: {str(e)}")
    
    def explain_with_improvements(self, code: str, language: str = "auto-detect", level: str = "intermediate") -> Dict[str, Any]:
        if language == "auto-detect":
            language = self._detect_language(code)
        
        explanation_result = self.explain_code(code, language, level)
        improvements_prompt = self._get_improvements_prompt(code, language)
        
        try:
            response = self.client.generate_content(improvements_prompt)
            improvements_text = response.text if hasattr(response, 'text') else str(response)
            
            improvements = self._parse_improvements(improvements_text)
            
            return {
                "explanation": explanation_result["explanation"],
                "diagram": explanation_result["diagram"],
                "language": language,
                "improvements": improvements
            }
        except Exception as e:
            raise Exception(f"Error getting improvements: {str(e)}")
    
    def _parse_improvements(self, text: str) -> list:
        improvements = []
        sections = text.split('\n\n')
        
        current_improvement = {}
        for section in sections:
            lines = section.strip().split('\n')
            for line in lines:
                if line.startswith('Title:') or line.startswith('1.'):
                    if current_improvement and 'title' in current_improvement:
                        improvements.append(current_improvement)
                    current_improvement = {'title': line.replace('Title:', '').replace('1.', '').strip()}
                elif line.startswith('Description:') or line.startswith('2.'):
                    if 'description' not in current_improvement:
                        current_improvement['description'] = line.replace('Description:', '').replace('2.', '').strip()
                elif line.startswith('Improved Code:') or line.startswith('3.'):
                    current_improvement['improved_code'] = section[section.find('```'):] if '```' in section else ''
        
        if current_improvement and 'title' in current_improvement:
            improvements.append(current_improvement)
        
        return improvements[:5]

    
    def execute_code(self, code: str, language: str = "auto-detect") -> str:
        if language == "auto-detect":
            language = self._detect_language(code)
        
        language = language.lower().strip()
        
        try:
            if language in ['python', 'py']:
                return self._execute_python(code)
            elif language in ['javascript', 'js', 'node']:
                return self._execute_javascript(code)
            else:
                return f"Code execution not supported for {language}. Supported: Python, JavaScript"
        except Exception as e:
            return f"Execution Error: {str(e)}"
    
    def _execute_python(self, code: str) -> str:
        try:
            exec_globals = {'__builtins__': __builtins__}
            exec_locals = {}
            
            import sys
            from io import StringIO
            old_stdout = sys.stdout
            sys.stdout = StringIO()
            
            try:
                exec(code, exec_globals, exec_locals)
                output = sys.stdout.getvalue()
            finally:
                sys.stdout = old_stdout
            
            return output if output else "(No output)"
        except Exception as e:
            return f"Error: {str(e)}"
    
    def _execute_javascript(self, code: str) -> str:
        try:
            result = subprocess.run(
                ['node', '-e', code],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            if result.returncode != 0:
                return f"Error: {result.stderr}"
            
            return result.stdout if result.stdout else "(No output)"
        except FileNotFoundError:
            return "Node.js not installed. Install Node.js to execute JavaScript code."
        except subprocess.TimeoutExpired:
            return "Code execution timed out (5 second limit)"
        except Exception as e:
            return f"Error: {str(e)}"
    
    def answer_followup(self, code: str, previous_explanation: str, question: str, language: str = "auto-detect") -> Dict[str, Any]:
        if language == "auto-detect":
            language = self._detect_language(code)
        
        prompt = f"""Based on this {language} code and the previous explanation, answer the follow-up question.

Code:
```
{code}
```

Previous explanation:
{previous_explanation}

User's question:
{question}

Provide a clear, concise answer:"""
        
        try:
            response = self.client.generate_content(prompt)
            answer = response.text if hasattr(response, 'text') else str(response)
            
            return {
                "answer": answer,
                "language": language
            }
        except Exception as e:
            raise Exception(f"Error answering follow-up: {str(e)}")
    
    def compare_code(self, code1: str, code2: str, language: str = "auto-detect") -> Dict[str, Any]:
        if language == "auto-detect":
            language = self._detect_language(code1)
        
        prompt = f"""Compare these two {language} code snippets:

Code 1:
```
{code1}
```

Code 2:
```
{code2}
```

Provide:
1. Similarities
2. Differences
3. Which is better and why
4. Performance implications of each approach

Use plain text with numbered sections."""
        
        try:
            response = self.client.generate_content(prompt)
            comparison = response.text if hasattr(response, 'text') else str(response)
            
            return {
                "comparison": comparison,
                "language": language
            }
        except Exception as e:
            raise Exception(f"Error comparing code: {str(e)}")
