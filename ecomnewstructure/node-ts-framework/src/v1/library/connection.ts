import dateFormat from "dateformat";
import { Pool, types } from "pg";

export class connection {
	static connection: any;

	/**
	 * Create connection by Singletone method. If connection is not created, then only new connection will create.
	 */
	async getConnection() {
		if (!connection.connection) {
			let result = await this.connect();
			if (!result) return false;
		}
		return connection.connection;
	}

	/**
	 * This function will connect DB with required DB credentials.
	 */
	async connect() {
		connection.connection = new Pool({
			connectionString: process.env.DATABASE_URL
		});

		try {
			/* Convert "timestamp without timezone" into local timezone. eg. 2019-01-23T10:25:33.000Z --> 2019-01-23 15:55:33 */
			var datetimeParseFn = function (val: any) {
				return val === null ? null : dateFormat(val, 'yyyy-mm-dd HH:MM:ss');
			}
			/* Convert "date" into local date without timezone. eg. 2019-10-28T18:30:00.000Z --> 2019-10-29 */
			var dateParseFn = function (val: any) {
				return val === null ? null : dateFormat(val, 'yyyy-mm-dd');
			}
			types.setTypeParser(types.builtins.TIMESTAMP, datetimeParseFn);
			types.setTypeParser(types.builtins.DATE, dateParseFn);

			let result = await connection.connection.connect();
			if (result) {
				console.log('Database Connected!');
			}
			return result;
		} catch (error) {
			console.log(error);
			connection.connection = false;
			return false;
		}
	}
}