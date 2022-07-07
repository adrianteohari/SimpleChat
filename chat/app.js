const cookieParser=require('cookie-parser');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
app.use(cookieParser());
const port = 6789;
app.use(session({secret: "secret"}));

let rezult="";


app.set('view engine', 'ejs');

app.use(expressLayouts);

app.use(express.static('public'))

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', (req, res) => res.render('index',{utilizator:req.cookies.utilizator, sesiune:req.session.username, rezultat:rezult}));




app.get('/autentificare',(req, res)=>{
	res.render('autentificare',{msgErr: req.cookies.mesajEroare, sesiune:req.session.username});		
});


function getPassword(username)
{
	var mysql = require('mysql');
	var rezultat="";

	var con = mysql.createConnection({
		host: "localhost",
		user: "root",
		password: "root",
		database: "chat"
	});
	con.connect(function(err) {
		if (err) throw err;
		console.log("Connected!");
		con.query("SELECT password FROM utilizatori WHERE username= '"+username+"';", function (err, result, fields) {
			if (err) throw err;
			console.log(result);
			rezultat=rezultat+result;
			console.log(rezultat);
		  });
		});
		return rezultat;
}
app.post('/verificare-autentificare', (req, res) => {
	/*
	var mysql = require('mysql');
	let rezultat="-";

	var con = mysql.createConnection({
		host: "localhost",
		user: "root",
		password: "root",
		database: "chat"
	});
	con.connect(function(err) {
		if (err) throw err;
		console.log("Connected!");
		console.log(req.body.numeutilizator);
		con.query("SELECT username FROM utilizatori WHERE username= '"+req.body.numeutilizator+"';", function (err, result, fields) {
			if (err) throw err;
			console.log(result);
			rezultat=result;
			console.log(rezultat);
		  });
		});
	if(rezultat=="-")
	{
		res.cookie("mesajEroare","Eroare la conectare!");
		res.redirect("/autentificare");
	}
	else{
		if(req.body.password==getPassword(req.body.numeutilizator))
		{
			res.cookie("utilizator","Bine ai venit, "+req.body.numeutilizator);
			req.session.loggedIn = true;
			req.session.username = req.body.numeutilizator;
			req.session.cos=[];
			res.redirect('/');
			console.log(req.cookies);
		}
		else
		{
			res.cookie("mesajEroare","Eroare la conectare!");
			res.redirect("/autentificare");
		}
	}
	*/
	if(((req.body.numeutilizator=="Adrian")&&(req.body.password=="parola"))||((req.body.numeutilizator=="admin")&&(req.body.password=="admin")))
	{

		res.cookie("utilizator","Bine ai venit, "+req.body.numeutilizator);
		req.session.loggedIn = true;
		req.session.username = req.body.numeutilizator;
		req.session.cos=[];
		res.redirect('/');
		console.log(req.cookies);
	}
	else{
		res.cookie("mesajEroare","Eroare la conectare!");
		res.redirect("/autentificare");
	}
});

app.post('/create-account', (req, res) => {

	var mysql = require('mysql');
	var rezultat="-";

	var con = mysql.createConnection({
		host: "localhost",
		user: "root",
		password: "root",
		database: "chat"
	});
	con.connect(function(err) {
		if (err) throw err;
		console.log("Connected!");
		con.query("SELECT username FROM utilizatori WHERE username= '"+req.body.username+"';", function (err, result, fields) {
			if (err) throw err;
			console.log(result);
			rezultat=result;
		  });
		});
	console.log(rezultat);
	if(rezultat=="-")
	{
		Inregistrare(req.body.username, req.body.parola);
		res.redirect("/autentificare");
		
	}
	else{
		res.send("Nume deja existent!");
	}
});

function Inregistrare(username, password)
{
	var mysql = require('mysql');
	var con = mysql.createConnection({
		host: "localhost",
		user: "root",
		password: "root",
		database: "chat"
	});
	con.connect(function(err) {
		if (err) throw err;
		console.log("Connected!");
		var sql = "INSERT INTO utilizatori (username, password) VALUES ("+"'"+username+"'"+","+"'"+password+"'"+");";
	con.query(sql, function (err, result) {
			if (err) throw err;
			console.log("records inserted");
		});
	});

}
app.post('/logout', (req, res) => {
	req.session.destroy((err)=>{})
	res.redirect("/autentificare");
});


app.get('/select-bd', (req, res)=> {
	var mysql = require('mysql');

	var con = mysql.createConnection({
		host: "localhost",
		user: "root",
		password: "root",
		database: "chat"
	});
	con.connect(function(err) {
		if (err) throw err;
		console.log("Connected!");
		con.query("SELECT * FROM mesaje_global", function (err, result, fields) {
			if (err) throw err;
			console.log(result);
			rezult=result;
		  });
		});
		res.redirect("/");
});



app.get('/admin', (req, res) => {
	if(req.session.username=="admin")
	{
	res.render('admin',{sesiune:req.session.username});
	}
	else
	{
		res.send("Only admins have acces to this page!");
	}
});

app.post('/admin-reset', (req, res) => {
	if(req.session.username=="admin")
	{
		var pret =parseInt(req.body.pret);
		var mysql = require('mysql');

		var con = mysql.createConnection({
			host: "localhost",
			user: "root",
			password: "root",
			database: "chat"
		});
		con.connect(function(err) {
			if (err) throw err;
			console.log("Connected!");
			var sql = "DELETE FROM mesaje_global;";
			con.query(sql, function (err, result) {
    			if (err) throw err;
			});
		});
		res.redirect("/");
	}
	else
	{
		res.send("Only admins have acces to this command!");
	}
});

app.post('/chat-send', (req, res) => {
	var name="Anonim";
	if(req.session.username)
	{
		name=req.session.username;
	}
		var mysql = require('mysql');

		var con = mysql.createConnection({
			host: "localhost",
			user: "root",
			password: "root",
			database: "chat"
		});
		con.connect(function(err) {
			if (err) throw err;
			console.log("Connected!");
			var sql = "INSERT INTO mesaje_global (nume, mesaj) VALUES ("+"'"+name+"'"+","+"'"+req.body.mesaj+"'"+");";
		con.query(sql, function (err, result) {
    			if (err) throw err;
    			console.log("records inserted");
			});
		});
		res.redirect("/select-bd");
});


app.listen(port, () => console.log(`Serverul rulează la adresa http://localhost:`));
