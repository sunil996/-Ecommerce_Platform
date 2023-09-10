import { connection } from './connection';

export class db {
	public table: string = '';
	private connection: any = '';
	public query: string = '';
	public uniqueField: string = '';
	public where: string = '';
	public orderby: string = '';
	public rpp: number = 20;
	public page: number = 1;
	public limit: string = '';
	public url: string = '';
	public totalRecords: number = 0;

	constructor() {

	}

	/**
	 * This function will execute given Query with checking of DB connection. It will return appropriate type of response in case of insert, update, delete, select etc.
	 * @param query query string
	 * @returns array | number
	 */
	async executeQuery(query: string) {
		this.query = query;
		let connectionObj = new connection();

		try {
			this.connection = await connectionObj.getConnection();
			if (!this.connection) {
				throw 'Not connected to database.';
			}

			let result = await this.connection.query(query);
			if (!result) return false;

			if (result.command == "INSERT") {
				if (this.uniqueField != '') return result['rows'][0]['id'];
				else return result['rowCount'];
			}
			else if (result.command == "UPDATE") return result['rowCount'];
			else if (result.command == "REPLACE") return result['rowCount'];
			else if (result.command == "DELETE") return result['rowCount'];
			else return result.rows;
		} catch (error) {
			console.error(error);
			return false;
		}
	}

	/**
	 * Select records from DB with appropriate table and required where conditions. This function will use in SelectRecord, allRecords, list Records function with appropriate parameters.
	 * @param table table name
	 * @param fields fields of DB
	 * @param where where condition
	 * @param orderby order by starting with " ORDER BY"
	 * @param limit limit of DB records required
	 * @returns array
	 */
	select(table: string, fields: string, where: string, orderby: string, limit: string) {
		let query = 'SELECT ' + fields + ' FROM ' + table + ' ' + where + ' ' + orderby + ' ' + limit;
		
		return this.executeQuery(query);
	}

	/**
	 * Insert given data into given table. Given data should be key-value pair object with DB field name and it's value.
	 * @param table table name
	 * @param data array of data
	 */
	insert(table: string, data: any) {
		let columnsArray: any = new Array();
		let valuesArray: any = new Array();

		for (let key in data) {
			columnsArray.push(key);
			valuesArray.push(data[key]);
		}
		let columns: string = columnsArray.join(',');

		for (let i = 0; i < valuesArray.length; i++) {
			valuesArray[i] = String(valuesArray[i]);
			valuesArray[i] = valuesArray[i].replace(/'/g, "\''");
		}
		let values: string = valuesArray.join("','");

		let query = "INSERT INTO " + table + "(" + columns + ") values('" + values + "') RETURNING id";
		return this.executeQuery(query);
	}

	/**
	 * Update given data into table with appropriate where condition.
	 * @param table tablename
	 * @param data key value pair array/object
	 * @param where Where condition
	 */
	update(table: string, data: any, where: string) {
		let updatestring: string = '';

		for (let key in data) {
			if (updatestring !== '') {
				updatestring += ',';
			}
			if (data[key] == null) {
				updatestring += key + "=''";
			} else {
				data[key] = String(data[key]);
				updatestring += key + "='" + data[key].replace(/'/g, "\''") + "'";
			}
		}

		let query = 'UPDATE ' + table + ' SET ' + updatestring + ' ' + where;
		console.log(query);
		
		return this.executeQuery(query);
	}

	/**
	 * Delete record from table with given where condition.
	 * @param table tablename
	 * @param where where condition
	 */
	delete(table: string, where: string) {
		let query = 'DELETE FROM ' + table + ' ' + where;
		return this.executeQuery(query);
	}

	/**
	 * Select given fields from given table with unique id.
	 * @param id table unique id
	 * @param fields DB fields
	 */
	selectRecord(id: number, fields = '*') {
		return this.select(this.table, fields, 'WHERE ' + this.uniqueField + ' = ' + id, this.orderby, this.limit);
	}

	/**
	 * Insert record into DB with given array
	 * @param data key-value pair object
	 */
	insertRecord(data: any) {
		return this.insert(this.table, data);
	}

	/**
	 * Update given data with unique id
	 * @param id unique id
	 * @param data key-value pair array
	 */
	updateRecord(id: number, data: any) {
		return this.update(this.table, data, ' WHERE ' + this.uniqueField + '=' + id);
	}

	/**
	 * Delete record with given unique id
	 * @param id unique id
	 */
	deleteRecord(id: number) {
		return this.delete(this.table, ' WHERE ' + this.uniqueField + '=' + id);
	}

	/**
	 * Return records with given fields and limit.
	 * @param fields DB fields
	 */
	async listRecords(fields = '*') {
		let start = (this.page - 1) * this.rpp;
		let result = await this.select(this.table, fields, this.where, this.orderby, 'LIMIT ' + this.rpp + ' OFFSET ' + start);
		return !result ? [] : result;
	}

	/**
	 * Return all records with given where condition and order by.
	 * @param fields fields
	 */
	async allRecords(fields = '*') {
		let result = await this.select(this.table, fields, this.where, this.orderby, '');
		return !result ? [] : result;
	}

	/**
	 * Get count of records with given condition
	 * @param table tablename
	 * @param uniqueField unique fields
	 * @param where where condition
	 */
	async selectCount(table: string, uniqueField: string, where: string) {
		let query: string = 'SELECT count(' + uniqueField + ') as cnt FROM ' + table + ' ' + where;
		let result: any[] = await this.executeQuery(query);
		return result.length > 0 ? result[0].cnt : 0;
	}

	/**
	 * Get total pages of records with given condition and given rpp.
	 */
	async getTotalPages() {
		this.totalRecords = await this.selectCount(this.table, this.uniqueField, this.where);
		let totalpages: number = Math.ceil(this.totalRecords / this.rpp);
		return totalpages;
	}
}
