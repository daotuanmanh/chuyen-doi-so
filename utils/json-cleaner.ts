import JSON5 from "json5";

export function extractBalancedJson(raw: string): string {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No braces");
  let slice = raw.slice(start, end + 1);

  return slice
    .replace(/,(\s*[}\]])/g, "$1")  // bỏ dấu , cuối mảng/object
    .replace(/\n/g, " ")             // xoá newline thừa
    .replace(/\s{2,}/g, " ");        // xoá space thừa
}

export function safeParse<T>(raw: string): T {
  return JSON5.parse(raw) as T;
}

export function cleanJsonResponse(response: string): string {
  let cleanResponse = response.trim();
  
  // Remove common prefixes that AI might add
  const prefixesToRemove = [
    'Here is the detailed analysis in Vietnamese:',
    'Here is the detailed analysis in JSON format:',
    'Here is the JSON output:',
    'Here is the analysis:',
    'Here\'s the JSON:',
    'Here is th',
    'Here is',
    'JSON:',
    'Output:',
    'Result:',
    'Analysis:',
    'Response:',
    'Note:',
    'As a Chief Strategy Officer'
  ];
  
  for (const prefix of prefixesToRemove) {
    if (cleanResponse.startsWith(prefix)) {
      cleanResponse = cleanResponse.substring(prefix.length).trim();
    }
  }
  
  // More aggressive cleaning - remove any text before the first {
  const firstBrace = cleanResponse.indexOf('{');
  if (firstBrace > 0) {
    cleanResponse = cleanResponse.substring(firstBrace);
  }
  
  // Remove any text after the last }
  const lastBrace = cleanResponse.lastIndexOf('}');
  if (lastBrace > 0 && lastBrace < cleanResponse.length - 1) {
    cleanResponse = cleanResponse.substring(0, lastBrace + 1);
  }
  
  // Handle markdown code blocks
  if (cleanResponse.includes('```json')) {
    cleanResponse = cleanResponse.split('```json')[1].split('```')[0].trim();
  } else if (cleanResponse.includes('```')) {
    // Find all code blocks and take the longest one
    const codeBlocks = cleanResponse.match(/```([\s\S]*?)```/g);
    if (codeBlocks && codeBlocks.length > 0) {
      const longestBlock = codeBlocks.reduce((a, b) => a.length > b.length ? a : b);
      cleanResponse = longestBlock.replace(/```/g, '').trim();
    }
  }
  
  // Clean up common JSON format issues
  cleanResponse = cleanResponse
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .replace(/fakihuyongfakihuyongfakihuyong/g, '') // Remove repeated text
    .replace(/otecungfakihuyongfakihuyong/g, '') // Remove more repeated text
    .trim();
  
  // Truncate if too long to prevent JSON parsing errors
  if (cleanResponse.length > 5000) {
    console.log('Response too long, truncating...');
    // Try to find the last complete JSON field before truncation
    const lastCompleteField = cleanResponse.lastIndexOf('",', 5000);
    if (lastCompleteField > 0) {
      cleanResponse = cleanResponse.substring(0, lastCompleteField + 1) + '}';
    } else {
      cleanResponse = cleanResponse.substring(0, 5000) + '"}';
    }
  }
  
  // Final safety check - if it doesn't start with {, make it JSON
  if (!cleanResponse.startsWith('{')) {
    console.log('Response does not start with {, creating fallback JSON');
    throw new Error('Invalid JSON format');
  }
  
  // Validate JSON structure before parsing
  const braceCount = (cleanResponse.match(/\{/g) || []).length;
  const closeBraceCount = (cleanResponse.match(/\}/g) || []).length;
  if (braceCount !== closeBraceCount) {
    console.log('Unmatched braces detected, creating fallback JSON');
    throw new Error('Invalid JSON structure');
  }
  
  // Check for incomplete JSON fields
  const quoteCount = (cleanResponse.match(/"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    console.log('Unmatched quotes detected, creating fallback JSON');
    throw new Error('Invalid JSON structure - unmatched quotes');
  }
  
  // Check for common JSON issues and fix them
  if (cleanResponse.includes('Nhó') || cleanResponse.includes('fakihuyong') || cleanResponse.includes('otecung')) {
    console.log('Detected problematic text in JSON, creating fallback JSON');
    throw new Error('Invalid JSON content');
  }
  
  // Check for repetitive patterns that indicate corrupted response
  const repetitivePatterns = [
    /Nhó Nhó Nhó/,
    /fakihuyongfakihuyong/,
    /otecungotecung/,
    /Nhó Nhó Nhó Nhó/
  ];
  
  for (const pattern of repetitivePatterns) {
    if (pattern.test(cleanResponse)) {
      console.log('Detected repetitive pattern in JSON, creating fallback JSON');
      throw new Error('Invalid JSON content - repetitive pattern');
    }
  }
  
  // Check for incomplete JSON (missing closing brace)
  if (!cleanResponse.endsWith('}')) {
    console.log('Incomplete JSON detected, creating fallback JSON');
    throw new Error('Invalid JSON structure - incomplete');
  }
  
  return cleanResponse;
}
