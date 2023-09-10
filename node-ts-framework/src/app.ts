import cors from "cors";
import dotenv from 'dotenv';
import express from "express";
import fileUpload from 'express-fileupload';
import path from "path";

/*
 *  Create express server instance.
 */
const app = express();

/*
 * Express configuration
 */
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: false }));
app.use(cors());
app.use(fileUpload({
	createParentPath: true,
}));

/**
 * env variables Configuration
 */
const result = dotenv.config({ path: path.join(__dirname, '../', '.env') });
if (result.error) throw result.error;

/**
 * Express Server
 */
let PORT: any = process.env.PORT || 3000;

/* HTTP Configutation */
var server = app.listen(PORT, function () {
	console.log('Example app listening on port ' + PORT + '!');
});

/*
 * Primary app routes.
 */
app.use('/v1', require('./v1'));

module.exports = server;

