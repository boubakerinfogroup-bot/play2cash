"""
Automated API Migration Script for Play2Cash Frontend
This script updates all pages to use the new API client instead of direct fetch calls
"""

import re
import os
from pathlib import Path

# Mapping of old API calls to new API client methods
API_REPLACEMENTS = {
    # Auth API
    r"fetch\('/api/auth/logout'": "authAPI.logout(",
    r"fetch\(`/api/user/balance\?userId=\$\{[^}]+\}`\)": "authAPI.me()",
    
    # Games API  
    r"fetch\('/api/games'\)": "gamesAPI.list()",
    r"fetch\(`/api/games/\$\{([^}]+)\}`\)": r"gamesAPI.get(\1)",
    
    # Matches API - adjust based on actual endpoints
}

def add_import_if_missing(content, apis_used):
    """Add API client imports if not present"""
    imports = []
    if 'auth' in apis_used:
        imports.append('authAPI')
    if 'games' in apis_used:
        imports.append('gamesAPI')
    if 'matches' in apis_used:
        imports.append('matchesAPI')
    if 'wallet' in apis_used:
        imports.append('walletAPI')
    
    if imports and '@/lib/api-client' not in content:
        import_line = f"import {{ {', '.join(imports)} }} from '@/lib/api-client'"
        # Insert after existing imports
        lines = content.split('\\n')
        for i, line in enumerate(lines):
            if line.startswith('import '):
                continue
            else:
                lines.insert(i, import_line)
                break
        return '\\n'.join(lines)
    return content

# Note: Due to complexity, manual fixing is recommended
print("Script template created. Manual review required for each file.")
