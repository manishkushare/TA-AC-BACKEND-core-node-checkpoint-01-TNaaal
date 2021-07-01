const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const server = http.createServer(handleServer);

function handleServer(req,res){
    let parsedURL = url.parse(req.url,true);
    let pathName = parsedURL.pathname;
    let store = "";
    req.on('data',(chunk)=> {
        store+=chunk;
    })
    req.on('end', () => {
        if(req.method === "GET" && (pathName === "/" || pathName === "/index")){
            res.setHeader('Content-Type','text/html');
            fs.createReadStream("./index.html").pipe(res);
        }
        else if(req.method === "GET" && pathName === "/about"){
            res.setHeader('Content-Type','text/html');
            fs.createReadStream("./about.html").pipe(res);
        }
        else if(req.method === "GET" && pathName.includes(".css")){
            res.setHeader('Content-Type','text/css');
            fs.createReadStream(__dirname + pathName).pipe(res);
        }
        else if(req.method === "GET" && (pathName.includes(".png") || pathName.includes(".jpg"))){
            res.setHeader('Content-Type',`text/${pathName.split(".").pop()}`);
            fs.createReadStream(__dirname + pathName).pipe(res);
        }
        else if(req.method === "GET" && pathName === "/contact"){
            res.setHeader('Content-Type','text/html');
            fs.createReadStream("./contact.html").pipe(res);
        }
        else if(req.method === "POST" && pathName === "/contact"){
            let contactPath = __dirname + "/contact";

            let parsedData = querystring.parse(store)
            console.log(parsedData," :before");
            parsedData =  Object.keys(parsedData).reduce((acc,cv)=> {
                
                if(cv === "age"){
                  acc[cv] = Number(parsedData[cv]);
                }
                else{
                  acc[cv] = parsedData[cv];
                }
                return acc;
              },{})
            console.log(parsedData, " :after");
            let username = parsedData.username;
           
            fs.open(contactPath + `/${username}` + ".json", "wx",(err,fd)=>{
               
                fs.writeFile(fd,JSON.stringify(parsedData),(err)=>{
                    if(err){
                        console.log(err);
                    }
                    else{
                        fs.close(fd,(err)=> {
                            if(!err){
                                res.end(`${username} successfully created`);
                            }
                        })
                    }
                })
            })
        }
        // else if()
        else if(req.method === "GET" && pathName === "/users"){
            console.log(parsedURL);
            let username= parsedURL.query.username;
            res.setHeader('Content-Type','text/html')
            if(username){
                
                fs.readFile(__dirname+"/contact"+`/${username}.json`,(err,content) => {
                    console.log(content.toString());
                    let parsedData = JSON.parse(content.toString());
                    Object.keys(parsedData).forEach(key => {
                        res.write(`<h2>${key} : ${parsedData[key]}</h2>`);
                    });
                    res.end();
                })
            }
            else{
                let fileNames = fs.readdirSync(__dirname+"/contact");
                console.log(fileNames);
                let arrayLength = fileNames.length;
                fileNames.forEach((file,id) => {
                    fs.readFile(__dirname+"/contact"+`/${file}`,(err,content)=>{
                        // console.log(content.toString());
                        let parsedData = JSON.parse(content.toString());
                        // console.log(parsedData);
                        if(id <= arrayLength)
                        Object.keys(parsedData).forEach(key => {
                            res.write(`<h2>${key} : ${parsedData[key]}</h2>`);
                        })
                        else{
                            res.end();
                        }
                    })
                })
            }
            
        }

    })
}

server.listen(5000,()=> console.log("listening on server 5k"))