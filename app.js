const cookieParser = require("cookie-parser");
const createError = require("http-errors");
const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const routeGeneratePDFReport = require("./dist/generate-pdf-report");
const {Signup,Login,forgotPassword,resetPassword} = require("./dist/controller/user.controller");
const { connectToDB } = require("./dist/config/Database");
const {CronJob } = require("cron");

dotenv.config();

connectToDB();

// Instantiate the app
const app = express();

// Body parsing middleware
app.use(express.static(__dirname + 'public')); // Serves resources from public folder
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

//enable CORS (for testing only -remove in production/deployment)
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Type, Accept');
	next();
});


const job = new CronJob(
	'*/1 * * * *',
	function () {
		console.log('Cron job running at ' + new Date());
	},
	null,
	true
);


job.start();

// Routes
app.use("/api/generate-pdf-report", routeGeneratePDFReport);
app.post("/api/register",Signup)
app.post("/api/login",Login);
app.post("/api/forget-password",forgotPassword);
app.post("/api/reset-password",resetPassword);


// Catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
	// Set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// Render the error page
	res.status(err.status || 500);
	res.render("error");
});

module.exports = app;
