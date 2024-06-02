const express = require('express');
const cors = require("cors");
const app = express();
const mongoose=require("mongoose")
const uploads = require('./MulterFiles/uploadcode');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { pgModel } = require("./dataconfig");
const { usrModel,phSampleModel, usrRatingModel,bookingModel} = require("./dataconfig");
    
const nodemailer = require('nodemailer');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(express.static('uploads'))
//Registration
app.post("/pgregister", uploads.single('image'), async(req, res) => {
    const {fullname,email,number,service,place,device,amount,description,password}= req.body;
    const image = req.file ? req.file.filename : null;
    const result = await pgModel.find({
        email: email,
      });
      if (result.length > 0) {
        res.json({ status: 0, msg: "Email ALready in Use" });
      } else {
        bcrypt.hash(password, saltRounds, function (err, password) 
        {
            pgModel.create({
            fullname,
            email,
            number,
            service,
            place,
            device,
            amount,
            description,
            password,
            image: image
          });
          res.json({ status: 1, msg: "Thank You for Register Here" });
        });
      }
});



//Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if(email=="admin@gmail.com" && password=="123")
    {
      res.json({ status: 2, msg: "Admin logged in" });
    }
    else if(await pgModel.findOne({ email }))
    {
    const user = await pgModel.findOne({ email });
    if (!user) {
        return res.json({ status: 0, msg: "No valid email" });
    }
    let idn=user._id
    let idname=user.fullname
    bcrypt.compare(password, user.password, function (err, result) {
        if (err) {
            console.error('Error comparing passwords:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else if (result) {
            res.json({ status: 0, msg: "Successfully logged in", "userId": idn,"username":idname});
        } else {
            res.json({ status: 1, msg: "Incorrect password" });
        }
    });
  }
  //NEW
  else if(await usrModel.findOne({ email }))
  {
    const user = await usrModel.findOne({ email });
    if (!user) {
        return res.json({ status: 0, msg: "No valid email" });
    }
    let idn=user._id
    let idname=user.fullname
    bcrypt.compare(password, user.password, function (err, result) {
        if (err) {
            console.error('Error comparing passwords:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else if (result) {
            res.json({ status: 3, msg: "Successfully logged in", "userId": idn,"username":idname});
        } else {
            res.json({ status: 1, msg: "Incorrect password" });
        }
    });
  }
  //
});
//Fetch Service Providers
app.get("/fetchsps", async (req, res) => {
  const result = await pgModel.find();
  if (result.length > 0) {
    res.json(result);
  } else {
    res.json([]);
  }
});

//Delete
app.delete("/deletesp/:userId",async (req,res)=>{
  const idno=req.params.userId
 await pgModel.deleteOne({'_id':idno});
 res.json("Deleted")
})


//UserRegister
app.post("/userregister", async (req, res) => {
  const {fullname,number,email,place,password}= req.body;
  console.log(fullname)
  console.log(number)
  console.log(email)
  const result = await usrModel.find({
  
      email:email
    });
    if (result.length > 0) {
     
      res.json({ status: 0, msg: "Email Already in Use" });
    } else {
      bcrypt.hash(password, saltRounds, function (err, password) 
      {
        
          usrModel.create({
          fullname,
          number,
          email,
          place,
          password,
        });
        res.json({ status: 1, msg: "Thank You for Register Here" });
      });
    }
});

//Get User
app.get("/getUser/:id", async (req, res) => {
  try {
    const idn = req.params.id;
    console.log("ID extracted from params:", idn); // Log idn
    console.log("Request params:", req.params); // Log entire params object
    const result = await pgModel.find({ '_id': idn });
    res.json(result);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// UserEdit
app.post("/empedit", async (req, res) => {
  try {
    const { fullname, email, userid } = req.body;
    console.log(fullname,email,userid);
    if (!fullname || !email || !userid) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log(userid);
    console.log(fullname);
    await pgModel.updateOne({ '_id': userid }, { fullname: fullname, email: email });
    res.json({ success: true, message: "Update successful" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//View Profile
app.get("/profile/:idn", async (req, res) => {
  try {
    const idno = req.params.idn;
    const result = await pgModel.find({ '_id': idno });

    if (result.length > 0) {
      res.json(result);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//View Users
app.get("/viewusrs", async (req, res) => {
  try {
    const result = await usrModel.find();
    if (result.length > 0) {
      res.status(200).json(result); // Send 200 OK status along with the result
    } else {
      res.status(404).json([]); // Send 404 Not Found if no users found
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" }); // Send 500 Internal Server Error if something went wrong
  }
});


//Fetch Photographers
app.get("/fetchpgs", async (req, res) => {
  try {
    const photographers = await pgModel.find({service:"Photographer"});
    
    if (photographers.length > 0) {
      res.json(photographers);
    } else {
      res.status(404).json({ message: "No photographers found" });
    }
  } catch (error) { 
    console.error("Error fetching photographers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



//Fetch Camera Providers
app.get("/fetchcps", async (req, res) => {
  try {
    const cameraowners = await pgModel.find({ service: "CameraOwner" });
    
    if (cameraowners.length > 0) {
      res.json(cameraowners);
    } else {
      res.status(404).json({ message: "No Users found" });
    }
  } catch (error) {
    console.error("Error fetching :", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Add Samples
app.post("/addsamples/:idn",uploads.array('images',4), async(req, res) => {
   const phid=req.params.idn;
   const imagearry=[];
   imagearry.push(req.files)
   
   if(phid){
    phSampleModel.create({
      phid:phid,
      sample:imagearry,
      amount:req.body.amount
    })
    res.json({'status':1,'msg':"upload successfully"})
   }
   else{
    res.json({'status':0,'msg':"not uploaded"})
   }
   
});

//View Samples
app.get("/fetchpgsamples/:idn", async (req, res) => {
  try {
    const idno = req.params.idn;
  
    const result = await phSampleModel.find({ 'phid': idno });

    if (result.length > 0) {
      res.json(result);
    } else {
      res.json([]); // Return an empty array if no sample photographs are found
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


//User ratings
app.post("/userrating", async (req, res) => {
  const {username,spid,review,rating}= req.body;
  console.log(username)
  console.log(spid)
  console.log(review)
  console.log(rating)
  usrRatingModel.create({
          username,
          spid,
          review,
          rating
        });
        res.json({ msg: "Thank You for  Adding review" });
      });
      app.get("/viewrating/:id", async (req, res) => {
        const id = req.params.id;
        console.log(id);
        try {
            const result = await usrRatingModel.find({ spid: id });
            if (result.length > 0) {
                res.status(200).json(result); // Send 200 OK status along with the result
            } else {
                res.status(200).json(["msg:no users"]); // Send 404 Not Found if no users found
            }
        } catch (error) {
            console.error("Error fetching reviews", error);
            res.status(500).json({ error: "Internal server error" }); // Send 500 Internal Server Error if something went wrong
        }
    });
    
    app.post("/bookpgsample", async (req, res) => {
      try {
        const { userId, spid, username, date, advanceamt, place } = req.body;
        const booking = await bookingModel.create({
          userId,
          spid,
          username,
          date,
          advanceamt,
          place
        });
        res.json({ msg: "Booking Confirmed", booking });
      } catch (error) {
       
        console.error("Error creating booking:", error);
        res.status(500).json({ error: "Error creating booking" });
      }
    });
      app.get("/viewbookings/:id", async (req, res) => {
        const id = req.params.id;
        console.log(id);
        try {
            const result = await bookingModel.find({ spid: id }).populate('spid');
            if (result.length > 0) {
                res.status(200).json(result); // Send 200 OK status along with the result
            } else {
                res.status(404).json({ message: "This person is not booked" }); // Send 404 Not Found with a message
            }
        } catch (error) {
            console.error("Error fetching bookings", error);
            res.status(500).json({ error: "Internal server error" }); // Send 500 Internal Server Error if something went wrong
        }
    });
    

      app.get("/viewmybookings/:name", async (req, res) => {
        const name = req.params.name;
        console.log(name)
        try {
            const result = await bookingModel.find({ username: name }).populate("spid");
            console.log(result)
            if (result.length > 0) {
                // Process the result and send it back
                res.status(200).json(result);
            } else {
                // If no bookings found for the user, send a message
                res.status(404).json({ message: "No bookings found for this user" });
            }
        } catch (error) {
            console.error("Error fetching bookings", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });



    app.get("/viewpgbookings/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      try {
          const result = await bookingModel.find({ spid: id }).populate("spid").populate("userId")
          if (result.length > 0) {
              res.status(200).json(result); // Send 200 OK status along with the result
          } else {
              res.status(404).json({ message: "This person is not booked" }); // Send 404 Not Found with a message
          }
      } catch (error) {
          console.error("Error fetching bookings", error);
          res.status(500).json({ error: "Internal server error" }); // Send 500 Internal Server Error if something went wrong
      }
    });
    
    app.get("/viewreport", async (req, res) => {
      try {
          const result = await bookingModel.find().populate("spid").populate("userId")

          if (result.length > 0) {
            const tot = await bookingModel.aggregate([
              {
                $group: {
                  _id: null,
                  total: { $sum: '$advanceamt' }
                }
              }
            ]);
               console.log(tot[0].total)
              res.status(200).json({result:result,total:tot[0].total}); // Send 200 OK status along with the result
          } else {
              res.status(404).json({ message: "This person is not booked" }); // Send 404 Not Found with a message
          }
      } catch (error) {
          console.error("Error fetching bookings", error);
          res.status(500).json({ error: "Internal server error" }); // Send 500 Internal Server Error if something went wrong
      }
    });
     
      
app.listen(9000,()=>{
  console.log("Server Running http://localhost:9000/")
  console.log("Connected Successfully"); 
})


