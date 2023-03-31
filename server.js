require("dotenv").config();
const bcrypt = require("bcrypt")
const multer = require("multer")
const mongoose= require("mongoose")
const express = require("express");
const File = require("./models/File")
const app= express();
const upload = multer({dest:"uploads"});
 app.use(express.urlencoded({extended:true}))

//const DATABASE_URL="mongodb+srv://sakshig4780:san.deep1@cluster0.sj2rw72.mongodb.net/FileSharing?retryWrites=true&w=majority"

mongoose.connect(process.env.DATABASE_URL,{
    
    useUnifiedTopology: true
}).then(()=>{
    console.log("sucess");

}).catch((err)=>{
    console.log("sucess no" + err.message);
})



app.set("view engine","ejs")

app.get("/",(req,res)=>{
    res.render("index")
})
app.post("/upload",upload.single("file"),async (req,res)=>{
    const fileData={
        path: req.file.path,
        originalName: req.file.originalname,

    }
    if(req.body.password!=null && req.body.password!==""){
        fileData.password= await bcrypt.hash(req.body.password, 10)
    }
    const file = await File.create(fileData);
    res.render("index",{fileLink:`${req.headers.origin}/file/${file.id}`})
})
app.route("/file/:id").get(handleDownload).post(handleDownload);
async function handleDownload(req,res){
    const file = await File.findById(req.params.id);
    if(file.password!=null)
    {
       if(req.body.password==null){
        res.render("password");
        return
       }
       if(!(await bcrypt.compare(req.body.password,file.password)))
       {
        res.render("password",{error: true})
        return
       }
    }

    file.downloadCount++;
    await file.save();
    console.log(file.downloadCount);
    res.download(file.path,file.originalName);
}
app.get("/howtouse",(req,res)=>{
    res.render("howtouse");
   // redirect("/");
});
app.post("/",(req,res)=>{
    res.render("index")
})

app.listen(process.env.PORT)