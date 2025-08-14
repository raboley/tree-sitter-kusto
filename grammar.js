module.exports = grammar({
  name: "kusto",

  extras: ($) => [/\s/, $.comment],
  rules: {
    source_file: ($) =>
      repeat1($._statement),
    _statement: ($) => choice($.let_statement, $.management_command, $._tabular_or_sub_tabular),

    let_statement: ($) =>
      seq($.let_keyword, $.identifier, "=", $._tabular_or_expression),
    _tabular_or_expression: ($) =>
      choice($._tabular_or_sub_tabular, $._expression),

    comment: ($) => seq("//", /.*/),
    let_keyword: ($) => "let",
    _tabular_or_sub_tabular: ($) =>
      choice(
        seq("(", $.tabular_expression, ")", repeat($.operation)),
        $.tabular_expression,
      ),
    tabular_expression: ($) =>
      seq(
        choice($.source, $.function_call, $.range_operation),
        repeat($.operation),
      ),
    source: ($) => prec(2, $.identifier),
    operation: ($) => seq($.pipe, $._operation_details),
    range_operation: ($) =>
      seq(
        $.range_operator,
        $.identifier,
        $.range_operator,
        $._tabular_or_expression,
        $.to_operator,
        $._tabular_or_expression,
        $.range_operator,
        choice($.number, $.timespan),
      ),
    range_operator: ($) => choice("range", "from", "step"),
    _operation_details: ($) =>
      choice(
        seq($.operator, $._expressions),
        seq(
          $.operator,
          optional($._expressions),
          $.sub_operator,
          $._expressions,
        ),
        $._mv_apply_operation,
        $._join_operation,
      ),
    _join_operation: ($) =>
      seq(
        $.join_operator,
        optional(seq($.join_operator, "=", $.join_types)),
        choice($.source, seq("(", $.tabular_expression, ")")),
        $.sub_operator,
        $._expressions,
      ),
    join_types: ($) =>
      choice(
        "innerunique",
        "inner",
        "leftouter",
        "leftsemi",
        "leftanti",
        "rightouter",
        "fullouter",
        "anti",
        "leftantisemi",
        "rightanti",
        "rightantisemi",
      ),

    _mv_apply_operation: ($) =>
      seq(
        $.mv_apply_operator,
        $._expressions,
        optional(seq($.to_operator, $._type_cast)),
        $.sub_operator,
        $._apply_sub_operation,
      ),

    _type_cast: ($) => seq($.type_cast_function, "(", $.type, ")"),
    type_cast_function: ($) => "typeof",
    _apply_sub_operation: ($) =>
      seq("(", $._operation_details, repeat($.operation), ")"),
    pipe: ($) => /[|]/,
    mv_apply_operator: ($) => choice("mv-apply"),
    operator: ($) =>
      choice(
        "order by",
        "project",
        "project-away",
        "distinct",
        "union",
        "where",
        "summarize",
        "extend",
        "evaluate",
        "mv-expand",
        "bag_unpack",
        "sort",
        "take",
      ),
    sub_operator: ($) => choice("by", "on"),
    to_operator: ($) => "to",
    join_operator: ($) => choice("join", "kind"),
    _expressions: ($) =>
      choice(seq($._expression_type, repeat(seq(",", $._expression_type)))),
    _expression_type: ($) => choice($.assignment, $._non_assignment),
    assignment: ($) => seq($.identifier, "=", $._non_assignment),
    _non_assignment: ($) =>
      choice($._expression, $._binary_compound_expression),
    _expression: ($) => prec.left(1, $._expression_options),
    _binary_compound_expression: ($) =>
      choice($._binary_or_expression, $.compound_expression),
    _binary_or_expression: ($) =>
      prec(1, choice($._expression, $.binary_expression)),

    compound_expression: ($) =>
      seq(
        $._binary_or_expression,
        repeat1(seq($.compound_keywords, $._binary_or_expression)),
      ),
    _expression_options: ($) =>
      prec(
        1,
        choice(
          $.number,
          $.timespan,
          $.string,
          $.function_call,
          $.datatable,
          $.identifier,
          $.func,
          $.unary_expression,
          $.array,
          $.property_identifier,
          $.property_index,
          $._sub_expression,
          $.bool,
          $.null,
          $.sort_by,
          $.dynamic_list,
          $.to_scalar_call,
          $.object,
        ),
      ),

    _sub_expression: ($) => prec(1, seq("(", $._non_assignment, ")")),
    binary_expression: ($) =>
      prec(1, seq($._expression, choice($._binary_comparison, $.between_call))),
    _binary_comparison: ($) =>
      seq(
        choice(
          "*",
          "+",
          "-",
          "/",
          "==",
          "<",
          ">",
          "<=",
          ">=",
          "!=",
          $.binary_operator,
          seq("!", $.binary_operator),
        ),
        $._expression,
      ),
    binary_operator: ($) => choice("in", "has", "contains", "startswith"),
    compound_keywords: ($) => choice("and", "or"),
    unary_expression: ($) => choice(prec(1, seq("not", $._expression))),
    typed_parameter: ($) => seq($.identifier, ":", $.type),
    sort_by: ($) => seq($._expression, $.sort_keyword),
    sort_keyword: ($) => choice("desc", "asc"),
    type: ($) =>
      choice(
        "string",
        "int",
        "bool",
        "dynamic",
        "array",
        "guid",
        "datetime",
        "long",
        "real",
        "timespan",
        "decimal",
      ),
    number: ($) => /-?[0-9]+/,
    bool: ($) => choice("true", "false"),
    null: ($) => "null",
    string: ($) => choice($._double_quote_string, $._single_quote_string),
    _double_quote_string: ($) => /"[^"]*"/,
    _single_quote_string: ($) => /'[^']*'/,
    timespan: ($) =>
      seq($.number, choice("d", "h", "m", "s", "ms", "us", "ns")),
    identifier: ($) => /\$?[a-zA-Z_][a-zA-Z0-9_]*/,
    property_identifier: ($) => prec.left(2, seq($._expression, seq(".", $.identifier))),
    property_index: ($) => seq($._expression, "[", $._expression, "]"),
    dynamic_list: ($) => seq("(", $._expressions, ")"),
    array: ($) => seq("[", $._expressions, "]"),
    object: ($) =>
      seq("{", seq($.key_value_pair, repeat(seq(",", $.key_value_pair)), "}")),
    func: ($) =>
      seq(
        $._function_params,
        "{",
        optional(choice($._tabular_or_sub_tabular, $._expressions)),
        "}",
      ),
    _function_params: ($) =>
      seq("(", $.typed_parameter, repeat(seq(",", $.typed_parameter)), ")"),
    function_call: ($) =>
      seq($.identifier, "(", optional($.function_arguments), ")"),
    function_arguments: ($) => choice($._expressions),
    to_scalar_call: ($) =>
      seq($.to_scalar_function, "(", $._tabular_or_sub_tabular, ")"),
    to_scalar_function: ($) => "toscalar",
    between_call: ($) =>
      seq($.between_function, "(", $._expression, "..", $._expression, ")"),
    between_function: ($) => "between",
    datatable: ($) =>
      prec(1, seq($.datatable_function, $._function_params, $.array)),
    datatable_function: ($) => "datatable",
    key_value_pair: ($) => seq($._expression, ":", $._expression),
    
    // Management commands (admin commands) - start with dot (.)
    // Performance: Using choice() with specific command recognition for O(1) lookup
    management_command: ($) => seq(
      ".",
      choice(
        $.create_table_command,
        $.alter_table_command,
        $.drop_table_command
      )
    ),

    // Admin command implementations - optimized for common patterns
    // Performance: Column definitions use repeat() for efficient parsing of variable-length lists
    create_table_command: ($) => seq(
      "create", "table", $.identifier, 
      "(", 
      optional(seq($.column_definition, repeat(seq(",", $.column_definition)))),
      ")",
      optional(seq("with", "(", $.property_list, ")"))
    ),

    alter_table_command: ($) => choice(
      seq("alter", "table", $.identifier, 
          "(", 
          optional(seq($.column_definition, repeat(seq(",", $.column_definition)))),
          ")",
          optional(seq("with", "(", $.property_list, ")"))),
      seq("alter-merge", "table", $.identifier, 
          "(", 
          optional(seq($.column_definition, repeat(seq(",", $.column_definition)))),
          ")",
          optional(seq("with", "(", $.property_list, ")")))
    ),

    drop_table_command: ($) => choice(
      seq("drop", "table", $.identifier, optional("ifexists")),
      seq("drop", "tables", "(", 
          seq($.identifier, repeat(seq(",", $.identifier))), 
          ")", 
          optional("ifexists"))
    ),

    column_definition: ($) => seq($.identifier, ":", $.type),
    property_list: ($) => seq($.property_pair, repeat(seq(",", $.property_pair))),
    property_pair: ($) => seq($.identifier, "=", choice($.string, $.identifier, $.number)),
  },
});
