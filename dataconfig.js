const mongoose=require("mongoose");
main().catch((err) =>{ console.log(err)});
async function main()
{
   await  mongoose.connect('mongodb://127.0.0.1:27017/Cap');
    console.log("Data base connected!...!");
}
const pregSchema=new mongoose.Schema({
    fullname:String,
    number:Number,
    service:String,
    email:String,
    place:String,
    device:String,
    amount:Number,
    description:String,
    password:String,
    image:String

},{timestamps:true})

const usrSchema=new mongoose.Schema({
    fullname:String,
    number:Number,
    email:String,
    place:String,
    password:String
},{timestamps:true})

const usrratingSchema=new mongoose.Schema({
    username:String,
    spid:String,
    review:String,
    rating:Number,
})




const pgModel=new mongoose.model('photographer',pregSchema);
const usrModel=new mongoose.model('user',usrSchema);
const usrRatingModel=new mongoose.model('rating',usrratingSchema);

console.log(usrModel)

const bookingSchema=new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:'user'},
    username:String,
    spid:{type:mongoose.Schema.Types.ObjectId,ref:'photographer'},
   date:String,
   advanceamt:{type:String,default:0.0},
   place:String
    
},{timestamps:true})

const  bookingModel=new mongoose.model("booking",bookingSchema)

/* const bookingSchema=new mongoose.Schema({ 
    userid:{type:mongoose.Schema.Types.ObjectId, ref:'user'},
    serviceid:{type:mongoose.Schema.Types.ObjectId, ref:'photographer'},
    Bookingdate:String,
}) */
const phsmaple=new mongoose.Schema({
    phid:{type:mongoose.Schema.Types.ObjectId, ref:'photographer'},
    sample:{type:Array},
    amount:{type:String},

})


const phSampleModel=new mongoose.model("phsample",phsmaple);
module.exports={
    pgModel,
    usrModel,
    usrRatingModel, 
    phSampleModel,
    bookingModel
  };


