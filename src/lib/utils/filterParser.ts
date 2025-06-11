/**
 * A function that takes a string and returns true if it meets some criteria.
 */
type Predicate = (key: string) => boolean;

/**
 * Evaluates a single search term against a key.
 * Handles negation with "NOT" and exact matches with quotes.
 * e.g., 'CanLend', '"Full Name"', 'NOT "Residency"'
 * @param term - The individual search term from the query.
 * @param key - The string value from the row data to test against.
 * @returns boolean - True if the key matches the term.
 */
const evaluateTerm = (term: string, key: string): boolean => {
  term = term.trim();
  const lowerKey = key.toLowerCase();

  const isNegated = term.toUpperCase().startsWith('NOT ');
  if (isNegated) {
    term = term.substring(4).trim();
  }

  let searchTerm =
    term.startsWith('"') && term.endsWith('"')
      ? term.substring(1, term.length - 1)
      : term;
  searchTerm = searchTerm.toLowerCase();

  if (!searchTerm) return true; // An empty term shouldn't fail the filter

  const match = lowerKey.includes(searchTerm);

  return isNegated ? !match : match;
};

/**
 * Evaluates an expression composed of terms connected by 'AND'.
 * All terms must evaluate to true for the expression to be true.
 * @param expression - A string containing terms separated by "AND".
 * @param key - The string value from the row data to test against.
 * @returns boolean - True if all terms in the expression match the key.
 */
const evaluateAndExpression = (expression: string, key: string): boolean => {
  const andTerms = expression.split(/ AND /i);
  return andTerms.every((term) => evaluateTerm(term, key));
};

/**
 * Creates a predicate function from a user-defined query string.
 * The query supports AND, OR, NOT operators and quoted phrases.
 * The function respects operator precedence: NOT > AND > OR.
 * @param query - The user's full filter query string.
 * @returns A predicate function that can be used to filter data.
 */
export const createQueryPredicate = (query: string): Predicate => {
  if (!query.trim()) {
    return () => true;
  }

  // Split by OR to handle it as the lowest precedence operator.
  const orExpressions = query.split(/ OR /i);

  return (key: string): boolean => {
    // If any of the AND-expressions are true, the whole query is true.
    return orExpressions.some((expression) =>
      evaluateAndExpression(expression, key),
    );
  };
}; 