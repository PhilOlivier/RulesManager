/**
 * This file contains the logic for parsing a user-defined filter query string
 * and converting it into a predicate function that can be used to filter data.
 * The query language supports AND, OR, NOT operators, parentheses for grouping,
 * and double-quoted phrases for exact matches.
 * This implementation is a direct adaptation of a previously successful parser.
 */

type Predicate = (key: string) => boolean;

type Token = {
  type: 'AND' | 'OR' | 'NOT' | 'TERM' | 'LPAREN' | 'RPAREN';
  value?: string;
};

const tokenize = (filterText: string): Token[] => {
  const tokens: Token[] = [];
  const regex = /\s*(\bAND\b|\bOR\b|\bNOT\b|"(?:\\"|[^"])*"|\(|\)|\S+)\s*/gi;
  let match;
  while ((match = regex.exec(filterText)) !== null) {
    if (match[1]) {
      const tokenStr = match[1];
      const upperToken = tokenStr.toUpperCase();
      if (upperToken === 'AND') tokens.push({ type: 'AND' });
      else if (upperToken === 'OR') tokens.push({ type: 'OR' });
      else if (upperToken === 'NOT') tokens.push({ type: 'NOT' });
      else if (tokenStr === '(') tokens.push({ type: 'LPAREN' });
      else if (tokenStr === ')') tokens.push({ type: 'RPAREN' });
      else tokens.push({ type: 'TERM', value: tokenStr });
    }
  }
  return tokens;
};

const evaluateTerm = (key: string, term: string): boolean => {
  const cleanTerm = term.startsWith('"') && term.endsWith('"')
      ? term.substring(1, term.length - 1)
      : term;
  return key.toLowerCase().includes(cleanTerm.toLowerCase());
};

const parseExpression = (tokens: Token[], key: string, index: { value: number }): boolean => {
  // Precedence order: Parentheses, NOT, AND, OR
  // We will build a structure that can be evaluated.
  // This is a Pratt Parser style implementation.

  const parsePrimary = (): boolean => {
    let token = tokens[index.value];
    if (!token) return false;

    if (token.type === 'NOT') {
      index.value++;
      return !parsePrimary();
    }
    
    if (token.type === 'LPAREN') {
      index.value++;
      const result = parseExpression(tokens, key, index);
      if (tokens[index.value]?.type === 'RPAREN') {
        index.value++;
      }
      return result;
    }

    if (token.type === 'TERM') {
      index.value++;
      return evaluateTerm(key, token.value!);
    }

    return false; // Should not be reached with valid syntax
  };

  const parseAnd = (): boolean => {
    let left = parsePrimary();
    while (tokens[index.value]?.type === 'AND') {
      index.value++;
      const right = parsePrimary();
      left = left && right;
    }
    return left;
  };
  
  let left = parseAnd();
  while (tokens[index.value]?.type === 'OR') {
    index.value++;
    const right = parseAnd();
    left = left || right;
  }

  return left;
};

export const createQueryPredicate = (query: string): Predicate => {
  if (!query.trim()) {
    return () => true;
  }

  const tokens = tokenize(query);
  const hasTerms = tokens.some(t => t.type === 'TERM');
  if (!hasTerms && tokens.length > 0) {
    return () => false; // Invalid query with only operators
  }
  
  return (key: string): boolean => {
    if (tokens.length === 0) return true;
    try {
      const index = { value: 0 };
      const result = parseExpression(tokens, key, index);
      // If not all tokens were consumed, the syntax is likely invalid
      return index.value === tokens.length ? result : false;
    } catch (e) {
      console.error(e);
      return false; // Fail safe on error
    }
  };
}; 