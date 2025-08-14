(source) @variable
(let_statement
  (let_keyword) @keyword
  (identifier) @variable)

(function_call
  (identifier) @function.call)
[
  (type_cast_function)
  (to_scalar_function)
  (between_function)
  (datatable_function)
] @function.call

(typed_parameter
  (identifier) @parameter
  )

(function_arguments (identifier) @parameter)
(operation (identifier) @variable)
(compound_expression (identifier) @variable)
(binary_expression (identifier) @variable)
(assignment (identifier) @variable)
(property_identifier (identifier) @variable)
(property_index (identifier) @variable)
(sort_by (identifier) @variable)
(range_operation (identifier) @variable)

(pipe) @punctuation.delimiter
[
  (join_types)
  (sort_keyword)
] @constant
[
  (binary_operator)
  (compound_keywords)
  (operator)
  (range_operator)
  (join_operator)
  (sub_operator)
  (to_operator)
  (mv_apply_operator)
  (sort_keyword)
] @keyword.operator
(string) @string
(number) @number
(bool) @boolean
(null) @constant.builtin
(comment) @comment
(type) @type
[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

[
  ","
] @punctuation.delimiter

; Management command highlighting
(management_command "." @keyword.operator)

; Create table command highlighting
(create_table_command
  "create" @keyword
  "table" @keyword
  (identifier) @type)

; Alter table command highlighting  
(alter_table_command
  "alter" @keyword
  "table" @keyword
  (identifier) @type)

(alter_table_command
  "alter-merge" @keyword
  "table" @keyword
  (identifier) @type)

; Drop table command highlighting
(drop_table_command
  "drop" @keyword
  "table" @keyword
  (identifier) @type)

(drop_table_command
  "drop" @keyword
  "tables" @keyword
  (identifier) @type)

(drop_table_command "ifexists" @keyword.modifier)

; Column definition highlighting
(column_definition
  (identifier) @property
  (type) @type)

; Property list highlighting  
(property_pair
  (identifier) @property
  (string) @string)

(property_pair
  (identifier) @property
  (identifier) @variable)

(property_pair
  (identifier) @property
  (number) @number)

; With clause
(create_table_command "with" @keyword)
(alter_table_command "with" @keyword)
