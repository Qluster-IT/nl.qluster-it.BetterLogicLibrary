export = Json;
declare class Json {
    /**
     *
     * @param {import('./d.ts/json.toExcel').SheetData|import('./d.ts/json.toExcel').SheetData[]} data
     * @param {import('./d.ts/json.toExcel').WithSchemaOptions|import('./d.ts/json.toExcel').WithSchemaOptionsMultipleSheets} options
     */
    static toExcel(data: import('./d.ts/json.toExcel').SheetData | import('./d.ts/json.toExcel').SheetData[], options: import('./d.ts/json.toExcel').WithSchemaOptions | import('./d.ts/json.toExcel').WithSchemaOptionsMultipleSheets): Promise<any>;
    static toCsv(data: any, options: any): Promise<any>;
}
//# sourceMappingURL=json.d.ts.map