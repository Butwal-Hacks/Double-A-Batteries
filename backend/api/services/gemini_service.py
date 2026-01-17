import os
from typing import Dict
import google.generativeai as genai

class GeminiService:
    def __init__(self):
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set")
        genai.configure(api_key=api_key)
        self.client = genai.GenerativeModel('gemini-2.5-flash')
    
    def _get_explanation_prompt(self, code: str, level: str = 'intermediate', language: str = 'auto-detect') -> str:
        base_instructions = """CRITICAL FORMATTING RULES FOR CLEAN PRESENTATION:
- Use numbered sections (1., 2., 3., etc.) for main topics
- Use backticks around code snippets like `variable_name` for inline code references
- Add blank lines between sections
- Keep explanations conversational and friendly
- Number each concept clearly
- NO markdown headers, bold symbols, or special formatting
- Write ONLY in English
- Use Nepali real-world examples to make concepts relatable
- Use 'Real-World Example:' prefix when giving practical context"""

        if level == 'beginner':
            return f"""You are CodeMentor, a friendly teacher helping beginners understand programming.

IMPORTANT: Teach ONLY in English. Use Nepali real-world scenarios to make concepts relatable.

Use these types of Nepali examples to explain concepts:
- "Like following a thaali recipe step by step" (for step-by-step logic)
- "Like organizing items at a Kathmandu bazaar stall" (for data structures)  
- "Like water flowing through irrigation channels in a farm" (for loops)
- "Like climbing stairs to a temple" (for progression)
- "Like a family's morning routine making dal bhat" (for sequences)
- "Like counting items during harvest time" (for variables)
- "Like layers in a momo" (for nested structures)
- "Like taking attendance at a school" (for iteration)

Explain this code structure:

1. WHAT IT DOES: Start with one simple sentence explaining the overall purpose

2. BREAKDOWN: Go through each important part and explain what it does using simple language

3. KEY CONCEPTS: Explain any important programming ideas using Nepali real-world examples

4. REAL-WORLD USE: Where would someone actually use this type of code?

5. SUMMARY: One sentence recap of what you learned

{base_instructions}

Code:
`{code}`"""

        elif level == 'intermediate':
            return f"""You are CodeMentor, teaching intermediate programmers clear programming concepts.

Use Nepali real-world scenarios and practical examples to explain patterns and best practices.

Explain this code professionally:

1. PURPOSE: What problem does this code solve?

2. HOW IT WORKS: Walk through the logic step by step

3. KEY PATTERNS: What programming patterns or techniques are being used?

4. REAL-WORLD CONTEXT: How does this relate to Nepali real-world systems? (Like supply chains, tea gardens management, trekking operations, community cooperatives, agriculture systems, bazaar trading patterns, etc.)

5. OPTIMIZATION TIPS: Any ways to make this better or more efficient?

6. WHEN TO USE IT: What situations would benefit from this approach?

{base_instructions}

Code:
`{code}`"""

        else:  # advanced
            return f"""You are CodeMentor, explaining advanced code to experienced programmers.

Focus on technical depth, design patterns, and practical applications.

Analyze this code:

1. TECHNICAL OVERVIEW: What is the purpose and design approach?

2. DESIGN PATTERNS: What patterns or principles are being applied?

3. IMPLEMENTATION DETAILS: Walk through the key technical decisions

4. PERFORMANCE CONSIDERATIONS: Complexity, optimization opportunities, edge cases

5. ALTERNATIVES: Other approaches and their trade-offs

6. REAL-WORLD APPLICATIONS: Business and infrastructure use cases

{base_instructions}

Code:
`{code}`"""
    
    def explain_code(self, code: str, language: str = 'auto-detect', level: str = 'intermediate') -> Dict[str, str]:
        prompt = self._get_explanation_prompt(code, level, language)

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
                "diagram": diagram
            }
        except Exception as e:
            raise Exception(f"Gemini API error: {str(e)}")
    
    def explain_with_improvements(self, code: str, language: str = 'auto-detect', level: str = 'intermediate') -> Dict:
        base_prompt = self._get_explanation_prompt(code, level, language)
        
        # Tailor improvement guidance based on level
        if level == 'beginner':
            improvement_guidance = """IMPROVEMENTS SECTION:
Now provide 3-5 specific code improvements in this exact format, with each numbered item on its own line:

1. Brief Title (2-3 words max) - One clear sentence explaining what improves and why

2. Another Brief Title - Clear sentence explaining the improvement

3. Third Improvement Title - Clear explanation

IMPORTANT:
- Use VERY SIMPLE language that a beginner can understand
- Avoid technical jargon completely
- Use Nepali real-world examples (momo making, bazaar shopping, farming, thamel navigation, etc.)
- Keep titles SHORT (2-4 words)
- Keep descriptions to ONE simple sentence each
- Explain the BENEFIT in simple terms (faster, safer, easier to read)
- Make it practical and relatable
- Each improvement should be independent and clear
- Use words like "cleaner", "easier to read", "simpler" rather than technical terms"""
        
        elif level == 'intermediate':
            improvement_guidance = """IMPROVEMENTS SECTION:
Now provide 3-5 specific code improvements in this exact format, with each numbered item on its own line:

1. Brief Title (2-3 words max) - Explain what improves and why with moderate detail

2. Another Brief Title - Clear explanation of the improvement strategy

3. Third Improvement Title - Description of the enhancement

IMPORTANT:
- Use clear, accessible language with some technical terms explained
- Include WHY each improvement matters
- You can reference programming concepts but explain them
- Keep titles SHORT (2-4 words)
- Provide practical reasoning for each improvement
- Give context about when and why to apply each improvement
- Use Nepali real-world analogies (supply chain systems, bazaar workflows, trekking logistics, cooperative structures, etc.)
- Each improvement should be independent and clear
- Balance between simplicity and technical accuracy"""
        
        else:  # advanced/expert
            improvement_guidance = """IMPROVEMENTS SECTION:
Now provide 3-5 specific code improvements in this exact format, with each numbered item on its own line:

1. Brief Title (2-3 words max) - Technical explanation of the improvement

2. Another Brief Title - Detailed optimization or best practice explanation

3. Third Improvement Title - Advanced technique or pattern explanation

IMPORTANT:
- Use technical language appropriate for experienced developers
- Reference design patterns, algorithms, and performance considerations
- Discuss trade-offs and optimization implications
- Include computational complexity considerations where relevant
- Reference best practices and coding standards
- You can use advanced programming terminology
- Explain memory efficiency, performance impact, and scalability
- Discuss maintainability and extensibility implications
- Each improvement should be independent and clear
- Focus on professional-grade enhancements and optimizations"""
        
        improvement_prompt = f"""
{base_prompt}

---

{improvement_guidance}"""
        
        try:
            response = self.client.generate_content(improvement_prompt)
            text = response.text if hasattr(response, 'text') else str(response)
            
            # Extract explanation and improvements
            explanation = text
            improvements = []
            
            if "IMPROVEMENTS SECTION:" in text or "IMPROVEMENTS" in text:
                # Try to find improvements section
                if "IMPROVEMENTS SECTION:" in text:
                    parts = text.split("IMPROVEMENTS SECTION:")
                    explanation = parts[0].replace("---", "").strip()
                    improvements_text = parts[1].strip() if len(parts) > 1 else ""
                elif "IMPROVEMENTS:" in text:
                    parts = text.split("IMPROVEMENTS:")
                    explanation = parts[0].strip()
                    improvements_text = parts[1].strip() if len(parts) > 1 else ""
                else:
                    improvements_text = ""
                
                # Parse numbered items (1., 2., 3., etc.)
                if improvements_text:
                    lines = improvements_text.split('\n')
                    current_item = []
                    
                    for line in lines:
                        stripped = line.strip()
                        if stripped and stripped[0].isdigit() and '.' in stripped[:3]:
                            # New numbered item
                            if current_item:
                                improvements.append(' '.join(current_item))
                            current_item = [stripped]
                        elif stripped and current_item:
                            current_item.append(stripped)
                    
                    # Add last item
                    if current_item:
                        improvements.append(' '.join(current_item))
            
            # Filter out empty improvements
            improvements = [imp.strip() for imp in improvements if imp.strip() and len(imp.strip()) > 5]
            
            return {
                "explanation": explanation,
                "improvements": improvements,
                "language": language,
                "level": level
            }
        except Exception as e:
            raise Exception(f"Gemini API error: {str(e)}")
    
    def answer_followup(self, code: str, question: str, level: str = 'intermediate') -> Dict:
        prompt = f"""The user is learning to program. Answer their question in ENGLISH ONLY.

Code they're learning:
```
{code}
```

Their question: {question}

Answer their question clearly at the {level} level with practical examples to help them understand better. Keep the answer concise and friendly. Write ONLY in English."""
        
        try:
            response = self.client.generate_content(prompt)
            text = response.text if hasattr(response, 'text') else str(response)
            
            return {
                "answer": text,
                "question": question
            }
        except Exception as e:
            raise Exception(f"Gemini API error: {str(e)}")
    
    def compare_code(self, code1: str, code2: str) -> Dict:
        prompt = f"""Compare these two code implementations and explain the differences. Write ONLY in English.

Implementation 1:
```
{code1}
```

Implementation 2:
```
{code2}
```

Explain:
1. What each implementation does
2. Key differences
3. Pros and cons of each
4. Which might be better and why

Use practical real-world examples to help learners understand the differences."""
        
        try:
            response = self.client.generate_content(prompt)
            text = response.text if hasattr(response, 'text') else str(response)
            
            return {
                "comparison": text
            }
        except Exception as e:
            raise Exception(f"Gemini API error: {str(e)}")
