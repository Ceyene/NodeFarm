//core modules
const fs = require('fs'); //we require fs -> file system, it returns an object 
const http = require('http'); //this module gives us network capability
const url = require('url'); //this module allows us to parse parameters from the url
//3rd party modules
const slugify = require('slugify'); //allows us to create slugs (slug: the last part of a url, string that identifies the resource displayed by the website)
//my own modules
const replaceTemplate = require('./modules/replaceTemplate');

////////////////////////////////////////////////////////////////////
// FILES

//BLOCKING, SYNCHRONOUS WAY
// //read data from a file and put it into a constant
// const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
// //console.log(textIn);

// const textOut = `This is what we know about the avocado: ${textIn}.\nCreated on ${Date.now()}`; 
// //Date.now will give a timestamp in miliseconds
// fs.writeFileSync('./txt/output.txt', textOut);
// console.log('File written successfully!');

//NON BLOCKING, ASYNCHRONOUS WAY
// fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
//     if(err){
//         return console.log('Error 1!');
//     }
//     fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
//         if(err){
//             return console.log('Error 2!');
//         }
//         console.log(data2);
//         fs.readFile(`./txt/append.txt`, 'utf-8', (err, data3) => {
//             if(err){
//                 return console.log('Error 3!');
//             }
//             console.log(data3);

//             fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf-8', (err) => {
//                 if(err){
//                     return console.log('Error!');
//                 } else {
//                     console.log('Your file has been written! :D ');
//                 }
//             })
//         });
//     });
// });
// console.log('Will read file...');
//Callback Hell... too many callbacks!

////////////////////////////////////////////////////////////////////
// SERVER

//TOP LEVEL CODE: this code is outside the callbacks and will only be executed once
const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObject = JSON.parse(data);

const slugs = dataObject.map(prod => slugify(prod.productName, {lower: true}));
console.log(slugs);

//this code will be executed each time that there is a new request
const server = http.createServer((req, res) => {
    //we parse variables from the url to render the product page
    const {query, pathname} = url.parse(req.url, true);

    //Overview page
    if(pathname === '/' || pathname === '/overview') {
        res.writeHead(200, {'Content-type': 'text/html'});
        //we loop through the data array of objects to replace the placeholders
        const cardsHtml = dataObject.map(card => replaceTemplate(tempCard, card)).join('');
        const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
        //we load the template overview
        res.end(output);

    //Product page
    } else if(pathname === '/product'){
        res.writeHead(200, {'Content-type': 'text/html'});
        //we figure out which is the product we want to display
        const product = dataObject[query.id];
        const output = replaceTemplate(tempProduct, product);
        res.end(output);
    
    //API
    } else if(pathname === '/api'){
        res.writeHead(200, {'Content-type': 'application/json'});
        res.end(data);
    
    //Not Found page
    } else {
        res.writeHead(404, {
            'Content-Type': 'text/html',
            'my-own-header': 'hello-world'
        });
        res.end('<h1>404 - Page Not Found</h1>');
    }

});

server.listen(8000, '127.0.0.1', () => {
    console.log('Listening to requests on port 8000...');
});