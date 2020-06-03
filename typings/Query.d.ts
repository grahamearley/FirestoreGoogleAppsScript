type FilterOp = keyof (typeof FieldFilterOps_ & typeof UnaryFilterOps_);

// A composite filter operator.
type CompositeFilterOp =
  // Unspecified. This value must not be used.
  | 'OPERATOR_UNSPECIFIED'
  // The results are required to satisfy each of the combined filters.
  | 'AND';

// A field filter operator.
type FieldFilterOp =
  // Unspecified. This value must not be used.
  | 'OPERATOR_UNSPECIFIED'
  // Less than. Requires that the field come first in `order_by`.
  | 'LESS_THAN'
  // Less than or equal. Requires that the field come first in `order_by`.
  | 'LESS_THAN_OR_EQUAL'
  // Greater than. Requires that the field come first in `order_by`.
  | 'GREATER_THAN'
  // Greater than or equal. Requires that the field come first in `order_by`.
  | 'GREATER_THAN_OR_EQUAL'
  // Equal.
  | 'EQUAL'
  // Contains. Requires that the field is an array.
  | 'ARRAY_CONTAINS'
  // In. Requires that `value` is a non-empty ArrayValue with at most 10 values.
  | 'IN'
  // Contains any. Requires that the field is an array and `value` is a non-empty ArrayValue with at most 10 values.
  | 'ARRAY_CONTAINS_ANY';

// A unary operator.
type UnaryFilterOp =
  // Unspecified. This value must not be used.
  | 'OPERATOR_UNSPECIFIED'
  // Test if a field is equal to NaN.
  | 'IS_NAN'
  // Test if an expression evaluates to Null.
  | 'IS_NULL';

// A sort direction.
type OrderDirection =
  // Unspecified.
  | 'DIRECTION_UNSPECIFIED'
  // Ascending.
  | 'ASCENDING'
  // Descending.
  | 'DESCENDING';
