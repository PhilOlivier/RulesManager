import { createQueryPredicate } from './filterParser';

describe('filterParser - createQueryPredicate', () => {
  // Test Data
  const key_canLend = 'CanLend';
  const key_residency = 'Residency';
  const key_canLend_and_residency = 'CanLend and Residency';
  const key_miscellaneous = 'Miscellaneous';

  // Basic Tests
  it('should return a function that always returns true for an empty query', () => {
    const predicate = createQueryPredicate('');
    expect(predicate(key_canLend)).toBe(true);
  });

  it('should match a single term, case-insensitively', () => {
    const predicate = createQueryPredicate('canlend');
    expect(predicate(key_canLend)).toBe(true);
    expect(predicate(key_residency)).toBe(false);
  });

  // NOT Operator
  it('should handle a single NOT term', () => {
    const predicate = createQueryPredicate('NOT residency');
    expect(predicate(key_canLend)).toBe(true);
    expect(predicate(key_residency)).toBe(false);
  });

  // Quoted Phrases
  it('should match an exact quoted phrase', () => {
    const predicate = createQueryPredicate('"CanLend and Residency"');
    expect(predicate(key_canLend_and_residency)).toBe(true);
    expect(predicate(key_canLend)).toBe(false);
  });

  it('should handle NOT with a quoted phrase', () => {
    const predicate = createQueryPredicate('NOT "CanLend and Residency"');
    expect(predicate(key_canLend_and_residency)).toBe(false);
    expect(predicate(key_canLend)).toBe(true);
  });

  // AND Operator
  it('should handle two terms with AND', () => {
    const predicate = createQueryPredicate('canlend AND residency');
    expect(predicate(key_canLend_and_residency)).toBe(true);
    expect(predicate(key_canLend)).toBe(false);
    expect(predicate(key_miscellaneous)).toBe(false);
  });

  it('should handle AND with a NOT operator', () => {
    const predicate = createQueryPredicate('miscellaneous AND NOT canlend');
    expect(predicate('miscellaneous data')).toBe(true);
    expect(predicate('miscellaneous CanLend data')).toBe(false);
  });

  // OR Operator
  it('should handle two terms with OR', () => {
    const predicate = createQueryPredicate('canlend OR residency');
    expect(predicate(key_canLend)).toBe(true);
    expect(predicate(key_residency)).toBe(true);
    expect(predicate(key_miscellaneous)).toBe(false);
  });

  // Complex Queries
  it('should handle a combination of AND, OR, and NOT', () => {
    const predicate = createQueryPredicate('misc OR (canlend AND NOT residency)');
    // This will be parsed as: ('misc') OR ('canlend' AND 'NOT residency')
    expect(predicate(key_miscellaneous)).toBe(true); // Matches 'misc'
    expect(predicate(key_canLend)).toBe(true); // Matches 'canlend' and 'NOT residency'
    expect(predicate(key_canLend_and_residency)).toBe(false); // Fails 'NOT residency'
    expect(predicate(key_residency)).toBe(false); // Fails 'canlend'
  });

  it('should prioritize AND over OR', () => {
    const predicate = createQueryPredicate('residency OR canlend AND miscellaneous');
    // This will be parsed as: ('residency') OR ('canlend' AND 'miscellaneous')
    expect(predicate(key_residency)).toBe(true);
    expect(predicate('canlend data')).toBe(false);
    expect(predicate('miscellaneous data')).toBe(false);
    expect(predicate('canlend and miscellaneous data')).toBe(true);
  });

  // Edge Cases
  it('should handle extra whitespace gracefully', () => {
    const predicate = createQueryPredicate('  canlend   OR   residency  ');
    expect(predicate(key_canLend)).toBe(true);
    expect(predicate(key_residency)).toBe(true);
  });

  it('should handle a query with only operators as a true predicate', () => {
    const predicate = createQueryPredicate('AND OR NOT');
    // The parser splits by OR, then by AND, leaving empty terms which evaluate to true.
    expect(predicate(key_canLend)).toBe(true);
  });
}); 