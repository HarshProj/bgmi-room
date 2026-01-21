require('dotenv').config();
const mongoose=require('mongoose');
const mongoURI=process.env.MONGO_URI;
// hharshchauhan1_db_user,eWUVYCK3Jv3ZTAvG

const connecttodb=()=>{
    mongoose.connect(mongoURI,{
        useNewUrlParser:true,
        useUnifiedTopology:true
        // console.log("Connected to mongoose succesfully");
    })
    mongoose.connection
    .once("open",()=> console.log("connected"))
    .on("error",error =>{
        console.log("your error",error);
    });
}
module.exports=connecttodb;