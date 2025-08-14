# Tree-sitter-kusto

A tree-sitter grammar for the Kusto Query Language (KQL) and Kusto management commands.

## Features

This grammar supports:

### Query Language
- Basic tabular expressions and data sources
- Operators: `where`, `project`, `extend`, `summarize`, `join`, etc.
- Functions calls and expressions
- Let statements and variables
- Complex data types and literals

### Management Commands (Admin Commands)
- **Create Table**: `.create table` with column definitions and optional properties
- **Alter Table**: `.alter table` and `.alter-merge table` for schema modifications
- **Drop Table**: `.drop table` and `.drop tables` for single/multiple table deletion

## Grammar Architecture

### Management Commands Integration

The grammar extends the base `_statement` rule to include `management_command` alongside existing query statements:

```javascript
_statement: ($) => choice($.let_statement, $.management_command, $._tabular_or_sub_tabular)
```

### Management Command Structure

Management commands follow this pattern:
1. Start with a dot (`.`) to distinguish from queries
2. Followed by specific command implementations
3. Support standard Kusto admin command syntax

```javascript
management_command: ($) => seq(
  ".",
  choice(
    $.create_table_command,
    $.alter_table_command, 
    $.drop_table_command
  )
)
```

### Performance Considerations

- Uses `choice()` for O(1) command type lookup
- Optimizes column definitions with `repeat()` for variable-length lists
- Minimal parsing overhead for query-only files
- Efficient mixed content parsing (queries + admin commands)

## Supported Management Commands

### Create Table
```kusto
.create table TableName (
    ColumnName: DataType,
    AnotherColumn: DataType
) with (docstring="Description", folder="FolderName")
```

### Alter Table
```kusto
.alter table TableName (
    NewColumn: DataType,
    ExistingColumn: DataType
)

.alter-merge table TableName (
    AdditionalColumn: DataType  
)
```

### Drop Table
```kusto
.drop table TableName
.drop table TableName ifexists
.drop tables (Table1, Table2, Table3) ifexists
```

## Testing

The grammar includes comprehensive corpus tests in `test/corpus/`:
- `admin-commands.txt` - Management command parsing tests
- `statements.txt` - Query language parsing tests

Run tests with:
```bash
tree-sitter test
```

## Development

To modify the grammar:
1. Edit `grammar.js`
2. Run `tree-sitter generate` to compile
3. Run `tree-sitter test` to validate changes
4. Update corpus tests as needed

## Integration

This grammar is designed to work with:
- Zed editor extensions for KQL syntax highlighting
- Language servers requiring KQL parsing
- Development tools working with Kusto/Azure Data Explorer files

## File Support

The grammar handles mixed content files containing both:
- KQL queries (tabular expressions, let statements, etc.)
- Management commands (admin operations)
- Comments and complex expressions

This allows for comprehensive .kql file support in development environments.