// storage.js
// all the localstorage stuff lives here
// its kinda messy but gets the job done
// indexeddb would be better but this is faster to implement

const STORAGE_KEYS = {
  HISTORY: 'codementor_history',
  SETTINGS: 'codementor_settings',
  THEME: 'codementor_theme',
  SESSION_ID: 'codementor_session_id',
};

// generate session id for ppl who arent logged in
export function getSessionId() {
  let sessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
  if (!sessionId) {
    // random id that should be unique enough
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
  }
  return sessionId;
}

export function clearSessionId() { localStorage.removeItem(STORAGE_KEYS.SESSION_ID); }

// --- HISTORY ---
// saves explanations so users can go back to them
// only keeping 100 cuz localstorage has limits

export function saveExplanation(data) {
  try {
    const history = getHistory();
    const entry = { 
      ...data, 
      id: Date.now(), 
      timestamp: new Date().toISOString() 
    };
    history.unshift(entry); // newest first
    // cap at 100 entries otherwise we run out of space
    const limitedHistory = history.slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(limitedHistory));
    return entry;
  } catch (err) {
    // sometimes this fails idk why
    console.error('Error saving explanation:', err);
    return null;
  }
}

// grab all saved history
export function getHistory() {
  try {
    const history = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!history) return []; // empty if nothing saved
    return JSON.parse(history);
  } catch (err) {
    console.error('history broke:', err);
    return [];
  }
}

// get specific entry by id
export function getHistoryEntry(id) {
  try {
    const history = getHistory();
    return history.find(entry => entry.id === id) || null;
  } catch (err) {
    console.error('Error getting history entry:', err);
    return null;
  }
}

// delete single entry by id
export function deleteHistoryEntry(id) {
  try {
    const history = getHistory();
    // filter out the one we want gone
    const filtered = history.filter(entry => entry.id !== id);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.error('delete failed:', err);
    return false;
  }
}

// nuke everything lol
export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    return true;
  } catch (err) {
    console.error('clear failed:', err);
    return false;
  }
}

// search through history - basic text matching
// not the best search but good enough for hackathon
export function searchHistory(query) {
  try {
    const history = getHistory();
    const q = query.toLowerCase();
    // check code, explanation, and language
    return history.filter(entry => 
      entry.code.toLowerCase().includes(q) || 
      entry.explanation.toLowerCase().includes(q) || 
      (entry.language && entry.language.toLowerCase().includes(q))
    );
  } catch (err) {
    console.error('search broke:', err);
    return [];
  }
}

// export as json - for backup
export function exportHistory() {
  try {
    const history = getHistory();
    return JSON.stringify(history, null, 2);
  } catch (err) {
    console.error('Error exporting history:', err);
    return '';
  }
}

// ============ Settings ============

// save settings
export function saveSettings(settings) {
  try {
    const current = getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error saving settings:', err);
    return null;
  }
}

// get all settings
export function getSettings() {
  try {
    const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settings ? JSON.parse(settings) : {};
  } catch (err) {
    console.error('Error getting settings:', err);
    return {};
  }
}

// get specific setting
export function getSetting(key, defaultValue = null) {
  try {
    const settings = getSettings();
    return settings.hasOwnProperty(key) ? settings[key] : defaultValue;
  } catch (err) {
    console.error('Error getting setting:', err);
    return defaultValue;
  }
}

// set a specific setting
export function setSetting(key, value) {
  try {
    const settings = getSettings();
    settings[key] = value;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (err) {
    console.error('Error setting setting:', err);
    return false;
  }
}

// clear settings
export function clearSettings() {
  try {
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    return true;
  } catch (err) {
    console.error('Error clearing settings:', err);
    return false;
  }
}

// ============ Theme ============

// save theme pref
export function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    return true;
  } catch (err) {
    console.error('Error saving theme:', err);
    return false;
  }
}

// get theme pref
export function getTheme() {
  try {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  } catch (err) {
    console.error('Error getting theme:', err);
    return 'light';
  }
}

// toggle theme
export function toggleTheme() {
  const current = getTheme();
  const newTheme = current === 'light' ? 'dark' : 'light';
  saveTheme(newTheme);
  return newTheme;
}

// ============ Utils ============

// clear everything
export function clearAllStorage() {
  try {
    Object.values(STORAGE_KEYS).forEach(key => { localStorage.removeItem(key); });
    return true;
  } catch (err) {
    console.error('Error clearing all storage:', err);
    return false;
  }
}

// get storage size approx
export function getStorageSize() {
  try {
    let total = 0;
    Object.values(STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) total += item.length + key.length;
    });
    return total;
  } catch (err) {
    console.error('Error getting storage size:', err);
    return 0;
  }
}

// demo data for testing w/o api
export function initializeDemoData() {
  try {
    const history = getHistory();
    
    // Demo data - C Palindrome Checker
    const demoEntries = [
      {
        code: `#include <stdio.h>

int main() {
    int num, originalNum, reversedNum = 0, remainder;
    
    printf("Enter a number: ");
    scanf("%d", &num);
    
    originalNum = num;
    
    while (num != 0) {
        remainder = num % 10;
        reversedNum = reversedNum * 10 + remainder;
        num /= 10;
    }
    
    if (originalNum == reversedNum) {
        printf("%d is a palindrome.\\n", originalNum);
    } else {
        printf("%d is not a palindrome.\\n", originalNum);
    }
    
    return 0;
}`,
        explanation: `PALINDROME NUMBER CHECKER - C PROGRAM

This program checks if a number is a palindrome (reads the same forwards and backwards).

HOW IT WORKS:

1. VARIABLE DECLARATION:
   - num: stores the input number
   - originalNum: keeps a backup of the original number
   - reversedNum: will store the reversed number
   - remainder: stores each digit extracted from the number

2. INPUT HANDLING:
   The program asks the user to enter a number using scanf()

3. NUMBER REVERSAL LOGIC:
   The while loop runs as long as num is not zero:
   - remainder = num % 10: Extracts the last digit (e.g., from 121, gets 1)
   - reversedNum = reversedNum * 10 + remainder: Adds the digit to reversed number
   - num /= 10: Removes the last digit from num

   Example with 121:
   - First iteration: remainder=1, reversedNum=1, num=12
   - Second iteration: remainder=2, reversedNum=12, num=1
   - Third iteration: remainder=1, reversedNum=121, num=0

4. PALINDROME CHECK:
   Compares originalNum with reversedNum. If they match, it's a palindrome.

5. OUTPUT:
   Prints whether the number is a palindrome or not.

KEY CONCEPT:
A palindrome number reads the same forwards and backwards, like 121, 1331, or 101.`,
        improvements: [
          {
            title: "1. Add Input Validation",
            description: "The program should check if scanf() successfully read the input and handle negative numbers.",
            improved_code: `if (scanf("%d", &num) != 1) {
    printf("Invalid input!\\n");
    return 1;
}
if (num < 0) {
    printf("Please enter a positive number.\\n");
    return 1;
}`
          },
          {
            title: "2. Use a Function to Check Palindrome",
            description: "Extract the palindrome checking logic into a separate function for reusability and better code organization.",
            improved_code: `int isPalindrome(int num) {
    int originalNum = num;
    int reversedNum = 0;
    
    while (num != 0) {
        int remainder = num % 10;
        reversedNum = reversedNum * 10 + remainder;
        num /= 10;
    }
    
    return originalNum == reversedNum;
}`
          },
          {
            title: "3. Handle Zero and Single Digit Numbers",
            description: "Zero and single digits are palindromes by definition but the current logic handles them correctly. Add a comment for clarity.",
            improved_code: `// Single digit numbers (0-9) are palindromes
// because reversedNum will equal originalNum after one iteration`
          }
        ],
        language: "c",
        explanation_level: "intermediate",
        output: `Enter a number: 121
121 is a palindrome.`,
        complexity_score: "Beginner",
        timestamp: new Date().toISOString(),
        id: Date.now() - 1000000
      },
      {
        code: `def fibonacci_iterative(n):
    """Generate first n Fibonacci numbers using iteration"""
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    
    fib_sequence = [0, 1]
    for i in range(2, n):
        fib_sequence.append(fib_sequence[i-1] + fib_sequence[i-2])
    
    return fib_sequence`,
        explanation: `FIBONACCI SEQUENCE GENERATOR - PYTHON

This function generates the first n Fibonacci numbers using an iterative approach (loops, not recursion).

HOW IT WORKS:

1. INPUT VALIDATION:
   - if n <= 0: Returns an empty list (no Fibonacci numbers to generate)
   - elif n == 1: Returns [0] (the first Fibonacci number is 0)

2. INITIALIZE SEQUENCE:
   - fib_sequence = [0, 1]: Start with the first two Fibonacci numbers
   - These are the base values: F(0)=0 and F(1)=1

3. ITERATIVE CALCULATION:
   The for loop runs from i=2 to n-1:
   - fib_sequence.append(fib_sequence[i-1] + fib_sequence[i-2])
   - Each new number = sum of the two previous numbers
   - Example: F(2) = F(1) + F(0) = 1 + 0 = 1
   
   Sequence: 0, 1, 1, 2, 3, 5, 8, 13, 21, ...

4. RETURN RESULT:
   Returns the complete list of Fibonacci numbers

KEY CONCEPTS:
- Iterative approach is more efficient than recursion
- Time complexity: O(n) - linear, very fast
- Space complexity: O(n) - stores all numbers
- Perfect for generating Fibonacci series up to any length`,
        improvements: [
          {
            title: "1. Handle Edge Cases More Clearly",
            description: "Add type checking and better error handling for invalid inputs.",
            improved_code: `def fibonacci_iterative(n):
    """Generate first n Fibonacci numbers"""
    if not isinstance(n, int):
        raise TypeError("n must be an integer")
    if n < 0:
        raise ValueError("n must be non-negative")
    if n == 0:
        return []
    if n == 1:
        return [0]
    
    fib_sequence = [0, 1]
    for i in range(2, n):
        fib_sequence.append(fib_sequence[i-1] + fib_sequence[i-2])
    return fib_sequence`
          },
          {
            title: "2. Add Generator Function for Memory Efficiency",
            description: "Use yield instead of append for large n values to save memory.",
            improved_code: `def fibonacci_generator(n):
    """Generate Fibonacci numbers one at a time"""
    a, b = 0, 1
    count = 0
    while count < n:
        yield a
        a, b = b, a + b
        count += 1`
          },
          {
            title: "3. Add Caching for Performance",
            description: "Use @lru_cache decorator for repeated function calls.",
            improved_code: `from functools import lru_cache

@lru_cache(maxsize=None)
def fibonacci_cached(n):
    """Calculate nth Fibonacci number with caching"""
    if n <= 1:
        return n
    return fibonacci_cached(n-1) + fibonacci_cached(n-2)`
          }
        ],
        language: "python",
        explanation_level: "intermediate",
        output: `[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]`,
        complexity_score: "Beginner-Intermediate",
        timestamp: new Date().toISOString(),
        id: Date.now() - 500000
      }
    ];

    // Only add demo data if it doesn't already exist
    const codeExists = history.some(entry => 
      entry.code.includes("int main()") && entry.code.includes("palindrome")
    );
    
    if (!codeExists && demoEntries.length > 0) {
      demoEntries.forEach(entry => {
        history.unshift(entry);
      });
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history.slice(0, 100)));
    }
  } catch (error) {
    console.error('Error initializing demo data:', error);
  }
}

/**
 * Check if storage is available
 * @returns {boolean} Storage availability
 */
export function isStorageAvailable() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    console.error('Storage not available:', error);
    return false;
  }
}

export const storage = {
  // Session
  getSessionId,
  clearSessionId,

  // History
  saveExplanation,
  getHistory,
  getHistoryEntry,
  deleteHistoryEntry,
  clearHistory,
  searchHistory,
  exportHistory,

  // Settings
  saveSettings,
  getSettings,
  getSetting,
  setSetting,
  clearSettings,

  // Theme
  saveTheme,
  getTheme,
  toggleTheme,

  // Demo
  initializeDemoData,

  // Utilities
  clearAllStorage,
  getStorageSize,
  isStorageAvailable,
};
