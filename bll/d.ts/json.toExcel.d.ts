// Some users have requested exporting `ValueType` type.
// https://gitlab.com/catamphetamine/write-excel-file/-/issues/30
export type ValueType =
	String |
	Date |
	Number |
	Boolean |
	'Formula';

// It's unclear how to express something like `type? = Type` in TypeScript.
// So instead it's defined as `type?: TypeOfType<Type>`.
// https://gitlab.com/catamphetamine/write-excel-file/-/issues/4#note_715204034
// https://www.typescriptlang.org/docs/handbook/2/conditional-types.html
type TypeOfType<Type> =
	Type extends String
		? StringConstructor
		: Type extends Date
			? DateConstructor
			: Type extends Number
				? NumberConstructor
				: Type extends Boolean
					? BooleanConstructor
					: 'Formula'; //(Type == 'Formula'
						// ? 'Formula'
						// : never)

type BorderStyle =
	'hair' |
	'dotted' |
	'dashDotDot' |
	'dashDot' |
	'dashed' |
	'thin' |
	'mediumDashDotDot' |
	'slantDashDot' |
	'mediumDashDot' |
	'mediumDashed' |
	'medium' |
	'double' |
	'thick';

type FontWeight = 'bold';

type FontStyle = 'italic';

type Color = string;

interface CellStyle {
	align?: 'left' | 'center' | 'right';
	alignVertical?: 'top' | 'center' | 'bottom';
	height?: number;
	span?: number;
	rowSpan?: number;
	wrap?: boolean;
	fontFamily?: string;
	fontSize?: number;
	fontWeight?: FontWeight;
	fontStyle?: FontStyle;
	color?: Color;
	backgroundColor?: Color;
	borderColor?: Color;
	borderStyle?: BorderStyle;
	leftBorderColor?: Color;
  leftBorderStyle?: BorderStyle;
  rightBorderColor?: Color;
  rightBorderStyle?: BorderStyle;
  topBorderColor?: Color;
  topBorderStyle?: BorderStyle;
  bottomBorderColor?: Color;
  bottomBorderStyle?: BorderStyle;
}

interface CellProps extends CellStyle {
	// TypeScript interprets `type?: Type` as "`type` is an instance of `Type`",
	// while in reality the definition of `type` is "`type` is `Type.constructor`".
	type?: TypeOfType<Object>;

	// A simpler (loose) variant:
	// type?: ValueType;

	// Data output format (for numbers or dates).
	format?: string;
}

interface CellOfType<Type> extends CellProps {
	value?: Type;
}

export type Cell = CellOfType<ValueType> | null | undefined;

export type Row = Cell[];

export type SheetData = Row[];

// Some users have requested exporting `ColumnSchema` type.
// https://gitlab.com/catamphetamine/write-excel-file/-/issues/30
export interface ColumnSchema extends CellProps {
	// Column title.
	column?: string;
	// Column width (in characters).
	width?: number;
	// Cell value getter.
	value(object: Object): Object | undefined | null;
}

export type Schema = ColumnSchema[];

type Column = {
	width?: number;
};

type Orientation = 'landscape';

export type Columns = Column[];

export interface CommonOptions {
  headerStyle?: CellStyle;
  fontFamily?: string;
  fontSize?: number;
  orientation?: Orientation;
  stickyColumnsCount?: number;
  stickyRowsCount?: number;
  dateFormat?: string;
  buffer?: boolean;
}

// With Schema.

interface WithSchemaCommonOptions extends CommonOptions {
	schema: Schema | Schema[];
	fileName?: string;
}

export interface WithSchemaOptions extends WithSchemaCommonOptions {
	sheet?: string;
}

export interface WithSchemaOptionsMultipleSheets extends WithSchemaCommonOptions {
	sheets?: string[];
}

declare function toExcel<Object>(
	objects: Object[] | Object[][],
	options: WithSchemaOptions | WithSchemaOptionsMultipleSheets
) : Promise<void>;

// Without Schema.

interface WithoutSchemaCommonOptions extends CommonOptions {
	columns?: Columns | Columns[];
	fileName?: string;
}

interface WithoutSchemaOptions extends WithoutSchemaCommonOptions {
	sheet?: string;
}

interface WithoutSchemaOptionsMultipleSheets extends WithoutSchemaCommonOptions {
	sheets?: string[];
}

declare function toExcel(
	data: SheetData | SheetData[],
	options: WithoutSchemaOptions | WithoutSchemaOptionsMultipleSheets
) : Promise<void>;

export default toExcel;